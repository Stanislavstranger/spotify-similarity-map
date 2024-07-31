import React, { useRef, useEffect, useState } from 'react';
import { useCanvas } from './useCanvas';
import { Tooltip } from '../Tooltip/Tooltip';

interface CanvasProps {
  data: any[];
  similarityMatrix: number[][];
}

export const Canvas: React.FC<CanvasProps> = ({ data, similarityMatrix }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { drawMap, enableCanvasInteractions } = useCanvas(canvasRef);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (canvasRef.current && data.length > 0 && similarityMatrix.length > 0) {
      drawMap(data, similarityMatrix);
      enableCanvasInteractions(
        data,
        similarityMatrix,
        setTooltipContent,
        setTooltipPosition
      );
    }
  }, [data, similarityMatrix, drawMap, enableCanvasInteractions]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width="1200"
        height="800"
        style={{ border: '1px solid black' }}
      ></canvas>
      {tooltipContent && tooltipPosition && (
        <Tooltip position={tooltipPosition} content={tooltipContent} />
      )}
    </div>
  );
};
