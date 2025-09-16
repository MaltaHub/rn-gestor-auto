import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from "vite";
// import { pwaConfig } from "./vite-pwa.config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: true
      }
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger(),
      
      // Vendor chunk splitting
      splitVendorChunkPlugin(),
      
      // Bundle analyzer (when ANALYZE=true)
      process.env.ANALYZE && visualizer({
        filename: 'dist/bundle-report.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      }),
      // PWA configuration (temporariamente desabilitado)
      // pwaConfig
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./src/shared"),
        "@entities": path.resolve(__dirname, "./src/entities"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@assets": path.resolve(__dirname, "./src/assets")
      },
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate source maps in production
      sourcemap: isProduction,
      
      // Minification
      minify: isProduction ? 'terser' : false,
      
      // Terser options
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        mangle: {
          safari10: true
        }
      } : undefined,
      
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // React ecosystem
            'react-vendor': ['react', 'react-dom'],
            
            // State management
            'state-vendor': ['zustand', '@tanstack/react-query'],
            
            // UI libraries
            'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
            
            // Utilities
            'utils-vendor': ['lodash', 'date-fns', 'clsx'],
            
            // Supabase
            'supabase-vendor': ['@supabase/supabase-js'],
            
            // Charts and visualization
            'charts-vendor': ['recharts'],
            
            // Form handling
            'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // Router
            'router-vendor': ['react-router-dom']
          },
          
          // Asset file names
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return `images/[name].[hash][extname]`;
            }
            
            if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `fonts/[name].[hash][extname]`;
            }
            
            if (ext === 'css') {
              return `css/[name].[hash][extname]`;
            }
            
            return `assets/[name].[hash][extname]`;
          },
          
          // Chunk file names
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js'
        }
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // Asset size limit
      assetsInlineLimit: 8192, // 8kb
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Report compressed size
      reportCompressedSize: isProduction,
      
      // Emit manifest
      manifest: isProduction
    },

    // CSS configuration
    css: {
      // CSS modules
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: isProduction 
          ? '[hash:base64:8]'
          : '[name]__[local]--[hash:base64:5]'
      },
      
      // PostCSS
      postcss: './postcss.config.js'
    },

    // Optimization
    optimizeDeps: {
      // Include dependencies that should be pre-bundled
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'zustand',
        '@supabase/supabase-js',
        'lodash',
        'date-fns',
        'clsx'
      ]
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    },

    // ESBuild configuration
    esbuild: {
      // Drop console and debugger in production
      drop: isProduction ? ['console', 'debugger'] : [],
      
      // Target
      target: 'es2020'
    }
  };
});
