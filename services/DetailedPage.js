const fs = require('fs');
const PDFDocument = require("pdfkit-table");
const { getSignXLocation, convertStringsToPascal, toPascalCase } = require('../utils/TextFormatter');

const leftStart = 32;

class DetailedPage {
  constructor() { }

  generatePdf(doc, jsonData, index) {
    try {
        const headerData = convertStringsToPascal(jsonData['headerData']);
        doc.fontSize(32).font('flecha-m').fillColor('#1D472E').text(headerData?.stallionName + ' x ' + headerData?.broodmareName, 32, 31);

        // width of each title = 458/4 = 114.5
        doc.fontSize(9.36).font('synthese-bold').fillColor('#1D472E').text('Stallion:', 32, 83);
        doc.fontSize(9.36).font('synthese-light').fillColor('#1D472E').text(headerData?.stallionName, 32, 97);
        
        doc.fontSize(9.36).font('synthese-bold').fillColor('#1D472E').text('Standing:', 150.68, 83);
        doc.fontSize(9.36).font('synthese-light').fillColor('#1D472E').text(headerData?.farmName, 150.68, 97);

        let studFee = headerData?.studFee;
        if(studFee.includes('A$')) {
          studFee = studFee.replace('A$', 'AUD ');
        }
        doc.fontSize(9.36).font('synthese-bold').fillColor('#1D472E').text('Stud Fee:', 264.98, 83);
        doc.fontSize(9.36).font('synthese-light').fillColor('#1D472E').text(studFee, 264.98, 97);

        doc.fontSize(9.36).font('synthese-bold').fillColor('#1D472E').text('SW/Rnrs:', 356, 83);
        if(!headerData?.sireSwRnrRate || headerData?.sireSwRnrRate?.trim() === '-') {
          doc.fontSize(9.36).font('synthese-light').fillColor('#1D472E').text(headerData?.sireSwRnrRate, 356, 97);
        } else {
          doc.fontSize(9.36).font('synthese-light').fillColor('#1D472E').text(headerData?.sireSwRnrRate, 356, 97, {continued: true}).font('Symbol').text('%', getSignXLocation(356, headerData?.sireSwRnrRate, true), 107.5);
        }

        doc.fontSize(9.36).font('synthese-bold').fillColor('#1D472E').text('Rating:', 32, 118.11);
        doc.fontSize(9.36).font('synthese-light').fillColor('#1D472E').text(headerData?.hypoRating, 32, 132.16, {continued: true}).font('Symbol').text('%', getSignXLocation(32, headerData?.hypoRating, true), 143.16);

        // 20/20 match badge
        if(headerData?.smRating) {
          if(headerData?.smRating?.toLowerCase().includes('perfect')) {
            // perfect match badge
            doc.roundedRect(443, 87, 107, 34, 3).fillAndStroke("#2EFFB4", "#2EFFB4");
            doc.image('assets/Fire.png', 453, 94.72, {width: 18.38, height: 18.38});
            doc.fontSize(10).font('synthese-bold').fillColor('#1D472E').text(headerData?.smRating, 474.4, 95.72);
          } else {
            doc.roundedRect(443, 87, 107, 34, 3).fillAndStroke("#1D472E", "#1D472E");
            doc.image('assets/LighteningBolt.png', 453, 94.72, {width: 18.38, height: 18.38});
            doc.fontSize(10).font('synthese-bold').fillColor('#FFFFFF').text(headerData?.smRating, 474.4, 95.72);
          }
        }

        // ----------------------------- Pedigree table --------------------------- //
        const emptyHorse = {
            horseID: 37140,
            horseName: '',
            position: 'DDD',
            gen: 3,
            label: null,
            colourCellIn: 'F4F1EF'
        };
        const hypoPedigreeChart = jsonData['hypoPedigreeChart'];
        const sireInfo = hypoPedigreeChart['sireInfo'];
        const mareInfo = hypoPedigreeChart['mareInfo'];
        // first column
        const sireH = sireInfo['pedigree'].find(a => a.position === 'H') || emptyHorse;
        doc.roundedRect(57, 199.5, 116.39, 18.33, 0).fillAndStroke('#' + sireH.colourCellIn, '#' + sireH.colourCellIn);
        doc.fontSize(6.67).font('synthese-light').fillColor('#161716').text(toPascalCase(sireH.horseName), 59, 199.2);
        doc.fontSize(4.76).font('synthese-light').fillColor('#005632').text(sireH.label || '', 59, 208.8);
        doc.lineWidth(1);
        doc.moveTo(56.5, 199.5 + 18.33).lineTo(56.5, 199.5 + 18.33).lineTo(173.69, 199.5 + 18.33).fillAndStroke("#1D472E", "#1D472E");

        // middle line
        doc.lineWidth(.1);
        doc.moveTo(57, 268.19).lineTo(57, 268.19).lineTo(527.38, 268.19).fillAndStroke("#C5CFC4", "#C5CFC4");

        const mareH = mareInfo['pedigree'].find(a => a.position === 'H') || emptyHorse;
        doc.roundedRect(57, 319.5, 116.39, 18.33, 0).fillAndStroke("#" + mareH.colourCellIn);
        doc.fontSize(6.67).font('synthese-light').fillColor('#161716').text(toPascalCase(mareH.horseName), 59, 319.5);
        doc.fontSize(4.76).font('synthese-light').fillColor('#005632').text(mareH.label || '', 59, 331);
        // doc.lineWidth(1);
        // doc.moveTo(57, 319.5 + 18.33).lineTo(57, 319.5 + 18.33).lineTo(173.69, 319.5 + 18.33).fillAndStroke("#1D472E", "#1D472E");

        // second column
          // first level
          const sireS = sireInfo['pedigree'].find(a => a.position === 'S') || emptyHorse;
          doc.roundedRect(175, 171.21, 116.39, 14.9, 0).fillAndStroke("#" + sireS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireS.horseName), 177, 171.21);
          doc.fontSize(4.76).font('synthese-light').fillColor('#005632').text(sireS.label || '', 177, 179.21);
        
          doc.lineWidth(1);
          doc.moveTo(175, 171.21 + 14.9).lineTo(175, 171.21 + 14.9).lineTo(175 + 116.39, 171.21 + 14.9).fillAndStroke("#1D472E", "#1D472E");

          doc.lineWidth(.1);
          doc.moveTo(175, 208.19).lineTo(175, 208.19).lineTo(527.38, 208.19).fillAndStroke("#C5CFC4", "#C5CFC4");
          
          const sireD = sireInfo['pedigree'].find(a => a.position === 'D') || emptyHorse;
          doc.roundedRect(175, 231.21, 116.39, 14.9, 0).fillAndStroke("#" + sireD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireD.horseName), 177, 231.21);
          doc.fontSize(4.76).font('synthese-light').fillColor('#005632').text(sireD.label || '', 177, 239.21);

