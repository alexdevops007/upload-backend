// server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const documentsRoute = require("./routes/documents");
require("dotenv").config();
const colors = require("colors");
const morgan = require("morgan");

const app = express();

// Configuration de Morgan pour la journalisation en mode 'dev'
app.use(morgan("dev"));

// Configuration des options CORS
const corsOptions = {
  origin: ["http://localhost:8081", "https://upload-frontend-teal.vercel.app"],
  optionsSuccessStatus: 200, // Pour certaines anciennes implémentations de navigateurs
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

// Utilisation de CORS avec les options spécifiées
app.use(cors(corsOptions));
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Routes
app.use("/api/documents", documentsRoute);

// Page d'accueil
app.get("/", (req, res) => {
  res.send("API de Téléchargement de Documents pour Permis d'Exploitation.");
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée." });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`.bgGreen);
});
