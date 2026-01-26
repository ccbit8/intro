"use client";

import { useEffect, useState } from 'react';
import { ChartRadarLabelCustom } from '@/components/ui/shadcn-io/radar-chart-04';
import { useLoadingContext } from './loading-context';
import { RadarSkeleton } from './radar-skeleton';

const RadarChart04 = () => {
  const [mounted, setMounted] = useState(false);
  const { setChartReady } = useLoadingContext();

  useEffect(() => {
    // Delay rendering of the heavy chart to avoid hydration reflow conflicts.
    // Recharts (ResponsiveContainer) measures DOM immediately on mount.
    // If this happens while next-themes is applying the global class to <html>,
    // it triggers a full-page Forced Reflow.
    const timer = requestAnimationFrame(() => {
      // Double rAF ensures we process this in the frame *after* the layout effects of hydration have settled
      requestAnimationFrame(() => {
         setMounted(true);
         setChartReady(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, [setChartReady]);

  if (!mounted) {
    // Return a placeholder of the same size to avoid layout shift later
    // The chart component has 'aspect-square w-72 sm:w-80 h-auto'
    return <RadarSkeleton />;
  }

  return <ChartRadarLabelCustom />;
};

export default RadarChart04;