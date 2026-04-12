import type React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const Logo = ({ className = '', ...props }: React.HTMLAttributes<HTMLImageElement>) => (
    <Image
        src="/images/taria-logo.png"
        alt="Taria Logo"
        width={230}
        height={48}
        priority
        className={cn(className)}
        {...props}
    />
);

export default Logo;
