import React, { useRef, useEffect } from 'react';
import { useCanvas } from './useCanvas';

interface CanvasProps {
  data: any[];
  similarityMatrix: number[][];
}

export const Canvas: React.FC<CanvasProps> = ({ data, similarityMatrix }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { drawMap, enableCanvasInteractions } = useCanvas(canvasRef);

  useEffect(() => {
    if (canvasRef.current && data.length > 0 && similarityMatrix.length > 0) {
      console.log('Drawing map with data:', data);
      console.log('Drawing map with similarity matrix:', similarityMatrix);
      drawMap(data, similarityMatrix);
      enableCanvasInteractions(data, similarityMatrix);
    }
  }, [data, similarityMatrix, drawMap, enableCanvasInteractions]);

  return (
    <canvas
      ref={canvasRef}
      width="1200"
      height="800"
      style={{ border: '1px solid black' }}
    ></canvas>
  );
};
