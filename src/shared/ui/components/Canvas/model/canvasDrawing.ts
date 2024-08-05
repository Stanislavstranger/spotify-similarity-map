import { kmeans } from 'ml-kmeans';

export const drawNode = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
) => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

export const getRecommendations = (
  index: number,
  similarityMatrix: number[][],
  data: any[],
  numRecommendations: number = 5
) => {
  const similarities = similarityMatrix[index];
  const recommendations = similarities
    .map((similarity, i) => ({ index: i, similarity }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(1, numRecommendations + 1)
    .map((rec) => data[rec.index]);
  return recommendations;
};

export const drawMap = (
  ctx: CanvasRenderingContext2D,
  nodes: any[],
  similarityMatrix: number[][],
  transform: { x: number; y: number; scale: number },
  highlightedNodeIndex: number | null,
  initialPositions: any[]
) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.scale, transform.scale);

  nodes.forEach((node, i) => {
    drawNode(
      ctx,
      initialPositions[i].x,
      initialPositions[i].y,
      node.size,
      initialPositions[i].color
    );
  });

  if (highlightedNodeIndex !== null) {
    const highlightedNode = nodes[highlightedNodeIndex];
    const connections = similarityMatrix[highlightedNodeIndex]
      .map((similarity, index) => ({ index, similarity }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(1, 11);

    connections.forEach((connection) => {
      const targetNode = nodes[connection.index];
      drawLine(
        ctx,
        initialPositions[highlightedNode.index].x,
        initialPositions[highlightedNode.index].y,
        initialPositions[targetNode.index].x,
        initialPositions[targetNode.index].y,
        'gray'
      );
      drawNode(
        ctx,
        initialPositions[targetNode.index].x,
        initialPositions[targetNode.index].y,
        targetNode.size,
        'red'
      );
    });
  }

  ctx.restore();
};

export const initializeNodes = (data: any[], width: number, height: number) => {
  const featureVectors = data.map((song) => [
    song['Track Score'],
    song['Spotify Streams'],
  ]);
  const k = 5;
  const options = {
    maxIterations: 100,
    tolerance: 1e-4,
    distanceFunction: (a: number[], b: number[]) => {
      return Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0));
    },
  };
  const result = kmeans(featureVectors, k, options);

  return data.map((song, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.sqrt(song['Track Score']) * 2,
    song: song,
    index: i,
    cluster: result.clusters[i],
    color: ['red', 'green', 'blue', 'yellow', 'purple'][result.clusters[i]],
  }));
};
