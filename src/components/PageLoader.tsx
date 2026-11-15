import React, { useState, useEffect } from 'react';

export interface PageLoaderProps {
  /** Optional delay before showing loader to prevent flickers on quick loads (ms) */
  delay?: number;
  /** Custom text to display under logo */
  text?: string;
  /** Custom image source */
  logoSrc?: string;
  /** Class name override for full screen background container */
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  delay = 150,
  text = 'Memuat halaman...',
  logoSrc = '/SMK_Negeri_2_Indramayu.png',
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(delay === 0);

  useEffect(() => {
    if (delay <= 0) {
      setShouldRender(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm ${className}`.trim()}
    >
      <div className="flex flex-col items-center gap-6 p-4 text-center">
        {/* Pulsing Logo with reduced motion fallback */}
        <div className="relative flex items-center justify-center">
          <img
            src={logoSrc}
            alt="SMK Negeri 2 Indramayu"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain animate-bounce motion-reduce:animate-none"
          />
        </div>

        {/* Text and visual indicator */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-[#0B3D5F] animate-pulse motion-reduce:animate-none">
            {text}
          </p>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce motion-reduce:animate-none" />
            <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce motion-reduce:animate-none [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce motion-reduce:animate-none [animation-delay:0.3s]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
