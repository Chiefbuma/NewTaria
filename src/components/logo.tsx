import type React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const Logo = ({ className = '', ...props }: React.HTMLAttributes<HTMLImageElement>) => (
    <Image
        src="/images/taria-logo.png"
        alt="Taria Logo"
        width={115}
        height={24}
        priority
        className={cn(className)}
        {...props}
    />
);

export default Logo;
