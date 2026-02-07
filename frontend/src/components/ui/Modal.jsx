// src/components/ui/Modal.jsx
import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

/**
 * Modal Component
 * A customizable modal/dialog component with animations
 */

const modalSizes = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  description,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocus,
  finalFocus,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  footer,
  icon: Icon,
  iconColor = 'finbot',
}) => {
  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const iconColorClasses = {
    finbot: 'bg-finbot-100 dark:bg-finbot-900/30 text-finbot-600',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
            className={clsx(
              'fixed inset-0 bg-black/50 backdrop-blur-sm',
              overlayClassName
            )}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={clsx(
                'relative w-full bg-white dark:bg-dark-900 rounded-2xl shadow-2xl',
                modalSizes[size],
                className
              )}
            >
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-dark-500" />
                </button>
              )}

              {/* Header */}
              {(title || Icon) && (
                <div className={clsx(
                  'flex items-start gap-4 p-6 pb-0',
                  headerClassName
                )}>
                  {Icon && (
                    <div className={clsx(
                      'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                      iconColorClasses[iconColor]
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pr-8">
                    {title && (
                      <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className={clsx('p-6', bodyClassName)}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className={clsx(
                  'flex items-center justify-end gap-3 p-6 pt-0 border-t border-dark-100 dark:border-dark-800 mt-2',
                  footerClassName
                )}>
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal at document root
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

// ============================================================================
// Modal Header Component
// ============================================================================

const ModalHeader = ({ children, className, ...props }) => (
  <div
    className={clsx('p-6 pb-0', className)}
    {...props}
  >
    {children}
  </div>
);

// ============================================================================
// Modal Body Component
// ============================================================================

const ModalBody = ({ children, className, ...props }) => (
  <div
    className={clsx('p-6', className)}
    {...props}
  >
    {children}
  </div>
);

// ============================================================================
// Modal Footer Component
// ============================================================================

const ModalFooter = ({ children, className, ...props }) => (
  <div
    className={clsx(
      'flex items-center justify-end gap-3 p-6 pt-4 border-t border-dark-100 dark:border-dark-800',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// ============================================================================
// Confirmation Modal Component
// ============================================================================

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon: Icon,
}) => {
  const variantConfig = {
    danger: {
      icon: Icon || (({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )),
      iconColor: 'danger',
      buttonVariant: 'danger',
    },
    warning: {
      icon: Icon || (({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )),
      iconColor: 'warning',
      buttonVariant: 'warning',
    },
    info: {
      icon: Icon || (({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )),
      iconColor: 'info',
      buttonVariant: 'primary',
    },
  };

  const config = variantConfig[variant] || variantConfig.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      icon={config.icon}
      iconColor={config.iconColor}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary px-4"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              'btn px-4',
              config.buttonVariant === 'danger' && 'btn-danger',
              config.buttonVariant === 'warning' && 'bg-amber-500 hover:bg-amber-600 text-white',
              config.buttonVariant === 'primary' && 'btn-primary'
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </>
      }
    />
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter, ConfirmationModal };
export default Modal;