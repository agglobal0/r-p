// frontend/src/services/pptxService.js

/**
 * Decodes a base64 string and triggers a download of the resulting PPTX file.
 * @param {string} base64Data The base64-encoded PPTX data.
 * @param {string} filename The desired filename for the downloaded file.
 */
import { downloadBase64File } from './downloadService';

export function downloadPresentation(base64Data, filename) {
  try {
    downloadBase64File(base64Data, filename, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  } catch (error) {
    console.error('Error downloading presentation:', error);
  }
}
