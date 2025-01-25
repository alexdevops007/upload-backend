// models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  data: { type: Buffer, required: true },
});

module.exports = mongoose.model("Document", DocumentSchema);
