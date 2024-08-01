import React, { useRef, useEffect, useState } from 'react';
import { useCanvas } from './useCanvas';
import { Tooltip } from '../Tooltip/Tooltip';

interface CanvasProps {
  data: any[];
  similarityMatrix: number[][];
}

export const Canvas: React.FC<CanvasProps> = ({ data, similarityMatrix }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { drawMap, enableCanvasInteractions, resizeCanvas } =
    useCanvas(canvasRef);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);

  useEffect(() => {
    if (canvasRef.current && data.length > 0 && similarityMatrix.length > 0) {
      resizeCanvas();
      drawMap(data, similarityMatrix);
      enableCanvasInteractions(
        data,
        similarityMatrix,
        setTooltipContent,
        setTooltipPosition,
        setPreviewUrl,
        setRecommendations
      );
    }
  }, [data, similarityMatrix, drawMap, enableCanvasInteractions, resizeCanvas]);

  return (
    <div id="canvas-container" style={{ width: '100%', height: '100vh' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
      {tooltipContent && tooltipPosition && (
        <Tooltip position={tooltipPosition} content={tooltipContent} />
      )}
      {previewUrl && (
        <audio
          controls
          autoPlay
          style={{ position: 'absolute', bottom: '10px', left: '10px' }}
        >
          <source src={previewUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      {recommendations && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          <h4>Recommendations</h4>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>
                <strong>{rec.Track}</strong> by {rec.Artist}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
