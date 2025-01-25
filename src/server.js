const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Grid = require("gridfs-stream");
const cors = require("cors");
const path = require("path");
const colors = require("colors")
const morgan = require("morgan"); 

const app = express();
// Configuration de Morgan pour la journalisation en mode 'dev'
app.use(morgan('dev'));

// Configuration des options CORS
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "https://e-permis-rdc-frontend.vercel.app"
  ],
  optionsSuccessStatus: 200, // Pour certaines anciennes implémentations de navigateurs
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

// Utilisation de CORS avec les options spécifiées
app.use(cors(corsOptions));
app.use(express.json());

// Connexion à MongoDB
const mongoURI =
  "mongodb+srv://alexsms007:123epermisrdc123@epermis-rdc-cluster.5ypsc.mongodb.net/SAVE-DOC?retryWrites=true&w=majority&appName=ePermis-RDC-Cluster";

const conn = mongoose.createConnection(mongoURI);

// Initialiser GridFS
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log(`✅ MongoDB connecté et GridFS initialisé.`.bgBlue.bold);
});

conn.on('error', (err) => {
  console.error(`❌ Erreur de connexion à MongoDB:`.bgYellow, err);
});

// Configuration de Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo
});

// Accueil
app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur l'api Upload" });
});

// Route pour uploader un fichier
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier uploadé" });
  }

  const writeStream = gfs.createWriteStream({
    filename: req.file.originalname,
    content_type: req.file.mimetype,
  });

  writeStream.write(req.file.buffer);
  writeStream.end();

  writeStream.on("close", (file) => {
    res.status(201).json({ file });
  });

  writeStream.on("error", (err) => {
    res.status(500).json({ message: "Erreur lors de l'upload", error: err });
  });
});

// Route pour lister tous les fichiers
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "Aucun fichier trouvé" });
    }
    res.json(files);
  });
});

// Route pour télécharger/visualiser un fichier
app.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    const readstream = gfs.createReadStream(file.filename);
    res.set("Content-Type", file.contentType);
    return readstream.pipe(res);
  });
});

// Après les routes
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'La taille du fichier dépasse 8 Mo.' });
  }
  next(err);
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`.bgGreen.bold));