          // doc.lineWidth(1);
          // doc.moveTo(175, 231.21 + 14.9).lineTo(175, 231.21 + 14.9).lineTo(175 + 116.39, 231.21 + 14.9).fillAndStroke("#1D472E", "#1D472E");

          // second level
          const mareS = mareInfo['pedigree'].find(a => a.position === 'S') || emptyHorse;
          doc.roundedRect(175, 291.21, 116.39, 14.9, 0).fillAndStroke("#" + mareS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareS.horseName), 177, 291.21);
          doc.fontSize(4.76).font('synthese-light').fillColor('#005632').text(mareS.label || '', 177, 299.21);
          doc.lineWidth(1);
          doc.moveTo(175, 291.21 + 14.9).lineTo(175, 291.21 + 14.9).lineTo(175 + 116.39, 291.21 + 14.9).fillAndStroke("#1D472E", "#1D472E");

          doc.lineWidth(.1);
          doc.moveTo(175, 328.19).lineTo(175, 328.19).lineTo(527.38, 328.19).fillAndStroke("#C5CFC4", "#C5CFC4");

          const mareD = mareInfo['pedigree'].find(a => a.position === 'D') || emptyHorse;
          doc.roundedRect(175, 351.21, 116.39, 14.9, 0).fillAndStroke("#" + mareD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareD.horseName), 177, 351.21);
          doc.fontSize(4.76).font('synthese-light').fillColor('#005632').text(mareD.label || '', 177, 359.21);
          // doc.lineWidth(1);
          // doc.moveTo(175, 351.21 + 14.9).lineTo(175, 351.21 + 14.9).lineTo(175 + 116.39, 351.21 + 14.9).fillAndStroke("#1D472E", "#1D472E");

        // third column
          const thirdColumnHeight = 8;
          // first level
          const sireSS = sireInfo['pedigree'].find(a => a.position === 'SS') || emptyHorse;
          doc.roundedRect(292.61, 160, 116.39, thirdColumnHeight, 0).fillAndStroke("#" + sireSS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireSS.horseName), 294.61, 160);
          // doc.lineWidth(1);
          // doc.moveTo(292.61, 160 + thirdColumnHeight).lineTo(292.61, 160 + thirdColumnHeight).lineTo(292.61 + 116.39, 160 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          doc.lineWidth(.1);
          doc.moveTo(292.99, 178.19).lineTo(292.99, 178.19).lineTo(527.38, 178.19).fillAndStroke("#C5CFC4", "#C5CFC4");

          const sireSD = sireInfo['pedigree'].find(a => a.position === 'SD') || emptyHorse;
          doc.roundedRect(292.61, 189.88, 116.39, thirdColumnHeight, 0).fillAndStroke("#" + sireSD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireSD.horseName), 294.61, 189.88);
          // doc.lineWidth(1);
          // doc.moveTo(292.61, 189.88 + thirdColumnHeight).lineTo(292.61, 189.88 + thirdColumnHeight).lineTo(292.61 + 116.39, 189.88 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // second level
          const sireDS = sireInfo['pedigree'].find(a => a.position === 'DS') || emptyHorse;
          doc.roundedRect(292.61, 219.19, 116.39, thirdColumnHeight, 0).fillAndStroke("#" + sireDS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireDS.horseName), 294.61, 219.19);
          doc.lineWidth(1);
          doc.moveTo(292.61, 219.19 + thirdColumnHeight).lineTo(292.61, 219.19 + thirdColumnHeight).lineTo(292.61 + 116.39, 219.19 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          doc.lineWidth(.1);
          doc.moveTo(292.99, 238.19).lineTo(292.99, 238.19).lineTo(527.38, 238.19).fillAndStroke("#C5CFC4", "#C5CFC4");

          const sireDD = sireInfo['pedigree'].find(a => a.position === 'DD') || emptyHorse;
          doc.roundedRect(292.61, 249.18, 116.39, thirdColumnHeight, 0).fillAndStroke("#" + sireDD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireDD.horseName), 294.61, 249.18);
          // doc.lineWidth(1);
          // doc.moveTo(292.61, 249.19 + thirdColumnHeight).lineTo(292.61, 249.19 + thirdColumnHeight).lineTo(292.61 + 116.39, 249.19 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // third level
          const mareSS = mareInfo['pedigree'].find(a => a.position === 'SS') || emptyHorse;
          doc.roundedRect(292.61, 279.18, 116.39, thirdColumnHeight, 0).fillAndStroke("#" + mareSS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareSS.horseName), 294.61, 279.18);
          doc.lineWidth(1);
          doc.moveTo(292.61, 279.19 + thirdColumnHeight).lineTo(292.61, 279.19 + thirdColumnHeight).lineTo(292.61 + 116.39, 279.19 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          doc.lineWidth(.1);
          doc.moveTo(292.99, 298.19).lineTo(292.99, 298.19).lineTo(527.38, 298.19).fillAndStroke("#C5CFC4", "#C5CFC4");

          const mareSD = mareInfo['pedigree'].find(a => a.position === 'SD') || emptyHorse;
          doc.roundedRect(292.61, 309.18, 116, thirdColumnHeight, 0).fillAndStroke("#" + mareSD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareSD.horseName), 294.61, 309.18);
          // doc.lineWidth(1);
          // doc.moveTo(292.61, 309.19 + thirdColumnHeight).lineTo(292.61, 309.19 + thirdColumnHeight).lineTo(292.61 + 116.39, 309.19 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // fourth level
          const mareDS = mareInfo['pedigree'].find(a => a.position === 'DS') || emptyHorse;
          doc.roundedRect(292.61, 339.18, 116.39, thirdColumnHeight, 0).fillAndStroke("#" + mareDS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareDS.horseName), 294.61, 339.18);
          doc.lineWidth(1);
          doc.moveTo(292.61, 339.19 + thirdColumnHeight).lineTo(292.61, 339.19 + thirdColumnHeight).lineTo(292.61 + 116.39, 339.19 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          doc.lineWidth(.1);
          doc.moveTo(292.99, 358.19).lineTo(292.99, 358.19).lineTo(527.38, 358.19).fillAndStroke("#C5CFC4", "#C5CFC4");
          
          const mareDD = mareInfo['pedigree'].find(a => a.position === 'DD') || emptyHorse;
          doc.roundedRect(292.61, 369.18, 116.39, thirdColumnHeight, 0).fillAndStroke("#" + mareDD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareDD.horseName), 294.61, 369.18);
          // doc.lineWidth(1);
          // doc.moveTo(292.61, 369.19 + thirdColumnHeight).lineTo(292.61, 369.19 + thirdColumnHeight).lineTo(292.61 + 116.39, 369.19 + thirdColumnHeight).fillAndStroke("#1D472E", "#1D472E");

        
        // fourth column
          const fourthColumnHeight = 8;
          const fourthColumnRectStart = 411;
          // first level
          const sireSSS = sireInfo['pedigree'].find(a => a.position === 'SSS') || emptyHorse;
          doc.roundedRect(411, 152, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireSSS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireSSS.horseName), 411, 152);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 152 + fourthColumnHeight).lineTo(fourthColumnRectStart, 152 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 152 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          const sireSSD = sireInfo['pedigree'].find(a => a.position === 'SSD') || emptyHorse;
          doc.roundedRect(411, 166.28, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireSSD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireSSD.horseName), 411, 166.28);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 166.28 + fourthColumnHeight).lineTo(fourthColumnRectStart, 166.28 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 166.28 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // second level
          const sireSDS = sireInfo['pedigree'].find(a => a.position === 'SDS') || emptyHorse;
          doc.roundedRect(411, 182.05, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireSDS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireSDS.horseName), 411, 182.05);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 182.05 + fourthColumnHeight).lineTo(fourthColumnRectStart, 182.05 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 182.05 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          const sireSDD = sireInfo['pedigree'].find(a => a.position === 'SDD') || emptyHorse;
          doc.roundedRect(411, 196.81, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireSDD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireSDD.horseName), 411, 196.81);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 196.81 + fourthColumnHeight).lineTo(fourthColumnRectStart, 196.81 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 196.81 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // third level
          const sireDSS = sireInfo['pedigree'].find(a => a.position === 'DSS') || emptyHorse;
          doc.roundedRect(411, 212.05, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireDSS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireDSS.horseName), 411, 212.05);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 212.05 + fourthColumnHeight).lineTo(fourthColumnRectStart, 212.05 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 212.05 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          const sireDSD = sireInfo['pedigree'].find(a => a.position === 'DSD') || emptyHorse;
          doc.roundedRect(411, 226.81, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireDSD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireDSD.horseName), 411, 226.81);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 226.81 + fourthColumnHeight).lineTo(fourthColumnRectStart, 226.81 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 226.81 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // fourth level
          const sireDDS = sireInfo['pedigree'].find(a => a.position === 'DDS') || emptyHorse;
          doc.roundedRect(411, 242.04, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireDDS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireDDS.horseName), 411, 242.04);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 242.04 + fourthColumnHeight).lineTo(fourthColumnRectStart, 242.04 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 242.04 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          const sireDDD = sireInfo['pedigree'].find(a => a.position === 'DDD') || emptyHorse;
          doc.roundedRect(411, 256.8, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + sireDDD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(sireDDD.horseName), 411, 256.8);
          doc.lineWidth(1);
          doc.moveTo(fourthColumnRectStart, 256.8 + fourthColumnHeight).lineTo(fourthColumnRectStart, 256.8 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 256.8 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // fifth level
          const mareSSS = mareInfo['pedigree'].find(a => a.position === 'SSS') || emptyHorse;
          doc.roundedRect(411, 272.04, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + mareSSS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareSSS.horseName), 411, 272.04);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 272.04 + fourthColumnHeight).lineTo(fourthColumnRectStart, 272.04 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 272.04 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          const mareSSD = mareInfo['pedigree'].find(a => a.position === 'SSD') || emptyHorse;
          doc.roundedRect(411, 286.32, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + mareSSD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareSSD.horseName), 411, 286.32);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 286.32 + fourthColumnHeight).lineTo(fourthColumnRectStart, 286.32 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 286.32 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // sixth level
          const mareSDS = mareInfo['pedigree'].find(a => a.position === 'SDS') || emptyHorse;
          doc.roundedRect(411, 302.05, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + mareSDS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareSDS.horseName), 411, 302.05);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 302.05 + fourthColumnHeight).lineTo(fourthColumnRectStart, 302.05 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 302.05 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          const mareSDD = mareInfo['pedigree'].find(a => a.position === 'SDD') || emptyHorse;
          doc.roundedRect(411, 316.32, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + mareSDD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareSDD.horseName), 411, 316.32);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 316.32 + fourthColumnHeight).lineTo(fourthColumnRectStart, 316.32 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 316.32 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // sevent level
          const mareDSS = mareInfo['pedigree'].find(a => a.position === 'DSS') || emptyHorse;
          doc.roundedRect(411, 332.05, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + mareDSS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareDSS.horseName), 411, 332.05);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 332.05 + fourthColumnHeight).lineTo(fourthColumnRectStart, 332.05 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 332.05 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
          const mareDSD = mareInfo['pedigree'].find(a => a.position === 'DSD') || emptyHorse;
          doc.roundedRect(411, 346.32, 116, fourthColumnHeight, 0).fillAndStroke("#" + mareDSD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareDSD.horseName), 411, 346.32);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 346.32 + fourthColumnHeight).lineTo(fourthColumnRectStart, 346.32 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 346.32 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          // eighth level
          const mareDDS = mareInfo['pedigree'].find(a => a.position === 'DDS') || emptyHorse;
          doc.roundedRect(411, 362.04, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + mareDDS.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareDDS.horseName), 411, 362.04);
          // doc.lineWidth(1);
          // doc.moveTo(fourthColumnRectStart, 362.04 + fourthColumnHeight).lineTo(fourthColumnRectStart, 362.04 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 362.04 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");

          const mareDDD = mareInfo['pedigree'].find(a => a.position === 'DDD') || emptyHorse;
          doc.roundedRect(411, 376.32, 116.39, fourthColumnHeight, 0).fillAndStroke("#" + mareDDD.colourCellIn);
          doc.fontSize(5.71).font('synthese-light').fillColor('#161716').text(toPascalCase(mareDDD.horseName), 411, 376.32);
          doc.lineWidth(1);
          doc.moveTo(fourthColumnRectStart, 376.32 + fourthColumnHeight).lineTo(fourthColumnRectStart, 376.32 + fourthColumnHeight).lineTo(fourthColumnRectStart + 116.39, 376.32 + fourthColumnHeight).fillAndStroke("#1D472E", "#1D472E");
          
        
        // ----------------------------- Similar Stakes Winners --------------------------- //
        // Table Data
        doc.fontSize(14).font('flecha-m').fillColor('#1D472E').text('Similar Stakes Winners', 32, 412);

        let tableColumnTextPositionX = 32;
        const secondColumnX = 109.51;
        const thirdColumnX = 125.83;
        const fourthColumnX = 142.15;
        const fifthColumnX = 158.47;
        const sixthColumnX = 173.79;
        doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('HORSE', tableColumnTextPositionX, 435);
        doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('G1', secondColumnX, 435);
        doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('G2', thirdColumnX, 435);
        doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('G3', fourthColumnX, 435);
        doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('L', fifthColumnX, 435);
        doc.fontSize(6).font('synthese-bold').fillColor('#1D472E').text('Similarity', sixthColumnX, 435);
        // doc.roundedRect(30, 230, 535, .001, 0).fillAndStroke("#B0B6AF", "#B0B6AF");
        
        doc.lineWidth(.1);
        doc.moveTo(32, 451.32).lineTo(32, 451.32).lineTo(206.91, 451.32).fillAndStroke("#B0B6AF", "#B0B6AF");

        const similarStakesWinnersTable = jsonData['similarStakesWinnersTable'];
        let tableColumnTextPositionY = 457;
        let rowPositionY = 455;
        similarStakesWinnersTable.sort((a, b) => b.similarity.similarityValue - a.similarity.similarityValue);
        similarStakesWinnersTable.slice(0, 21).forEach( (item, index) => {
            tableColumnTextPositionY = 457 + 15 * index;
            rowPositionY = 455 + 15 * index;
            let g1 = item.g1;
            let g2 = item.g2;
            let g3 = item.g3;
            let L = item.l;
            let similarity = item.similarity?.similarityPercentage;
            let horseSex = item.horseSex;
            let horseSexColor = horseSex === 'M' ? '#3139DA' : '#D5582A';
            let horseName = toPascalCase(item.horseName);
            doc.roundedRect(32, rowPositionY, 175, 13, 4.08).fillAndStroke("#F4F1EF", "#F4F1EF");
            doc.fontSize(6.12).font('synthese-light').fillColor('#161716').text(horseName, tableColumnTextPositionX + 4, tableColumnTextPositionY, {continued: true}).fillColor(horseSexColor).text(` ${horseSex}`);
            doc.fontSize(6.12).font('synthese-light').fillColor('#161716').text(g1, secondColumnX, tableColumnTextPositionY);
            doc.fontSize(6.12).font('synthese-light').fillColor('#161716').text(g2, thirdColumnX, tableColumnTextPositionY);
            doc.fontSize(6.12).font('synthese-light').fillColor('#161716').text(g3, fourthColumnX, tableColumnTextPositionY);
            doc.fontSize(6.12).font('synthese-light').fillColor('#161716').text(L, fifthColumnX, tableColumnTextPositionY);
            doc.fillColor('#161716')
            .text(similarity, sixthColumnX + 4, tableColumnTextPositionY, {
                continued: true
            }).font('Symbol').text('%', getSignXLocation(sixthColumnX + 4, similarity), tableColumnTextPositionY + 7);
        })
        
        // ----------------------------- Impact Profile Summary --------------------------- //
        // Impact profile summary
        const impactProfileSummary = jsonData['impactProfileSummary'];
        doc.fontSize(14).font('flecha-m').fillColor('#1D472E').text('Impact Profile Summary', 244, 412);
        doc.fontSize(7.5).font('synthese-light').fillColor('#161716').text('20 crucial crosses within 4 generations (as indicated by an underline above) are analysed to assess the pedigree’s success)', 244, 433, {
          width: 305
        });
        
        let gold = impactProfileSummary?.gold;
        let green = impactProfileSummary?.green;
        let red = impactProfileSummary?.red;
        doc.roundedRect(244, 466, 90, 21, 3).fillAndStroke("#FADC19", "#FADC19");
        doc.roundedRect(254, 466, 90, 21, 0).fillAndStroke("#FADC19", "#FADC19");
        doc.fontSize(9).font('synthese-light').fillColor('#1D472E').text(gold + ' Gold', 280, 469);
        doc.roundedRect(347, 466, 100, 21, 0).fillAndStroke("#9FDB1D", "#9FDB1D");
        doc.fontSize(9).font('synthese-light').fillColor('#1D472E').text(green + ' Green', 380, 469);
        doc.roundedRect(450, 466, 90, 21, 0).fillAndStroke("#F53F3F", "#F53F3F");
        doc.roundedRect(460, 466, 90, 21, 3).fillAndStroke("#F53F3F", "#F53F3F");
        doc.fontSize(9).font('synthese-light').fillColor('#FFFFFF').text(red + ' Red', 487, 469);

        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text('Total crosses, out of 20 analysed, that have', 254, 492, {
          width: 80,
          continued: true
        }).font('synthese-light-bold').text('exceeded expectations by more than a factor of 4.');
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text('The quantity of crosses, out of 20 analysed, that have ', 357, 492, {
          width: 80,
          continued: true
        }).font('synthese-light-bold').text('exceeded expectations between 2 and 4 times.');
        doc.fontSize(6.59).font('synthese-light').fillColor('#161716').text('The quantity of crosses, out of 20 analysed, that have ', 460, 492, {
          width: 82,
          continued: true
        }).font('synthese-light-bold').text('fallen short of expectations', {continued: true})
        .font('synthese-light').text(' and should be avoided.');

        // ----------------------------- Predicted Distance Profile --------------------------- //
        // Predicted distance profile
        const distanceProfile = jsonData['distanceProfile'];
        const distanceChart = distanceProfile.chart;
        distanceChart.sort((a, b) => a.distance - b.distance);
        doc.fontSize(14).font('flecha-m').fillColor('#1D472E').text('Predicted Distance Profile', 245, 564);
        doc.fontSize(7.5).font('synthese-light').fillColor('#161716').text('Stakes winners resembling this pedigree are examined, and their success at various distances and ages are displayed.', 245, 585, {
          width: 295
        });

        // open level
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('Open', 250, 628);
        doc.lineWidth(.4);
        doc.moveTo(278, 633).lineTo(278, 633).lineTo(538, 633).fillAndStroke("#B0B6AF", "#B0B6AF");

        // 3YO level
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('3YO', 250, 665);
        doc.lineWidth(.4);
        doc.moveTo(278, 670).lineTo(278, 670).lineTo(538, 670).fillAndStroke("#B0B6AF", "#B0B6AF");
        
        // 2YO level
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('2YO', 250, 704.8);
        doc.lineWidth(.4);
        doc.moveTo(278, 710).lineTo(278, 710).lineTo(538, 710).fillAndStroke("#B0B6AF", "#B0B6AF");
        
        // X axis  260px in width
        doc.lineWidth(.5);
        doc.moveTo(278, 746).lineTo(278, 746).lineTo(538, 746).fillAndStroke("#B0B6AF", "#B0B6AF");

        const lineWidth = 250;
        const maxRadius = 15;
        
        const maxWinners = distanceChart.reduce((max, obj) => {
          return obj.winners > max ? obj.winners : max;
        }, 0);

        distanceChart.forEach(item => {
            let yPosition = 633;
            let colorCircle = "#2EFFB4";
            const raceAgeClass = item.raceAgeClass;
            const winners = (item.winners / maxWinners) * maxRadius;
            const distance = item.distance;
            const unitDistance = lineWidth / 2000;
            if(raceAgeClass === 1) {
                yPosition = 670;
                colorCircle = '#00DE8E';
            } else if(raceAgeClass === 2) {
                yPosition = 710;
                colorCircle = '#007142';
            }
            doc.circle(278 + (unitDistance * (distance - 800)), yPosition, winners).lineWidth(0.1).fillOpacity(0.8).fillAndStroke(colorCircle, colorCircle);
        })
        // open level
        // doc.circle(278, 633, 10).lineWidth(0.1).fillOpacity(0.8).fillAndStroke("#2EFFB4", "#2EFFB4");
        // // 2YO level
        // doc.circle(278, 710, 10).lineWidth(0.1).fillOpacity(0.8).fillAndStroke("#007142", "#007142")
        // // 3YO level
        // doc.circle(278, 670, 10).lineWidth(0.1).fillOpacity(0.8).fillAndStroke("#00DE8E", "#00DE8E")

        const lineXOffset = 46;
        let xAxisLabelYPosition = 754;
        let xAxisSecondaryLabelYPosition = 764;
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('800m', 278, xAxisLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('4f', 285, xAxisSecondaryLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('1200m', 278 + lineXOffset, xAxisLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('6f', 285 + lineXOffset, xAxisSecondaryLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('1600m', 278 + lineXOffset * 2, xAxisLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('8f', 285 + lineXOffset * 2, xAxisSecondaryLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('2000m', 278 + lineXOffset * 3, xAxisLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('10f', 285 + lineXOffset * 3, xAxisSecondaryLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('2400m', 278 + lineXOffset * 4, xAxisLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('12f', 285 + lineXOffset * 4, xAxisSecondaryLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('2800m+', 510.94, xAxisLabelYPosition);
        doc.fontSize(7.5).font('synthese-light-bold').fillColor('#1E1E1E').text('14f+',  510.94 + 8, xAxisSecondaryLabelYPosition);


        // ----------------------------- Footer --------------------------- //
        // footer section
        doc.image('assets/GoldMineImage.png', 32, 798, {width: 81.5});
        doc.fontSize(6).font('synthese-light').fillColor('#161716').text(`Created ${jsonData.createdOn}. Note pedigree updates past this date are excluded. Visit www.g1goldmine.com for updated information.`, 200, 800);
        // doc
        //   .fillColor('blue')
        //   .text('Here is a link!', 100, 100)
        //   .link(100, 100, 160, 27, 'http://google.com/');
        console.log(`Detailed page ${index + 1} completed....`)
      } catch (error) {
        console.error('Error occurred during PDF creation:', error);
      }
    }
}

module.exports = DetailedPage;
