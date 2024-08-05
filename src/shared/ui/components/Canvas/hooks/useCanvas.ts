import { useCallback, useRef } from 'react';
import { handleWheel, handleMouseMove } from '../model/canvasInteractions';
import {
  drawMap,
  getRecommendations,
  initializeNodes,
} from '../model/canvasDrawing';
import { getTrackPreviewUrl, searchTrack } from '../../../../api/spotify/api';

export const useCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const transform = useRef({ x: 0, y: 0, scale: 1 });
  const nodes = useRef<any[]>([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const initialPositions = useRef<any[]>([]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, [canvasRef]);

  const enableCanvasInteractions = useCallback(
    (
      data: any[],
      similarityMatrix: number[][],
      setTooltipContent: (content: string | null) => void,
      setTooltipPosition: (position: { x: number; y: number } | null) => void,
      setPreviewUrl: (url: string | null) => void,
      setRecommendations: (recs: any[] | null) => void
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawMapCallback = () =>
        drawMap(
          ctx,
          nodes.current,
          similarityMatrix,
          transform.current,
          null,
          initialPositions.current
        );

      const onWheel = (event: WheelEvent) =>
        handleWheel(event, canvas, transform.current, drawMapCallback);

      const onMouseMove = async (event: MouseEvent) => {
        handleMouseMove(
          event,
          isDragging,
          transform.current,
          startX,
          startY,
          canvas,
          drawMapCallback
        );

        const rect = canvas.getBoundingClientRect();
        const x =
          (event.clientX - rect.left - transform.current.x) /
          transform.current.scale;
        const y =
          (event.clientY - rect.top - transform.current.y) /
          transform.current.scale;
        const hoveredNode = nodes.current.find((node) => {
          const dx = x - node.x;
          const dy = y - node.y;
          return Math.sqrt(dx * dx + dy * dy) < node.size;
        });

        if (hoveredNode) {
          setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 });
          setTooltipContent(`
          <strong>${hoveredNode.song.Track}</strong><br>
          Artist: ${hoveredNode.song.Artist}<br>
          Score: ${hoveredNode.song['Track Score']}<br>
          Streams: ${hoveredNode.song['Spotify Streams']}
        `);

          if (!hoveredNode.song['Spotify Track ID']) {
            const trackId = await searchTrack(
              hoveredNode.song.Track,
              hoveredNode.song.Artist
            );
            if (trackId) {
              hoveredNode.song['Spotify Track ID'] = trackId;
            } else {
              console.error('Track ID not found for', hoveredNode.song.Track);
            }
          }

          if (hoveredNode.song['Spotify Track ID']) {
            getTrackPreviewUrl(hoveredNode.song['Spotify Track ID']).then(
              setPreviewUrl
            );
          }

          const recommendations = getRecommendations(
            hoveredNode.index,
            similarityMatrix,
            data
          );
          setRecommendations(recommendations);
        } else {
          setTooltipContent(null);
          setTooltipPosition(null);
          setPreviewUrl(null);
          setRecommendations(null);
        }
      };

      const onMouseDown = (event: MouseEvent) => {
        isDragging.current = true;
        startX.current = event.offsetX - transform.current.x;
        startY.current = event.offsetY - transform.current.y;
      };

      const onMouseUp = () => {
        isDragging.current = false;
      };

      const onMouseOut = () => {
        isDragging.current = false;
        setTooltipContent(null);
        setTooltipPosition(null);
        setPreviewUrl(null);
        setRecommendations(null);
      };

      const onMouseClick = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x =
          (event.clientX - rect.left - transform.current.x) /
          transform.current.scale;
        const y =
          (event.clientY - rect.top - transform.current.y) /
          transform.current.scale;
        const clickedNodeIndex = nodes.current.findIndex((node) => {
          const dx = x - node.x;
          const dy = y - node.y;
          return Math.sqrt(dx * dx + dy * dy) < node.size;
        });

        if (clickedNodeIndex !== -1) {
          window.requestAnimationFrame(() =>
            drawMap(
              ctx,
              nodes.current,
              similarityMatrix,
              transform.current,
              clickedNodeIndex,
              initialPositions.current
            )
          );
        }
      };

      const handleResize = () => {
        resizeCanvas();
        window.requestAnimationFrame(drawMapCallback);
      };

      canvas.addEventListener('wheel', onWheel);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('mouseout', onMouseOut);
      canvas.addEventListener('click', onMouseClick);
      window.addEventListener('resize', handleResize);

      return () => {
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('mouseout', onMouseOut);
        canvas.removeEventListener('click', onMouseClick);
        window.removeEventListener('resize', handleResize);
      };
    },
    [canvasRef, resizeCanvas]
  );

  const drawInitialMap = useCallback(
    (data: any[], similarityMatrix: number[][]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      nodes.current = initializeNodes(data, width, height);
      initialPositions.current = nodes.current.map((node) => ({
        x: node.x,
        y: node.y,
        color: node.color,
      }));

      drawMap(
        ctx,
        nodes.current,
        similarityMatrix,
        transform.current,
        null,
        initialPositions.current
      );
    },
    [canvasRef]
  );

  return { drawInitialMap, enableCanvasInteractions, resizeCanvas };
};
