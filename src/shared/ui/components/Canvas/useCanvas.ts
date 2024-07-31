import { useCallback } from 'react';

export const useCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const transform = { x: 0, y: 0, scale: 1 };
  let nodes: any[] = [];

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
    (
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

      nodes = data.slice(0, maxNodes).map((song, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.sqrt(song['Track Score']),
        song: song,
        index: i,
      }));

      console.log('Nodes to draw:', nodes);

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      nodes.forEach((node) => {
        drawNode(ctx, node.x, node.y, node.size, 'blue');
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
      setTooltipPosition: (position: { x: number; y: number } | null) => void
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        const { offsetX, offsetY, deltaY } = event;
        const zoom = Math.exp(-deltaY / 100);

        ctx.translate(offsetX, offsetY);
        ctx.scale(zoom, zoom);
        ctx.translate(-offsetX, -offsetY);

        transform.x = ctx.getTransform().e;
        transform.y = ctx.getTransform().f;
        transform.scale *= zoom;

        drawMap(data, similarityMatrix);
      });

      let isDragging = false;
      let startX: number, startY: number;

      canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        startX = event.offsetX - transform.x;
        startY = event.offsetY - transform.y;
      });

      canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
          transform.x = event.offsetX - startX;
          transform.y = event.offsetY - startY;
          drawMap(data, similarityMatrix);
        }

        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - transform.x) / transform.scale;
        const y = (event.clientY - rect.top - transform.y) / transform.scale;
        const hoveredNode = nodes.find((node) => {
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
        } else {
          setTooltipContent(null);
          setTooltipPosition(null);
        }
      });

      canvas.addEventListener('mouseup', () => {
        isDragging = false;
      });

      canvas.addEventListener('mouseout', () => {
        isDragging = false;
        setTooltipContent(null);
        setTooltipPosition(null);
      });

      canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - transform.x) / transform.scale;
        const y = (event.clientY - rect.top - transform.y) / transform.scale;
        const clickedNodeIndex = nodes.findIndex((node) => {
          const dx = x - node.x;
          const dy = y - node.y;
          return Math.sqrt(dx * dx + dy * dy) < node.size;
        });

        if (clickedNodeIndex !== -1) {
          drawMap(data, similarityMatrix, clickedNodeIndex);
        } else {
          drawMap(data, similarityMatrix);
        }
      });
    },
    [canvasRef, drawMap]
  );

  return { drawMap, enableCanvasInteractions };
};
