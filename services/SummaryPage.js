const fs = require('fs');
const PDFDocument = require("pdfkit-table");
const {numberOfRecordsInSummary} = require('../constants');
const { getSignXLocation, convertStringsToPascal, toPascalCase } = require('../utils/TextFormatter');
const leftStart = 32;

class FirstPage {
  constructor() { }

  generatePdf(jsonData) {
    try {
      // A4 -> 595.28 x 841.89
      const doc = new PDFDocument({size: 'A4', margins: {
        bottom: 0,
      }});

      doc.registerFont('synthese-light', 'fonts/Synthese-Light.otf');
      doc.registerFont('synthese-bold', 'fonts/Synthese-Bold.ttf');
      doc.registerFont('flecha-m', 'fonts/FlechaM-Medium.otf');
      doc.registerFont('synthese-light-bold', 'fonts/synthese-regular-TRIAL-BF63b781e43e16d.otf');
      const allJsonData = jsonData.analysis_data.slice(0, numberOfRecordsInSummary);

      doc.pipe(fs.createWriteStream(`pdfs/${jsonData?.saleYear}-${jsonData?.saleName}-Lot ${jsonData?.saleLotCode}-Summary.pdf`));
      const firstItem = allJsonData[0];

      const headerData = convertStringsToPascal(firstItem['headerData']);
      const hypoPedigreeChart = firstItem['hypoPedigreeChart'];
      doc.fontSize(20).font('flecha-m').fillColor('#1D472E').text(`Lot ${jsonData['saleLotCode']}`, leftStart, 40);
      doc.image('assets/GoldMineImage.png', 440, 35, {width: 120});
      
      doc.fontSize(32).font('flecha-m').fillColor('#1D472E').text(headerData?.broodmareName, leftStart, 81);
      const pedigrees = hypoPedigreeChart?.mareInfo.pedigree;
      const SPositionHorse = pedigrees.find(item => item.position === 'S');
      const DPositionHorse = pedigrees.find(item => item.position === 'D');
      doc.fontSize(24).font('synthese-light').fillColor('#1D472E').text(`(${headerData?.broodmareCoB}, ${headerData?.broodmareYoB}, ${toPascalCase(SPositionHorse.horseName)} X ${toPascalCase(DPositionHorse.horseName)})`, leftStart, 110);

      doc.fontSize(18).font('flecha-m').fillColor('#1D472E').text('Stallions Analysis Summary', leftStart, 174.5);
      
      const tableColumnTextPositionX = 43;
      const firstColumnTextPosition = 43;
      const secondColumnTextPosition = 126.15;
      const thirdColumnTextPosition = 229;
      const fourthColumnTextPosition = 320;
      const fifthColumnTextPosition = 406;
      const sixthColumnTextPosition = 510;
      doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('Horse', firstColumnTextPosition, 206.31, {
        baseline: 'hanging'
      });
      doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('Farm', secondColumnTextPosition, 206.31, {
        baseline: 'hanging'
      });
      doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('Fee', thirdColumnTextPosition, 206.31, {
        baseline: 'hanging'
      });
      doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('Stallion Match', fourthColumnTextPosition, 206.31, {
        baseline: 'hanging'
      });
      doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('Impact Profile', fifthColumnTextPosition, 206.31, {
        baseline: 'hanging'
      });
      doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('Avg. Winning Distance', 493, 206.31, {
        baseline: 'hanging'
      });
      // doc.roundedRect(30, 230, 535, .001, 0).fillAndStroke("#B0B6AF", "#B0B6AF");
      doc.lineWidth(.1);
      doc.moveTo(32, 221.37).lineTo(32, 221.37).lineTo(565, 221.37).fillAndStroke("#B0B6AF", "#B0B6AF");

      let tableColumnTextPositionY = 230;
      let roundedRectPositionY = 225.14;

      allJsonData.forEach((item, index) => {
        const headerData = item['headerData'];
        roundedRectPositionY = 225.14 + 22.86 * index;
        doc.roundedRect(32, roundedRectPositionY, 535, 18.83, 5).fillAndStroke("#F4F1EF", "#F4F1EF");
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text(toPascalCase(headerData?.stallionName), tableColumnTextPositionX, tableColumnTextPositionY+ 22.86 * index);
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text(toPascalCase(headerData?.farmName), secondColumnTextPosition, tableColumnTextPositionY + 22.86 * index);
        let studFee = headerData?.studFee;
        if(studFee.includes('A$')) {
          studFee = studFee.replace('A$', 'AUD ');
        }
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text(studFee, thirdColumnTextPosition, tableColumnTextPositionY + 22.86 * index);
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text(headerData?.smRating, fourthColumnTextPosition, tableColumnTextPositionY + 22.86 * index);
        
        const impactProfileSummary = item['impactProfileSummary'];
        let totalColorWidth = 60;
        let yellow = impactProfileSummary.gold;
        let green = impactProfileSummary.green;
        let red = impactProfileSummary.red;
  
        let unitWidth = totalColorWidth / (yellow + green + red + 18);
        let yellowLength = (yellow + 6) * unitWidth;
        let greenLength = (green + 6) * unitWidth;
        let redLength = (red  + 6) * unitWidth;
        let totalEmptyLengths = 0;
        let totalNonEmptyValues = 0;
        if(!(red || green || yellow)) {
          yellowLength = redLength = greenLength = 20;
        } else {
          if(!yellow) {
            yellowLength = 6;
            totalEmptyLengths += 6;
          } else {
            totalNonEmptyValues += yellow;
          }
          if(!green) {
            greenLength = 6;
            totalEmptyLengths += 6;
          }else {
            totalNonEmptyValues += green;
          }
          if(!red) {
            redLength = 6;
            totalEmptyLengths += 6;
          } else {
            totalNonEmptyValues += red;
          }
          totalColorWidth = totalColorWidth - totalEmptyLengths;
          unitWidth = totalColorWidth / totalNonEmptyValues;
          if(yellow) {
            yellowLength = unitWidth * yellow;
          }
          if(red) {
            redLength = unitWidth * red;
          }
          if(green) {
            greenLength = unitWidth * green;
          }
        }
        doc.roundedRect(fifthColumnTextPosition, roundedRectPositionY + 3.86, yellowLength, 12, 0).fillAndStroke("#FADC19", "#FADC19");
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text(yellow, fifthColumnTextPosition + (yellowLength / (yellowLength > 8 ? 2 : 4)), tableColumnTextPositionY + 22.86 * index);
        doc.roundedRect(fifthColumnTextPosition + yellowLength, roundedRectPositionY + 3.86, greenLength, 12, 0).fillAndStroke("#9FDB1D", "#9FDB1D");
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text(green, fifthColumnTextPosition + yellowLength + (greenLength / (greenLength > 8 ? 2 : 4)), tableColumnTextPositionY + 22.86 * index);
        doc.roundedRect(fifthColumnTextPosition + yellowLength + greenLength, roundedRectPositionY + 3.86, redLength, 12, 0).fillAndStroke("#F53F3F", "#F53F3F");
        doc.fontSize(6.59).font('synthese-light').fillColor('white').text(red, fifthColumnTextPosition + yellowLength + greenLength + (redLength / (redLength > 8 ? 2 : 4)), tableColumnTextPositionY + 22.86 * index);
        
        const distanceProfile = item['distanceProfile'];
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text(distanceProfile?.averageDistance + 'm', sixthColumnTextPosition, tableColumnTextPositionY + 22.86 * index);
      })
      
      doc.image('assets/GoldMineImage.png', 32, 798, {width: 81.5});
      doc.fontSize(6).font('synthese-light').fillColor('#161716').text(`Created ${firstItem.createdOn}. Note pedigree updates past this date are excluded. Visit www.g1goldmine.com for updated information.`, 200, 800);
      // doc
      //   .fillColor('blue')
      //   .text('Here is a link!', 100, 100)
      //   .link(100, 100, 160, 27, 'http://google.com/');
      doc.end();
      console.log('Summary Completed....')
    } catch (error) {
      console.error('Error occurred during PDF creation:', error);
    }
  }
}

module.exports = FirstPage;
