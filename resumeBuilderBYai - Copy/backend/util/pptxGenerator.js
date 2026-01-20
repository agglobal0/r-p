// backend/util/pptxGenerator.js
// The user will need to install pptxgenjs: npm install pptxgenjs
const pptxgen = require('pptxgenjs');

/**
 * Generates a simple PowerPoint presentation.
 * @returns {Promise<string>} A promise that resolves with the base64 content of the presentation.
 */
async function generateSimplePPTX() {
  const pptx = new pptxgen();
  
  // Add a slide
  const slide = pptx.addSlide();

  // Add a title
  slide.addText('Hello World from pptxgenjs!', { 
    x: 1, 
    y: 1, 
    w: '80%', 
    h: 1, 
    fontSize: 36, 
    bold: true, 
    color: '363636' 
  });

  // Add some content
  slide.addText('This is a simple presentation generated with pptxgenjs.', { 
    x: 1, 
    y: 2.5, 
    w: '80%', 
    h: 0.5, 
    fontSize: 18, 
    color: '363636' 
  });

  // Generate the presentation and return it as a base64 string
  return pptx.write('base64');
}

module.exports = {
  generateSimplePPTX,
};
