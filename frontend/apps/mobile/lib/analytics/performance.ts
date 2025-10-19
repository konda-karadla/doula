/**
 * Performance Monitoring
 * 
 * Track app performance metrics like:
 * - Screen load times
 * - API response times
 * - Component render times
 * - Memory usage
 */

import { analytics } from './analytics';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = true;

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`[Performance] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Start tracking a metric
   */
  startMetric(name: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };

    this.metrics.set(name, metric);
    console.log(`[Performance] Started: ${name}`);
  }

  /**
   * End tracking a metric and report it
   */
  endMetric(name: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`[Performance] Metric not found: ${name}`);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.metadata = { ...metric.metadata, ...metadata };

    console.log(`[Performance] Completed: ${name} (${duration}ms)`);

    // Report to analytics
    analytics.trackTiming('performance', name, duration);

    // Clean up
    this.metrics.delete(name);

    return duration;
  }

  /**
   * Track screen load time
   */
  trackScreenLoad(screenName: string) {
    const metricName = `screen_load_${screenName}`;
    this.startMetric(metricName, { screen: screenName });

    return () => {
      const duration = this.endMetric(metricName);
      if (duration && duration > 3000) {
        console.warn(`[Performance] Slow screen load: ${screenName} (${duration}ms)`);
      }
    };
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, method: string = 'GET') {
    const metricName = `api_${method}_${endpoint}`;
    this.startMetric(metricName, { endpoint, method });

    return (statusCode?: number, error?: Error) => {
      const duration = this.endMetric(metricName, { statusCode, error: error?.message });
      
      if (duration) {
        if (error) {
          console.error(`[Performance] API Error: ${endpoint} (${duration}ms)`, error);
        } else if (duration > 5000) {
          console.warn(`[Performance] Slow API: ${endpoint} (${duration}ms)`);
        }
      }
    };
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string) {
    const metricName = `component_${componentName}`;
    this.startMetric(metricName, { component: componentName });

    return () => {
      this.endMetric(metricName);
    };
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMetric(name, metadata);
    try {
      const result = await fn();
      this.endMetric(name);
      return result;
    } catch (error) {
      this.endMetric(name, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMetric(name, metadata);
    try {
      const result = fn();
      this.endMetric(name);
      return result;
    } catch (error) {
      this.endMetric(name, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Report all active metrics (for debugging)
   */
  reportActiveMetrics() {
    console.log('[Performance] Active metrics:', Array.from(this.metrics.keys()));
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    console.log('[Performance] Metrics cleared');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startMetric = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.startMetric(name, metadata);

export const endMetric = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.endMetric(name, metadata);

export const trackScreenLoad = (screenName: string) =>
  performanceMonitor.trackScreenLoad(screenName);

export const trackApiCall = (endpoint: string, method?: string) =>
  performanceMonitor.trackApiCall(endpoint, method);

export const trackComponentRender = (componentName: string) =>
  performanceMonitor.trackComponentRender(componentName);

export const measureAsync = <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
) => performanceMonitor.measureAsync(name, fn, metadata);

export const measure = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
) => performanceMonitor.measure(name, fn, metadata);

/**
 * React hook for tracking component mount/unmount performance
 */
export function usePerformanceTracking(componentName: string) {
  const startTime = Date.now();

  return () => {
    const duration = Date.now() - startTime;
    console.log(`[Performance] ${componentName} mounted in ${duration}ms`);
  };
}

/**
 * React hook for tracking screen load performance
 */
export function useScreenPerformance(screenName: string) {
  const startTime = Date.now();

  return () => {
    const duration = Date.now() - startTime;
    console.log(`[Performance] ${screenName} loaded in ${duration}ms`);
    analytics.trackTiming('screen', screenName, duration);
  };
}

