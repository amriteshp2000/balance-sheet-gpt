// src/components/ui/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * Button Component
 * A versatile button component with multiple variants, sizes, and states
 */

const buttonVariants = {
  // Primary - Main action button
  primary: `
    bg-gradient-to-r from-finbot-600 to-finbot-700 
    hover:from-finbot-700 hover:to-finbot-800
    text-white 
    shadow-finbot hover:shadow-finbot-lg
    focus:ring-finbot-500
  `,
  
  // Secondary - Secondary action button
  secondary: `
    bg-dark-100 dark:bg-dark-800 
    hover:bg-dark-200 dark:hover:bg-dark-700
    text-dark-700 dark:text-dark-200
    border border-dark-200 dark:border-dark-700
    focus:ring-dark-500
  `,
  
  // Outline - Bordered button
  outline: `
    bg-transparent 
    hover:bg-finbot-50 dark:hover:bg-finbot-900/20
    text-finbot-600 dark:text-finbot-400
    border-2 border-finbot-600 dark:border-finbot-500
    focus:ring-finbot-500
  `,
  
  // Ghost - Minimal button
  ghost: `
    bg-transparent 
    hover:bg-dark-100 dark:hover:bg-dark-800
    text-dark-600 dark:text-dark-300
    focus:ring-dark-500
  `,
  
  // Danger - Destructive action button
  danger: `
    bg-gradient-to-r from-loss to-red-600
    hover:from-red-600 hover:to-red-700
    text-white
    shadow-md hover:shadow-lg
    focus:ring-loss
  `,
  
  // Success - Positive action button
  success: `
    bg-gradient-to-r from-profit to-green-600
    hover:from-green-600 hover:to-green-700
    text-white
    shadow-md hover:shadow-lg
    focus:ring-profit
  `,
  
  // Warning - Caution action button
  warning: `
    bg-gradient-to-r from-amber-500 to-amber-600
    hover:from-amber-600 hover:to-amber-700
    text-white
    shadow-md hover:shadow-lg
    focus:ring-amber-500
  `,
  
  // Link - Text link style button
  link: `
    bg-transparent
    text-finbot-600 dark:text-finbot-400
    hover:text-finbot-700 dark:hover:text-finbot-300
    hover:underline
    p-0
  `,
};

const buttonSizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
  xl: 'px-6 py-3.5 text-lg gap-2.5',
  icon: 'p-2.5',
  'icon-sm': 'p-2',
  'icon-lg': 'p-3',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
  icon: 'w-5 h-5',
  'icon-sm': 'w-4 h-4',
  'icon-lg': 'w-6 h-6',
};

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isLoading = false,
  isDisabled = false,
  isFullWidth = false,
  isRounded = false,
  loadingText,
  className,
  onClick,
  type = 'button',
  as: Component = 'button',
  href,
  target,
  rel,
  animate = true,
  ...props
}, ref) => {
  
  const isIconOnly = !children && (LeftIcon || RightIcon);
  const disabled = isDisabled || isLoading;
  
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `;
  
  const classes = clsx(
    baseClasses,
    buttonVariants[variant],
    buttonSizes[isIconOnly ? (size.includes('icon') ? size : 'icon') : size],
    isFullWidth && 'w-full',
    isRounded && 'rounded-full',
    className
  );

  const content = (
    <>
      {/* Loading Spinner */}
      {isLoading && (
        <Loader2 className={clsx(iconSizes[size], 'animate-spin')} />
      )}
      
      {/* Left Icon */}
      {!isLoading && LeftIcon && (
        <LeftIcon className={iconSizes[size]} />
      )}
      
      {/* Button Text */}
      {isLoading && loadingText ? loadingText : children}
      
      {/* Right Icon */}
      {!isLoading && RightIcon && (
        <RightIcon className={iconSizes[size]} />
      )}
    </>
  );

  // Motion props for animation
  const motionProps = animate ? {
    whileHover: disabled ? {} : { scale: 1.02 },
    whileTap: disabled ? {} : { scale: 0.98 },
  } : {};

  // Render as link if href is provided
  if (href) {
    return (
      <motion.a
        ref={ref}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        className={classes}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  // Render as custom component if provided
  if (Component !== 'button') {
    return (
      <motion.div
        ref={ref}
        as={Component}
        className={classes}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
});

Button.displayName = 'Button';

// ============================================================================
// Button Group Component
// ============================================================================

const ButtonGroup = ({ 
  children, 
  orientation = 'horizontal',
  spacing = 'md',
  isAttached = false,
  className,
  ...props 
}) => {
  const spacingClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  const attachedClasses = isAttached ? `
    [&>*:first-child]:rounded-r-none
    [&>*:last-child]:rounded-l-none
    [&>*:not(:first-child):not(:last-child)]:rounded-none
    [&>*:not(:first-child)]:-ml-px
  ` : '';

  return (
    <div
      className={clsx(
        'inline-flex',
        orientationClasses[orientation],
        !isAttached && spacingClasses[spacing],
        attachedClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// Icon Button Component
// ============================================================================

const IconButton = React.forwardRef(({
  icon: Icon,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  isRounded = false,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size.includes('icon') ? size : `icon-${size === 'md' ? '' : size}`.replace('-', '') || 'icon'}
      leftIcon={Icon}
      isRounded={isRounded}
      aria-label={ariaLabel}
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';

// ============================================================================
// Close Button Component
// ============================================================================

const CloseButton = React.forwardRef(({ size = 'md', ...props }, ref) => {
  return (
    <IconButton
      ref={ref}
      icon={({ className }) => (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      variant="ghost"
      size={size}
      aria-label="Close"
      {...props}
    />
  );
});

CloseButton.displayName = 'CloseButton';

// ============================================================================
// Exports
// ============================================================================

export { Button, ButtonGroup, IconButton, CloseButton };
export default Button;