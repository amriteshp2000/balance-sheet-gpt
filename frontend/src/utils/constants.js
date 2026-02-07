// src/utils/constants.js

/**
 * Application Constants
 * Central location for all app-wide constants and configurations
 */

// ============================================================================
// API Configuration
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH_TOKEN: '/api/auth/refresh',
  
  // Dashboard
  DASHBOARD_DATA: '/api/dashboard/data',
  
  // Chat
  CHAT: '/api/chat',
  CHAT_HISTORY: '/api/chat/history',
  
  // Upload
  UPLOAD: '/api/upload',
  UPLOAD_STATUS: '/api/upload/status',
  
  // Data Management
  DATA_ASSIGN: '/api/data/assign',
  DATA_DELETE: '/api/data/delete',
  
  // Roles & Companies
  ROLES: '/api/roles',
  COMPANIES: '/api/companies',
  
  // Health & Info
  HEALTH: '/api/health',
  INFO: '/api/info',
};

// ============================================================================
// Authentication Constants
// ============================================================================

export const AUTH = {
  TOKEN_KEY: 'finbot_token',
  USER_KEY: 'finbot_user',
  REFRESH_TOKEN_KEY: 'finbot_refresh_token',
  TOKEN_EXPIRY_KEY: 'finbot_token_expiry',
  THEME_KEY: 'finbot_theme',
  
  // Token expiry buffer (refresh 5 minutes before expiry)
  EXPIRY_BUFFER_MS: 5 * 60 * 1000,
  
  // Session timeout (24 hours)
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000,
};

// ============================================================================
// User Roles
// ============================================================================

export const USER_ROLES = {
  CEO: 'ceo',
  CFO: 'cfo',
  ANALYST: 'analyst',
  ACCOUNTANT: 'accountant',
  MANAGER: 'manager',
  AUDITOR: 'auditor',
  ADMIN: 'admin',
  VIEWER: 'viewer',
};

export const ROLE_CONFIG = {
  [USER_ROLES.CEO]: {
    id: 'ceo',
    label: 'CEO',
    icon: '👔',
    color: 'amber',
    permissions: ['view_all', 'export', 'chat', 'assign'],
    description: 'Full access to all company data',
  },
  [USER_ROLES.CFO]: {
    id: 'cfo',
    label: 'CFO',
    icon: '💰',
    color: 'green',
    permissions: ['view_all', 'export', 'chat', 'assign', 'upload'],
    description: 'Full financial data access',
  },
  [USER_ROLES.ANALYST]: {
    id: 'analyst',
    label: 'Analyst',
    icon: '📊',
    color: 'blue',
    permissions: ['view_all', 'export', 'chat', 'upload', 'assign'],
    description: 'Can upload and analyze data',
  },
  [USER_ROLES.ACCOUNTANT]: {
    id: 'accountant',
    label: 'Accountant',
    icon: '📋',
    color: 'purple',
    permissions: ['view_assigned', 'export', 'chat'],
    description: 'Access to assigned financial records',
  },
  [USER_ROLES.MANAGER]: {
    id: 'manager',
    label: 'Manager',
    icon: '👤',
    color: 'indigo',
    permissions: ['view_assigned', 'export', 'chat'],
    description: 'Department level access',
  },
  [USER_ROLES.AUDITOR]: {
    id: 'auditor',
    label: 'Auditor',
    icon: '🔍',
    color: 'red',
    permissions: ['view_all', 'export', 'chat'],
    description: 'Read-only audit access',
  },
  [USER_ROLES.ADMIN]: {
    id: 'admin',
    label: 'Administrator',
    icon: '⚙️',
    color: 'gray',
    permissions: ['view_all', 'export', 'chat', 'upload', 'assign', 'admin'],
    description: 'System administrator',
  },
  [USER_ROLES.VIEWER]: {
    id: 'viewer',
    label: 'Viewer',
    icon: '👁️',
    color: 'slate',
    permissions: ['view_assigned'],
    description: 'Read-only access',
  },
};

export const ROLE_OPTIONS = Object.values(ROLE_CONFIG);

// ============================================================================
// Company Configuration
// ============================================================================

