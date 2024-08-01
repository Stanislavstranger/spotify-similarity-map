import { useCallback, useRef } from 'react';
import { getTrackPreviewUrl, searchTrack } from '../../../api/spotify/api';
import { kmeans } from 'ml-kmeans';

export const useCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const transform = useRef({ x: 0, y: 0, scale: 1 });
  const nodes = useRef<any[]>([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, [canvasRef]);

  const drawNode = (
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

  const drawLine = (
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

  const drawMap = useCallback(
    async (
      data: any[],
      similarityMatrix: number[][],
      highlightedNodeIndex: number | null = null
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const maxNodes = data.length;

      const featureVectors = data
        .slice(0, maxNodes)
        .map((song) => [song['Track Score'], song['Spotify Streams']]);
      const k = 5;
      const options = {
        maxIterations: 100,
        tolerance: 1e-4,
        distanceFunction: (a: number[], b: number[]) => {
          return Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0));
        },
      };
      const result = kmeans(featureVectors, k, options);

      nodes.current = data.slice(0, maxNodes).map((song, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.sqrt(song['Track Score']),
        song: song,
        index: i,
        cluster: result.clusters[i],
      }));

      const clusterColors = ['red', 'green', 'blue', 'yellow', 'purple'];

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(transform.current.x, transform.current.y);
      ctx.scale(transform.current.scale, transform.current.scale);

      nodes.current.forEach((node) => {
        drawNode(ctx, node.x, node.y, node.size, clusterColors[node.cluster]);
      });

      if (highlightedNodeIndex !== null) {
        const highlightedNode = nodes.current[highlightedNodeIndex];
        const connections = similarityMatrix[highlightedNodeIndex]
          .map((similarity, index) => ({ index, similarity }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(1, 11);

        connections.forEach((connection) => {
          const targetNode = nodes.current[connection.index];
          drawLine(
            ctx,
            highlightedNode.x,
            highlightedNode.y,
            targetNode.x,
            targetNode.y,
            'gray'
          );
          drawNode(ctx, targetNode.x, targetNode.y, targetNode.size, 'red');
        });
      }

      ctx.restore();
    },
    [canvasRef]
  );

  const enableCanvasInteractions = useCallback(
    (
      data: any[],
      similarityMatrix: number[][],
      setTooltipContent: (content: string | null) => void,
      setTooltipPosition: (position: { x: number; y: number } | null) => void,
      setPreviewUrl: (url: string | null) => void
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const { offsetX, offsetY, deltaY } = event;
        const zoom = Math.exp(-deltaY / 100);

        ctx.translate(offsetX, offsetY);
        ctx.scale(zoom, zoom);
        ctx.translate(-offsetX, -offsetY);

        transform.current.x = ctx.getTransform().e;
        transform.current.y = ctx.getTransform().f;
        transform.current.scale *= zoom;

        window.requestAnimationFrame(() => drawMap(data, similarityMatrix));
      };

      const onMouseMove = async (event: MouseEvent) => {
        if (isDragging.current) {
          transform.current.x = event.offsetX - startX.current;
          transform.current.y = event.offsetY - startY.current;
          window.requestAnimationFrame(() => drawMap(data, similarityMatrix));
        }

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
        } else {
          setTooltipContent(null);
          setTooltipPosition(null);
          setPreviewUrl(null);
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
            drawMap(data, similarityMatrix, clickedNodeIndex)
          );
        } else {
          window.requestAnimationFrame(() => drawMap(data, similarityMatrix));
        }
      };

      const handleResize = () => {
        resizeCanvas();
        window.requestAnimationFrame(() => drawMap(data, similarityMatrix));
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
    [canvasRef, drawMap, resizeCanvas]
  );

  return { drawMap, enableCanvasInteractions, resizeCanvas };
};
