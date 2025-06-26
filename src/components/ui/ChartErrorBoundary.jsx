import React from 'react';
import { BarChart3, AlertTriangle, RefreshCw, Database } from 'lucide-react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    this.setState({ error, errorInfo });

    // Report chart-specific errors
    if (this.props.onChartError) {
      this.props.onChartError(error, errorInfo, this.props.chartType);
    }
  }

  handleRetry = async () => {
    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    if (this.props.onRetry) {
      try {
        await this.props.onRetry();
      } catch (error) {
        console.error('Chart retry failed:', error);
      }
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    });
  };

  getChartErrorMessage() {
    const { error } = this.state;
    const { chartType = 'Chart' } = this.props;
    
    if (error?.message?.includes('data')) {
      return `${chartType} cannot render due to invalid or missing data.`;
    }
    if (error?.message?.includes('recharts')) {
      return `${chartType} rendering library encountered an error.`;
    }
    if (error?.message?.includes('Cannot read property')) {
      return `${chartType} received data in an unexpected format.`;
    }
    
    return `${chartType} failed to render properly.`;
  }

  render() {
    if (this.state.hasError) {
      const { chartType = 'Chart', title, height = 300, showFullError = false } = this.props;
      const { retryCount, isRetrying } = this.state;

      // Compact error display for charts
      return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border ${this.props.className || ''}`}>
          {title && (
            <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
          )}
          
          <div 
            className="flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
            style={{ height: `${height}px` }}
          >
            <AlertTriangle size={48} className="text-orange-500 mb-3" />
            
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">
                {chartType} Error
              </h4>
              
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                {this.getChartErrorMessage()}
              </p>

              {showFullError && process.env.NODE_ENV === 'development' && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-xs text-gray-500">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-left">
                    {this.state.error?.toString()}
                  </div>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
                
                {this.props.onReset && (
                  <button
                    onClick={this.props.onReset}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  >
                    <Database size={12} />
                    Reset Data
                  </button>
                )}
              </div>

              {retryCount > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Attempts: {retryCount}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary; 