export const COMPANY_OPTIONS = [
  { id: 'all', label: 'All Companies', icon: '🏢' },
  { id: 'company_a', label: 'Company A', icon: '🅰️' },
  { id: 'company_b', label: 'Company B', icon: '🅱️' },
  { id: 'company_c', label: 'Company C', icon: '©️' },
  { id: 'company_d', label: 'Company D', icon: '🇩' },
];

// ============================================================================
// File Upload Constants
// ============================================================================

export const UPLOAD = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILE_SIZE_DISPLAY: '50MB',
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large uploads
};

export const FILE_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

// ============================================================================
// Chat Constants
// ============================================================================

export const CHAT = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_CONTEXT_LENGTH: 15000,
  TYPING_INDICATOR_DELAY: 500,
  MESSAGE_BATCH_SIZE: 50,
};

export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system',
  ERROR: 'error',
  LOADING: 'loading',
};

export const SUGGESTED_PROMPTS = [
  {
    id: 'revenue',
    text: "What's our total revenue?",
    category: 'financial',
    icon: '💰',
  },
  {
    id: 'balance_sheet',
    text: 'Show me the balance sheet summary',
    category: 'reports',
    icon: '📊',
  },
  {
    id: 'compare_quarters',
    text: 'Compare Q1 vs Q2 performance',
    category: 'analysis',
    icon: '📈',
  },
  {
    id: 'expenses',
    text: 'What are our largest expenses?',
    category: 'financial',
    icon: '💸',
  },
  {
    id: 'profit_margin',
    text: 'Calculate our profit margin',
    category: 'analysis',
    icon: '📉',
  },
  {
    id: 'cash_flow',
    text: 'Analyze our cash flow statement',
    category: 'reports',
    icon: '💵',
  },
  {
    id: 'assets',
    text: 'List all current assets',
    category: 'financial',
    icon: '🏦',
  },
  {
    id: 'liabilities',
    text: 'What are our total liabilities?',
    category: 'financial',
    icon: '📝',
  },
];

export const PROMPT_CATEGORIES = {
  financial: { label: 'Financial', color: 'green' },
  reports: { label: 'Reports', color: 'blue' },
  analysis: { label: 'Analysis', color: 'purple' },
};

// ============================================================================
// Dashboard Constants
// ============================================================================

export const DASHBOARD = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_TABLES_DISPLAY: 20,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
};

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

// ============================================================================
// Theme Configuration
// ============================================================================

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const THEME_COLORS = {
  finbot: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  profit: {
    light: '#10b981',
    DEFAULT: '#059669',
    dark: '#047857',
  },
  loss: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
};

// ============================================================================
// Responsive Breakpoints
// ============================================================================

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
  largeDesktop: `(min-width: ${BREAKPOINTS.xl}px)`,
};

// ============================================================================
// Animation Durations
// ============================================================================

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// ============================================================================
// Date & Time Formats
// ============================================================================

export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  TIME_ONLY: 'h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  RELATIVE: 'relative', // for "2 hours ago" style
};

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    MESSAGE: 'Username must be 3-50 characters, alphanumeric and underscores only',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
    MESSAGE: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
};

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid username or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Upload errors
  FILE_TOO_LARGE: `File size exceeds maximum limit of ${UPLOAD.MAX_FILE_SIZE_DISPLAY}`,
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF files are allowed.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  
  // Data errors
  NO_DATA: 'No data available',
  FETCH_FAILED: 'Failed to fetch data. Please try again.',
  
  // Chat errors
  CHAT_ERROR: 'Failed to get response. Please try again.',
  MESSAGE_TOO_LONG: `Message exceeds maximum length of ${CHAT.MAX_MESSAGE_LENGTH} characters`,
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully',
  UPLOAD_SUCCESS: 'File uploaded successfully',
  DATA_ASSIGNED: 'Data assigned successfully',
  DATA_REFRESHED: 'Data refreshed successfully',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
  SETTINGS_SAVED: 'Settings saved successfully',
};

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  OPEN_CHAT: 'ctrl+k',
  CLOSE_MODAL: 'Escape',
  SUBMIT_FORM: 'ctrl+Enter',
  REFRESH: 'ctrl+r',
  SEARCH: 'ctrl+f',
  TOGGLE_THEME: 'ctrl+shift+t',
  NAVIGATE_UP: 'ArrowUp',
  NAVIGATE_DOWN: 'ArrowDown',
  SELECT: 'Enter',
};

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'finbot_token',
  AUTH_USER: 'finbot_user',
  THEME: 'finbot_theme',
  SIDEBAR_COLLAPSED: 'finbot_sidebar_collapsed',
  CHAT_HISTORY: 'finbot_chat_history',
  RECENT_SEARCHES: 'finbot_recent_searches',
  TABLE_PREFERENCES: 'finbot_table_prefs',
  DASHBOARD_LAYOUT: 'finbot_dashboard_layout',
  LAST_VIEWED_PAGE: 'finbot_last_page',
};

