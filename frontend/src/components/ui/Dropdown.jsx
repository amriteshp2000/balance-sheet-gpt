// src/components/ui/Dropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

/**
 * Dropdown Component
 * A customizable dropdown/select component
 */

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  size = 'md',
  className,
  dropdownClassName,
  optionClassName,
  renderOption,
  renderValue,
  icon: Icon,
  position = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter((option) =>
        (option.label || option).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option(s)
  const selectedOption = multiple
    ? options.filter((opt) => value?.includes(opt.value || opt))
    : options.find((opt) => (opt.value || opt) === value);

  // Handle option selection
  const handleSelect = (option) => {
    const optionValue = option.value || option;
    
    if (multiple) {
      const newValue = value?.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...(value || []), optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  // Display value
  const displayValue = () => {
    if (multiple && selectedOption?.length > 0) {
      return selectedOption.map((opt) => opt.label || opt).join(', ');
    }
    if (!multiple && selectedOption) {
      return selectedOption.label || selectedOption;
    }
    return null;
  };

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between gap-2',
          'bg-white dark:bg-dark-800',
          'border rounded-xl',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-finbot-500',
          sizeClasses[size],
          isOpen && 'ring-2 ring-finbot-500 border-finbot-500',
          error
            ? 'border-loss focus:ring-loss'
            : 'border-dark-200 dark:border-dark-700',
          disabled && 'opacity-50 cursor-not-allowed bg-dark-100 dark:bg-dark-900'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {Icon && <Icon className="w-5 h-5 text-dark-400 flex-shrink-0" />}
          
          {renderValue ? (
            renderValue(selectedOption)
          ) : (
            <span className={clsx(
              'truncate',
              displayValue()
                ? 'text-dark-900 dark:text-white'
                : 'text-dark-400 dark:text-dark-500'
            )}>
              {displayValue() || placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Clear Button */}
          {clearable && displayValue() && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-md"
            >
              <svg className="w-4 h-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Chevron */}
          <ChevronDown
            className={clsx(
              'w-5 h-5 text-dark-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute z-50 w-full mt-2',
              'bg-white dark:bg-dark-800',
              'border border-dark-200 dark:border-dark-700',
              'rounded-xl shadow-lg',
              'overflow-hidden',
              position === 'top' && 'bottom-full mb-2',
              dropdownClassName
            )}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-dark-200 dark:border-dark-700">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-finbot-500"
                  autoFocus
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const optionValue = option.value || option;
                  const optionLabel = option.label || option;
                  const isSelected = multiple
                    ? value?.includes(optionValue)
                    : value === optionValue;
                  const isDisabled = option.disabled;

                  return (
                    <button
                      key={optionValue}
                      type="button"
                      onClick={() => !isDisabled && handleSelect(option)}
                      disabled={isDisabled}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                        'transition-colors duration-150',
                        isSelected
                          ? 'bg-finbot-50 dark:bg-finbot-900/30 text-finbot-700 dark:text-finbot-300'
                          : 'hover:bg-dark-50 dark:hover:bg-dark-700',
                        isDisabled && 'opacity-50 cursor-not-allowed',
                        optionClassName
                      )}
                    >
                      {/* Option Icon */}
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}

                      {/* Option Content */}
                      <div className="flex-1 min-w-0">
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <>
                            <span className="block text-sm font-medium truncate">
                              {optionLabel}
                            </span>
                            {option.description && (
                              <span className="block text-xs text-dark-500 dark:text-dark-400 truncate">
                                {option.description}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Check Mark */}
                      {isSelected && (
                        <Check className="w-4 h-4 text-finbot-600 dark:text-finbot-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text / Error */}
      {(helperText || error) && (
        <p className={clsx(
          'mt-1.5 text-sm',
          error ? 'text-loss' : 'text-dark-500 dark:text-dark-400'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// Select Component (Alias)
// ============================================================================

const Select = Dropdown;

// ============================================================================
// Multi Select Component
// ============================================================================

const MultiSelect = (props) => <Dropdown {...props} multiple />;

export { Dropdown, Select, MultiSelect };
export default Dropdown;