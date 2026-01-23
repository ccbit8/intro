// 性能监测组件（可选）
// 在 page.tsx 中添加以下代码可以看到 Web Vitals 指标

'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // 记录各个性能指标
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log('CLS:', clsValue);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('FID:', entry.processingDuration);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // 页面加载时间
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page Load Time:', pageLoadTime, 'ms');
        
        // 详细指标
        console.log('DNS:', perfData.domainLookupEnd - perfData.domainLookupStart);
        console.log('TCP:', perfData.connectEnd - perfData.connectStart);
        console.log('Request:', perfData.responseStart - perfData.requestStart);
        console.log('Response:', perfData.responseEnd - perfData.responseStart);
        console.log('DOM Parsing:', perfData.domComplete - perfData.domLoading);
        console.log('FCP:', perfData.responseEnd - perfData.navigationStart);
      });

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);

  return null;
}
