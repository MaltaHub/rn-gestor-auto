import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../utils/performance';
import { useFPS, useMemoryMonitor } from '../../hooks/usePerformance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showFPS?: boolean;
  showMemory?: boolean;
  showMetrics?: boolean;
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right',
  showFPS = true,
  showMemory = true,
  showMetrics = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const fps = useFPS();
  const memoryInfo = useMemoryMonitor();

  useEffect(() => {
    if (!enabled || !showMetrics) return;

    const interval = setInterval(() => {
      const allMetrics = performanceMonitor.getAllMetrics();
      setMetrics(allMetrics);
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, showMetrics]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryUsagePercent = (): number => {
    if (!memoryInfo) return 0;
    return (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
  };

  const getMemoryColor = (percent: number): string => {
    if (percent < 50) return 'text-green-400';
    if (percent < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`fixed z-50 ${positionClasses[position]} ${className}`}
      style={{ fontFamily: 'monospace' }}
    >
      <div className="bg-black/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
        {/* Header compacto */}
        <div
          className="px-3 py-2 cursor-pointer flex items-center justify-between min-w-[200px]"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4 text-sm">
            {showFPS && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">FPS:</span>
                <span className={getFPSColor(fps)}>{fps}</span>
              </div>
            )}
            
            {showMemory && memoryInfo && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">MEM:</span>
                <span className={getMemoryColor(getMemoryUsagePercent())}>
                  {getMemoryUsagePercent().toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          <button className="text-gray-400 hover:text-white transition-colors">
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Detalhes expandidos */}
        {isExpanded && (
          <div className="border-t border-gray-700 p-3 space-y-3 max-h-96 overflow-y-auto">
            {/* Informações de FPS detalhadas */}
            {showFPS && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Frame Rate
                </h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current FPS:</span>
                    <span className={getFPSColor(fps)}>{fps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-green-400">60</span>
                  </div>
                </div>
              </div>
            )}

            {/* Informações de memória detalhadas */}
            {showMemory && memoryInfo && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Memory Usage
                </h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Used:</span>
                    <span className="text-white">
                      {formatBytes(memoryInfo.usedJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white">
                      {formatBytes(memoryInfo.totalJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Limit:</span>
                    <span className="text-white">
                      {formatBytes(memoryInfo.jsHeapSizeLimit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Usage:</span>
                    <span className={getMemoryColor(getMemoryUsagePercent())}>
                      {getMemoryUsagePercent().toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Métricas de performance */}
            {showMetrics && Object.keys(metrics).length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Performance Metrics
                </h4>
                <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(metrics).map(([name, data]) => (
                    <div key={name} className="space-y-1">
                      <div className="text-gray-300 font-medium truncate" title={name}>
                        {name.length > 25 ? `${name.substring(0, 25)}...` : name}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg:</span>
                          <span className="text-white">
                            {formatDuration(data.avg)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Count:</span>
                          <span className="text-white">{data.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min:</span>
                          <span className="text-green-400">
                            {formatDuration(data.min)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max:</span>
                          <span className="text-red-400">
                            {formatDuration(data.max)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex space-x-2 pt-2 border-t border-gray-700">
              <button
                onClick={() => {
                  performanceMonitor.clearMetrics();
                  setMetrics({});
                }}
                className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
              >
                Clear Metrics
              </button>
              
              <button
                onClick={() => {
                  const data = {
                    fps,
                    memory: memoryInfo,
                    metrics,
                    timestamp: new Date().toISOString()
                  };
                  console.log('Performance Report:', data);
                }}
                className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
              >
                Log Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;