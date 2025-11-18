import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-lg backdrop-blur-sm ${
        hover ? 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:border-emerald-200' : 'transition-shadow duration-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

