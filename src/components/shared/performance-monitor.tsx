//src\components\shared\performance-monitor.tsx
'use client'

import { useEffect, useState } from 'react';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setVisible(true);
      
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, fcp: Math.round(entry.startTime) }));
              }
              break;
            case 'largest-contentful-paint':
              setMetrics(prev => ({ ...prev, lcp: Math.round(entry.startTime) }));
              break;
            case 'first-input':
              setMetrics(prev => ({ ...prev, fid: Math.round(entry.processingStart - entry.startTime) }));
              break;
            case 'layout-shift':
              setMetrics(prev => ({ ...prev, cls: Math.round(entry.value * 1000) / 1000 }));
              break;
          }
        });
      });

      observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'],
      });

      // Capture TTFB
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        setMetrics(prev => ({
          ...prev,
          ttfb: Math.round(navigationEntry.responseStart - navigationEntry.requestStart),
        }));
      }

      return () => observer.disconnect();
    }
  }, []);

  if (!visible || process.env.NODE_ENV !== 'development') return null;

  const getScore = (value: number | null, thresholds: { good: number; poor: number }) => {
    if (value === null) return 'pending';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const scores = {
    fcp: getScore(metrics.fcp, { good: 1000, poor: 3000 }),
    lcp: getScore(metrics.lcp, { good: 2500, poor: 4000 }),
    fid: getScore(metrics.fid, { good: 100, poor: 300 }),
    cls: getScore(metrics.cls, { good: 0.1, poor: 0.25 }),
    ttfb: getScore(metrics.ttfb, { good: 800, poor: 1800 }),
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-sm">Performance Monitor</h3>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        {Object.entries(scores).map(([key, score]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">{key.toUpperCase()}:</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{metrics[key as keyof PerformanceMetrics] || '--'}ms</span>
              {score === 'good' && <CheckCircle className="h-3 w-3 text-green-500" />}
              {score === 'needs-improvement' && <AlertCircle className="h-3 w-3 text-yellow-500" />}
              {score === 'poor' && <AlertCircle className="h-3 w-3 text-red-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}