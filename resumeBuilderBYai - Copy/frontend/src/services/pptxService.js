// frontend/src/services/pptxService.js

/**
 * Fetches the presentation from the backend and triggers a download.
 */
export async function downloadPresentation() {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generatePPTX`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      // The backend sends the PPTX data as a base64 string.
      // We need to decode it and create a blob.
      const base64Data = data.pptx;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

      // Create a link and trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'presentation.pptx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Failed to generate presentation:', data.error);
    }
  } catch (error) {
    console.error('Error downloading presentation:', error);
  }
}
