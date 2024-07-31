import React from 'react';

interface TooltipProps {
  position: { x: number; y: number };
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ position, content }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '5px',
        borderRadius: '5px',
        pointerEvents: 'none',
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
