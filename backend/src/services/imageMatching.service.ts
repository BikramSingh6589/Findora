export interface ImageComparisonResult {
  score: number;
}

/**
 * Compares two image URLs and returns a similarity score.
 * Designed to be modular so it can be replaced with OpenAI/CLIP embeddings in the future.
 */
export const compareImages = async (
  lostImage: string,
  foundImage: string
): Promise<ImageComparisonResult> => {
  try {
    // Modular placeholder: returns 0 for now
    return { score: 0 };
  } catch (error) {
    console.error('compareImages error:', error);
    return { score: 0 };
  }
};
