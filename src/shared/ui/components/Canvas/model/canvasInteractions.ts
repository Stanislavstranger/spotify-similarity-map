export const handleWheel = (
  event: WheelEvent,
  canvas: HTMLCanvasElement,
  transform: { x: number; y: number; scale: number },
  drawMapCallback: () => void
) => {
  event.preventDefault();
  const { offsetX, offsetY, deltaY } = event;
  const zoom = Math.exp(-deltaY / 2000);

  const minScale = Math.min(window.innerWidth / canvas.width, 1);
  const newScale = transform.scale * zoom;
  if (newScale < minScale) return;

  const rect = canvas.getBoundingClientRect();
  const cx = (offsetX - rect.left - transform.x) / transform.scale;
  const cy = (offsetY - rect.top - transform.y) / transform.scale;

  const newTransformX = transform.x - cx * (newScale - transform.scale);
  const newTransformY = transform.y - cy * (newScale - transform.scale);

  const minX = window.innerWidth - canvas.width * newScale;
  const minY = window.innerHeight - canvas.height * newScale;

  transform.x = Math.max(minX, Math.min(newTransformX, 0));
  transform.y = Math.max(minY, Math.min(newTransformY, 0));
  transform.scale = newScale;

  window.requestAnimationFrame(drawMapCallback);
};

export const handleMouseMove = (
  event: MouseEvent,
  isDragging: React.MutableRefObject<boolean>,
  transform: { x: number; y: number; scale: number },
  startX: React.MutableRefObject<number>,
  startY: React.MutableRefObject<number>,
  canvas: HTMLCanvasElement,
  drawMapCallback: () => void
) => {
  if (isDragging.current) {
    let newX = event.offsetX - startX.current;
    let newY = event.offsetY - startY.current;

    const minX = window.innerWidth - canvas.width * transform.scale;
    const minY = window.innerHeight - canvas.height * transform.scale;

    newX = Math.max(minX, Math.min(newX, 0));
    newY = Math.max(minY, Math.min(newY, 0));

    transform.x = newX;
    transform.y = newY;

    window.requestAnimationFrame(drawMapCallback);
  }
};
