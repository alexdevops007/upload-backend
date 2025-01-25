// routes/documents.js
const express = require("express");
const multer = require("multer");
const Document = require("../models/Document");

const router = express.Router();

// Configuration de multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// Upload d'un document
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé." });
    }

    const document = new Document({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
    });

    await document.save();
    res.status(201).json({ message: "Fichier téléchargé avec succès." });
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "La taille du fichier dépasse 8MB." });
    }
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors du téléchargement du fichier." });
  }
});

// Récupérer tous les documents
router.get("/", async (req, res) => {
  try {
    const documents = await Document.find().select("-data"); // Exclure les données binaires
    res.json(documents);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des documents." });
  }
});

// Récupérer un document spécifique
router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document non trouvé." });
    }
    res.set("Content-Type", document.mimeType);
    res.send(document.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du document." });
  }
});

module.exports = router;
