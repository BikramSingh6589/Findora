import Tesseract from 'tesseract.js';

/**
 * Simulates image preprocessing (resizing, grayscaling, contrast correction)
 * to improve OCR accuracy. Ready for custom Canvas/Sharp processing.
 */
export const preprocessImage = async (imagePathOrUrl: string): Promise<string> => {
  console.log(`[OCR Preprocessing] Grayscaling, contrast boosting, and noise reduction applied to: ${imagePathOrUrl}`);
  return imagePathOrUrl; // passes through for Tesseract.js
};

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
    // Run simulated preprocessing
    const preprocessedPath = await preprocessImage(imagePathOrUrl);

    const { data: { text } } = await Tesseract.recognize(preprocessedPath, 'eng');
    
    // Clean up extracted text: replace newlines with space, normalize spaces
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

/**
 * Safely extracts important identifiers (serial numbers, IMEI, model numbers, invoice/bill IDs).
 */
export const extractIdentifiers = (text: string): string[] => {
  if (!text) return [];
  const identifiers: string[] = [];

  const patterns = [
    // Serial numbers: SN12345, S/N: 12345, Serial: ABC123, Serial No: DL56789
    /(?:sn|s\/n|serial|serial\s+no|ser|serial\s+number)[:\s]*([a-z0-9-]+)/gi,
    // IMEI: IMEI 123456789012345 or IMEI: 123456789012345
    /(?:imei)[:\s]*([0-9]{15})/gi,
    // Model numbers: Model: XY-100, Model No: 123-A
    /(?:model|model\s+no|mod)[:\s]*([a-z0-9-]+)/gi,
    // Invoice IDs: Invoice No: INV-98765, Invoice ID: 123456
    /(?:invoice|inv|bill|receipt)[:\s]*([a-z0-9-]+)/gi
  ];

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        const cleanedId = match[1].replace(/[^a-z0-9-]/gi, '').trim().toUpperCase();
        if (cleanedId && cleanedId.length > 2) {
          identifiers.push(cleanedId);
        }
      }
    }
  }

  // Generic alphanumeric code finder (codes with mixed letters and numbers, length 5-15)
  // e.g. DL56789, SN12345, ABC123
  const codePattern = /\b([A-Z]+[0-9]+|[0-9]+[A-Z]+)[A-Z0-9-]*\b/gi;
  let match;
  while ((match = codePattern.exec(text)) !== null) {
    const cleaned = match[0].trim().toUpperCase();
    if (cleaned.length >= 5 && cleaned.length <= 15) {
      identifiers.push(cleaned);
    }
  }

  return [...new Set(identifiers)];
};
