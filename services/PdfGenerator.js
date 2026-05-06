const SummaryPage = require("./SummaryPage");
const DetailedPage = require("./DetailedPage");
const PDFDocument = require("pdfkit-table");
const {numberOfRecordsInSummary, dataSourceFileName} = require('../constants')
const fs = require('fs');

class PdfGenerator {
  constructor() { }

  async generatePdf(fileName) {
    try {
      const startTime = Date.now();
      const files = fileName
        ? [fileName]
        : (await fs.promises.readdir('data')).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const data = fileName
          ? await fs.promises.readFile(`data/${dataSourceFileName}`, 'utf8')
          : await fs.promises.readFile(`data/${file}`, 'utf8');
        const jsonData = JSON.parse(data);
        new SummaryPage().generatePdf(jsonData);

        // A4 595.28 x 841.89
        const doc = new PDFDocument({size: 'A4', margins: {
          bottom: 0,
        }});

        doc.registerFont('synthese-light', 'fonts/Synthese-Light.otf');
        doc.registerFont('synthese-bold', 'fonts/Synthese-Bold.ttf');
        doc.registerFont('flecha-m', 'fonts/FlechaM-Medium.otf');
        doc.registerFont('synthese-light-bold', 'fonts/synthese-regular-TRIAL-BF63b781e43e16d.otf');
        doc.pipe(fs.createWriteStream(`pdfs/detailed/${jsonData?.saleYear}-${jsonData?.saleName}-Lot ${jsonData?.saleLotCode}-Detailed.pdf`));

        const analysisData = jsonData.analysis_data.slice(0, numberOfRecordsInSummary);
        for(let i = 0; i < analysisData.length; i++) {
          new DetailedPage().generatePdf(doc, analysisData[i], i);
          if(i != analysisData.length - 1) doc.addPage({size: 'A4', margins: { bottom: 0}});
        }
        doc.end();
      }
      console.log(`Total execution time - ${(Date.now() - startTime)/1000}s`)
    } catch (err) {
      console.error('Error reading JSON file:', err);
    }
  }
}

module.exports = PdfGenerator;
