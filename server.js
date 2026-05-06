// Import required modules
const express = require('express');
const Mustache = require("mustache");
const path = require("path");
const PdfGenerator = require("./services/PdfGenerator");
const {createDirectoryIfNotExists} = require('./utils/FileUtils');
const {dataSourceFileName} = require('./constants')

// Create an instance of Express
const app = express();
createDirectoryIfNotExists('./pdfs');

// Define a port number
const PORT = process.env.PORT || 3000;

// Define a route
app.get('/', async (req, res) => {
  const reqParams = req.query;
  new PdfGenerator().generatePdf(dataSourceFileName);
  res.send('Files generated!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Goldmine server started on port: ${PORT}`);
});

new PdfGenerator().generatePdf();