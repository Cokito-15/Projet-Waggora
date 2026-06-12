import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div
      className={`bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
