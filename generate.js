// Convert TIF originals to Deep Zoom

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const source = path.join(__dirname, 'images');
const dest = path.join(__dirname, 'tiles');

// Extracts page from input filename
const pageFinder = /Page ([0-9]+[abc]?)/;

// Pages-in-month
const months = {};

fs.readdirSync(source).forEach(function(month) {
  const pages = [];
  fs.readdirSync(path.join(source, month)).forEach(function(page) {
    const pageNumber = pageFinder.exec(page);
    if (pageNumber) {
      pages.push(pageNumber[1]);
      const inputFile = path.join(source, month, page);
      const outputFilePrefix = path.join(dest, month + '-' + pageNumber[1]);
      // Generate Deep Zoom
      if (!fs.statSync(outputFilePrefix + '.dzi').isFile()) {
        sharp(inputFile)
          .toFile(outputFilePrefix + '.dzi')
          .then(function() {
            console.log('Generated DZI for page ' + pageNumber[1]);
          });
      } else {
        console.log('DZI exists for page ' + pageNumber[1]);
      }
      // Generate thumbnail
      if (!fs.statSync(outputFilePrefix + '.jpg').isFile()) {
        sharp(inputFile)
          .resize(134, 178)
          .sharpen()
          .quality(75)
          .trellisQuantisation()
          .toFile(outputFilePrefix + '.jpg')
          .then(function() {
            console.log('Generated thumb for page ' + pageNumber[1]);
          });
      } else {
        console.log('Thumb exists for page ' + pageNumber[1]);
      }
    } else {
      console.log('Skipping ' + page);
    }
  });
  months[month] = pages;
});
// Write pages-in-month data
fs.writeFileSync(
  path.join(__dirname, 'months.json'),
  JSON.stringify(months, null, 2)
);
