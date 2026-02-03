import type React from 'react';
import { cn } from '@/lib/utils';

const Logo = ({ className = '', ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="115"
    height="24"
    viewBox="0 0 115 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('text-foreground', className)}
    {...props}
  >
    <g clipPath="url(#clip0_401_2)">
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="currentColor"
        className="text-primary"
      />
      <path
        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
        fill="currentColor"
        className="text-background"
      />
    </g>
    <text
      x="32"
      y="17"
      fontFamily="Inter, sans-serif"
      fontSize="20"
      fontWeight="600"
      fill="currentColor"
    >
      Taria
    </text>
    <defs>
      <clipPath id="clip0_401_2">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default Logo;
