// src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Loading Spinner Component
 * Various loading indicator styles
 */

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorClasses = {
  primary: 'text-finbot-600',
  secondary: 'text-dark-400',
  white: 'text-white',
  success: 'text-profit',
  danger: 'text-loss',
};

// ============================================================================
// Circle Spinner
// ============================================================================

const CircleSpinner = ({ size = 'md', color = 'primary', className }) => (
  <div
    className={clsx(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses[size],
      colorClasses[color],
      className
    )}
  />
);

// ============================================================================
// Dots Spinner
// ============================================================================

const DotsSpinner = ({ size = 'md', color = 'primary', className }) => {
  const dotSize = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          className={clsx(
            'rounded-full',
            dotSize[size],
            color === 'white' ? 'bg-white' : 'bg-finbot-500'
          )}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Pulse Spinner
// ============================================================================

const PulseSpinner = ({ size = 'md', color = 'primary', className }) => (
  <div className={clsx('relative', sizeClasses[size], className)}>
    <div
      className={clsx(
        'absolute inset-0 rounded-full animate-ping opacity-75',
        color === 'white' ? 'bg-white' : 'bg-finbot-400'
      )}
    />
    <div
      className={clsx(
        'relative rounded-full w-full h-full',
        color === 'white' ? 'bg-white' : 'bg-finbot-600'
      )}
    />
  </div>
);

// ============================================================================
// Bars Spinner
// ============================================================================

const BarsSpinner = ({ size = 'md', color = 'primary', className }) => {
  const barHeight = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10',
  };

  return (
    <div className={clsx('flex items-end gap-0.5', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={{
            scaleY: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className={clsx(
            'w-1 rounded-full origin-bottom',
            barHeight[size],
            color === 'white' ? 'bg-white' : 'bg-finbot-500'
          )}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Ring Spinner
// ============================================================================

const RingSpinner = ({ size = 'md', color = 'primary', className }) => (
  <div className={clsx('relative', sizeClasses[size], className)}>
    <div
      className={clsx(
        'absolute inset-0 rounded-full border-4',
        color === 'white' ? 'border-white/20' : 'border-finbot-200 dark:border-finbot-800'
      )}
    />
    <div
      className={clsx(
        'absolute inset-0 rounded-full border-4 border-t-transparent animate-spin',
        color === 'white' ? 'border-white' : 'border-finbot-600'
      )}
    />
  </div>
);

// ============================================================================
// Main Loading Spinner (Default Export)
// ============================================================================

const LoadingSpinner = ({
  variant = 'circle',
  size = 'md',
  color = 'primary',
  label,
  fullScreen = false,
  overlay = false,
  className,
}) => {
  const spinners = {
    circle: CircleSpinner,
    dots: DotsSpinner,
    pulse: PulseSpinner,
    bars: BarsSpinner,
    ring: RingSpinner,
  };

  const Spinner = spinners[variant] || CircleSpinner;

  const content = (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <Spinner size={size} color={color} />
      {label && (
        <p className={clsx(
          'text-sm font-medium',
          color === 'white' ? 'text-white' : 'text-dark-600 dark:text-dark-300'
        )}>
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-950 z-50">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm z-40 rounded-xl">
        {content}
      </div>
    );
  }

  return content;
};

// ============================================================================
// Skeleton Loader
// ============================================================================

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className,
  animate = true,
}) => {
  const baseClasses = 'bg-dark-200 dark:bg-dark-700 rounded';
  const animationClasses = animate ? 'animate-pulse' : '';

  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-24 w-24 rounded-lg',
    card: 'h-48 w-full rounded-xl',
    button: 'h-10 w-24 rounded-xl',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        animationClasses,
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

// ============================================================================
// Table Skeleton
// ============================================================================

const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-3 border-b border-dark-200 dark:border-dark-700">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 py-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// ============================================================================
// Card Skeleton
// ============================================================================

const CardSkeleton = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" className="w-3/4" />
  </div>
);

export {
  LoadingSpinner,
  CircleSpinner,
  DotsSpinner,
  PulseSpinner,
  BarsSpinner,
  RingSpinner,
  Skeleton,
  TableSkeleton,
  CardSkeleton,
};

export default LoadingSpinner;