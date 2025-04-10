
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LatencyIndicatorProps {
  latency: number;
  className?: string;
}

export const LatencyIndicator = ({ latency, className }: LatencyIndicatorProps) => {
  // Calculate a color based on latency
  // < 100ms: green, 100-200ms: yellow, > 200ms: red
  let color = "bg-green-500";
  let percentage = 25;
  
  if (latency > 200) {
    color = "bg-red-500";
    percentage = 100;
  } else if (latency > 100) {
    color = "bg-yellow-500";
    percentage = 65;
  }
  
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span>延迟</span>
        <span className="font-medium">{latency} ms</span>
      </div>
      <Progress value={percentage} className={cn("h-1", color)} indicatorClassName={color} />
    </div>
  );
};
