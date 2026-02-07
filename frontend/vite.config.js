// frontend/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // =========================================================================
    // PLUGINS
    // =========================================================================
    plugins: [
      react({
        // Enable Fast Refresh for React
        fastRefresh: true,
        // Babel configuration (optional)
        babel: {
          plugins: [
            // Add any babel plugins here if needed
          ],
        },
      }),
    ],

    // =========================================================================
    // PATH ALIASES
    // =========================================================================
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },

    // =========================================================================
    // DEVELOPMENT SERVER
    // =========================================================================
    server: {
      // Port to run the dev server
      port: 5173,
      
      // Expose to network (allows access from other devices)
      host: true,
      
      // Automatically open browser on start
      open: true,
      
      // Enable CORS
      cors: true,
      
      // Strict port - fail if port is already in use
      strictPort: false,
      
      // Proxy configuration for API requests
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          // Rewrite path if needed (uncomment if your backend doesn't use /api prefix)
          // rewrite: (path) => path.replace(/^\/api/, ''),
          
          // Configure proxy for WebSocket if needed
          ws: true,
          
          // Custom error handling
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔴 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔵 Proxying:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('🟢 Response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
      
      // Hot Module Replacement configuration
      hmr: {
        overlay: true,
        // If you're behind a proxy, you might need to configure the client port
        // clientPort: 5173,
      },
      
      // Watch options
      watch: {
        // Use polling if file system events don't work (e.g., in Docker)
        usePolling: false,
        // Ignore certain patterns
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
    },

    // =========================================================================
    // PREVIEW SERVER (for production build preview)
    // =========================================================================
    preview: {
      port: 4173,
      host: true,
      open: true,
      cors: true,
    },

    // =========================================================================
    // BUILD CONFIGURATION
    // =========================================================================
    build: {
      // Output directory
      outDir: 'dist',
      
      // Assets directory (relative to outDir)
      assetsDir: 'assets',
      
      // Generate source maps for debugging
      sourcemap: mode === 'development' ? true : false,
      
      // Minification
      minify: mode === 'production' ? 'terser' : false,
      
      // Target browsers
      target: 'esnext',
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Rollup options for advanced configuration
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom'],
            
            // React Router
            'router-vendor': ['react-router-dom'],
            
            // State management
            'state-vendor': ['zustand'],
            
            // UI libraries
            'ui-vendor': ['framer-motion', 'lucide-react'],
            
            // Utilities
            'utils-vendor': ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
            
            // Markdown
            'markdown-vendor': ['react-markdown', 'remark-gfm'],
          },
          
          // Chunk file naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop().split('.')[0]
              : 'chunk';
            return `assets/js/${facadeModuleId}-[hash].js`;
          },
          
          // Entry file naming
          entryFileNames: 'assets/js/[name]-[hash].js',
          
          // Asset file naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            if (/\.css$/i.test(assetInfo.name)) {
              return `assets/css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
        
        // External dependencies (if any should not be bundled)
        // external: [],
      },
      
      // Terser options for production minification
      terserOptions: {
        compress: {
          // Remove console.log in production
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          // Remove unused code
          dead_code: true,
          // Optimize conditionals
          conditionals: true,
          // Evaluate constant expressions
          evaluate: true,
          // Remove unreachable code
          unused: true,
        },
        mangle: {
          // Mangle properties (be careful with this)
          properties: false,
        },
        format: {
          // Remove comments in production
          comments: false,
        },
      },
      
      // Chunk size warning limit (in kB)
      chunkSizeWarningLimit: 1000,
      
      // Enable/disable CSS minification
      cssMinify: true,
      
      // Report compressed chunk sizes
      reportCompressedSize: true,
      
      // Empty outDir before build
      emptyOutDir: true,
    },

    // =========================================================================
    // CSS CONFIGURATION
    // =========================================================================
    css: {
      // Enable CSS source maps in development
      devSourcemap: true,
      
      // PostCSS configuration (can also be in postcss.config.js)
      postcss: './postcss.config.js',
      
      // CSS modules configuration
      modules: {
        // Generate scoped class names
        generateScopedName: mode === 'production'
          ? '[hash:base64:8]'
          : '[name]__[local]__[hash:base64:5]',
        // Hash prefix
        hashPrefix: 'finbot',
      },
      
      // Preprocessor options
      preprocessorOptions: {
        // If using SCSS
        // scss: {
        //   additionalData: `@import "@/styles/variables.scss";`,
        // },
      },
    },

    // =========================================================================
    // DEPENDENCY OPTIMIZATION
    // =========================================================================
    optimizeDeps: {
      // Dependencies to pre-bundle
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'axios',
        'framer-motion',
        'lucide-react',
        'react-hot-toast',
        'react-markdown',
        'remark-gfm',
        'date-fns',
        'clsx',
        'tailwind-merge',
      ],
      
      // Dependencies to exclude from pre-bundling
      exclude: [],
      
      // Force optimization even if not detected
      // force: true,
    },

    // =========================================================================
    // ENVIRONMENT VARIABLES
    // =========================================================================
    // Prefix for env variables exposed to client
    envPrefix: 'VITE_',
    
    // Directory to load env files from
    envDir: './',

    // =========================================================================
    // DEFINE GLOBAL CONSTANTS
    // =========================================================================
    define: {
      // App version from package.json
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
      
      // Build timestamp
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      
      // Environment
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
    },

    // =========================================================================
    // ESBUILD CONFIGURATION
    // =========================================================================
    esbuild: {
      // JSX factory (default is React.createElement)
      // jsxFactory: 'React.createElement',
      // jsxFragment: 'React.Fragment',
      
      // Drop console and debugger in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      
      // Legal comments handling
      legalComments: 'none',
    },

    // =========================================================================
    // JSON CONFIGURATION
    // =========================================================================
    json: {
      // Enable named imports from JSON files
      namedExports: true,
      
      // Stringify JSON (smaller bundles but no tree-shaking)
      stringify: false,
    },

    // =========================================================================
    // LOGGING
    // =========================================================================
    logLevel: mode === 'development' ? 'info' : 'warn',
    
    // Clear screen on rebuild
    clearScreen: true,
  };
});