// ============================================================================
// Navigation Items
// ============================================================================

export const NAV_ITEMS = {
  MAIN: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['all'],
    },
    {
      id: 'documents',
      label: 'Documents',
      path: '/documents',
      icon: 'FileSpreadsheet',
      roles: ['all'],
    },
    {
      id: 'upload',
      label: 'Upload',
      path: '/upload',
      icon: 'Upload',
      roles: [USER_ROLES.ANALYST, USER_ROLES.CFO, USER_ROLES.ADMIN],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics',
      icon: 'BarChart3',
      roles: [USER_ROLES.CEO, USER_ROLES.CFO, USER_ROLES.ANALYST],
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: 'FileText',
      roles: ['all'],
    },
  ],
  BOTTOM: [
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['all'],
    },
    {
      id: 'help',
      label: 'Help & Support',
      path: '/help',
      icon: 'HelpCircle',
      roles: ['all'],
    },
  ],
};

// ============================================================================
// Financial Metrics
// ============================================================================

export const FINANCIAL_METRICS = {
  REVENUE: 'revenue',
  EXPENSES: 'expenses',
  NET_INCOME: 'net_income',
  GROSS_PROFIT: 'gross_profit',
  OPERATING_INCOME: 'operating_income',
  TOTAL_ASSETS: 'total_assets',
  TOTAL_LIABILITIES: 'total_liabilities',
  EQUITY: 'equity',
  CASH_FLOW: 'cash_flow',
  CURRENT_RATIO: 'current_ratio',
  DEBT_TO_EQUITY: 'debt_to_equity',
  ROI: 'roi',
  ROE: 'roe',
};

export const METRIC_CONFIG = {
  [FINANCIAL_METRICS.REVENUE]: {
    label: 'Revenue',
    format: 'currency',
    color: 'green',
    icon: 'DollarSign',
  },
  [FINANCIAL_METRICS.EXPENSES]: {
    label: 'Expenses',
    format: 'currency',
    color: 'red',
    icon: 'TrendingDown',
  },
  [FINANCIAL_METRICS.NET_INCOME]: {
    label: 'Net Income',
    format: 'currency',
    color: 'blue',
    icon: 'TrendingUp',
  },
  [FINANCIAL_METRICS.TOTAL_ASSETS]: {
    label: 'Total Assets',
    format: 'currency',
    color: 'purple',
    icon: 'Wallet',
  },
  [FINANCIAL_METRICS.TOTAL_LIABILITIES]: {
    label: 'Total Liabilities',
    format: 'currency',
    color: 'orange',
    icon: 'CreditCard',
  },
};

// ============================================================================
// Export All
// ============================================================================

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  AUTH,
  USER_ROLES,
  ROLE_CONFIG,
  ROLE_OPTIONS,
  COMPANY_OPTIONS,
  UPLOAD,
  FILE_STATUS,
  CHAT,
  MESSAGE_TYPES,
  SUGGESTED_PROMPTS,
  PROMPT_CATEGORIES,
  DASHBOARD,
  VIEW_MODES,
  SORT_DIRECTIONS,
  THEMES,
  THEME_COLORS,
  BREAKPOINTS,
  MEDIA_QUERIES,
  ANIMATION,
  DATE_FORMATS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS,
  NAV_ITEMS,
  FINANCIAL_METRICS,
  METRIC_CONFIG,
};