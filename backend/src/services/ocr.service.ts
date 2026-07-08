import Tesseract from 'tesseract.js';

/**
 * OCR service to extract text from images.
 */
export const extractTextFromImage = async (
  imagePathOrUrl: string
): Promise<{ extractedText: string }> => {
  if (!imagePathOrUrl) {
    return { extractedText: '' };
  }

  try {
    const { data: { text } } = await Tesseract.recognize(imagePathOrUrl, 'eng');
    
    // Clean up extracted text: replace newlines with space, remove non-alphanumeric/spaces, normalize spaces
    const cleanedText = text
      .replace(/[\r\n]+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return { extractedText: cleanedText };
  } catch (error) {
    console.error('OCR Service error:', error);
    return { extractedText: '' };
  }
};
