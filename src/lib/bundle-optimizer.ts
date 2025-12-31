//src\lib\bundle-optimizer.ts
/**
 * Utility to optimize lodash imports
 */
export const importLodash = {
  // Use named imports for better tree shaking
  debounce: () => import('lodash/debounce').then(mod => mod.default),
  throttle: () => import('lodash/throttle').then(mod => mod.default),
  get: () => import('lodash/get').then(mod => mod.default),
  set: () => import('lodash/set').then(mod => mod.default),
  cloneDeep: () => import('lodash/cloneDeep').then(mod => mod.default),
};

/**
 * Lazy load heavy components
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return dynamic(() => importFunc(), {
    loading: () => fallback || <div className="animate-pulse bg-gray-100 rounded" />,
    ssr: false,
  });
}

/**
 * Prefetch critical routes
 */
export function prefetchRoutes(routes: string[]) {
  if (typeof window !== 'undefined') {
    routes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
}

/**
 * Image optimization helper
 */
export function optimizeImage(src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
}) {
  if (!src.includes('res.cloudinary.com')) return src;
  
  const params = [
    'f_auto',
    'q_auto:good',
    'c_limit',
  ];
  
  if (options?.width && options?.height) {
    params.push(`w_${options.width}`, `h_${options.height}`, 'c_fill');
  }
  
  const [baseUrl, extension] = src.split('.');
  return `${baseUrl}/${params.join(',')}.${extension}`;
}