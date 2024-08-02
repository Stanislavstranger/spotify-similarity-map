export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export function calculateSimilarityMatrix(data: any[]): number[][] {
  const matrix: number[][] = Array(data.length)
    .fill(0)
    .map(() => Array(data.length).fill(0));
  const criteria = ['Track Score', 'Spotify Streams', 'Release Date'];

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      const similarity = cosineSimilarity(
        criteria.map((criterion) => data[i][criterion]),
        criteria.map((criterion) => data[j][criterion])
      );
      matrix[i][j] = similarity;
    }
  }
  return matrix;
}
