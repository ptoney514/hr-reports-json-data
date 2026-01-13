import React from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Home,
  BarChart3
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'general',
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      errorType: ErrorBoundary.categorizeError(error)
    };
  }

  static categorizeError(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    if (errorMessage.includes('chart') || errorMessage.includes('render')) {
      return 'chart';
    }
    if (errorMessage.includes('data') || errorMessage.includes('json')) {
      return 'data';
    }
    if (errorMessage.includes('timeout')) {
      return 'timeout';
    }
    return 'general';
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = async () => {
    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1
    });

    // Wait a moment to show the retry state
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Call custom retry function if provided
    if (this.props.onRetry) {
      try {
        await this.props.onRetry();
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'general',
      retryCount: 0,
      isRetrying: false
    });
  };

  getErrorDetails() {
    const { errorType } = this.state;
    
    const errorDetails = {
      network: {
        icon: WifiOff,
        title: 'Network Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        color: 'red',
        suggestions: [
          'Check your internet connection',
          'Verify the server is accessible',
          'Try refreshing the page',
          'Contact IT support if the problem persists'
        ]
      },
      chart: {
        icon: BarChart3,
        title: 'Chart Rendering Error',
        message: 'There was an issue displaying the chart. The data may be in an unexpected format.',
        color: 'orange',
        suggestions: [
          'Try refreshing the dashboard',
          'Check if the data source is available',
          'Contact support if charts consistently fail to load'
        ]
      },
      data: {
        icon: Database,
        title: 'Data Loading Error',
        message: 'Failed to load or process the dashboard data. The data format may be invalid.',
        color: 'red',
        suggestions: [
          'Refresh the page to reload data',
          'Check data source connectivity',
          'Verify data format is correct',
          'Try again in a few minutes'
        ]
      },
      timeout: {
        icon: Wifi,
        title: 'Request Timeout',
        message: 'The request took too long to complete. The server may be experiencing high load.',
        color: 'yellow',
        suggestions: [
          'Try again in a few moments',
          'Check your internet connection speed',
          'Contact support if timeouts persist'
        ]
      },
      general: {
        icon: AlertTriangle,
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred while loading the dashboard.',
        color: 'red',
        suggestions: [
          'Try refreshing the page',
          'Clear your browser cache',
          'Contact support if the problem continues'
        ]
      }
    };

    return errorDetails[errorType] || errorDetails.general;
  }

  getColorClasses(color) {
    const colorMap = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        button: 'bg-red-600 hover:bg-red-700',
        icon: 'text-red-500'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        button: 'bg-orange-600 hover:bg-orange-700',
        icon: 'text-orange-500'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        icon: 'text-yellow-500'
      }
    };

    return colorMap[color] || colorMap.red;
  }

  render() {
    if (this.state.hasError) {
      const errorDetails = this.getErrorDetails();
      const colorClasses = this.getColorClasses(errorDetails.color);
      const IconComponent = errorDetails.icon;
      const { retryCount, isRetrying } = this.state;

      // Fallback UI based on error boundary type
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.handleReset);
      }

      return (
        <div className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg p-6 m-4`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <IconComponent className={`${colorClasses.icon}`} size={48} />
            </div>
            
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${colorClasses.text} mb-2`}>
                {errorDetails.title}
              </h3>
              
              <p className={`${colorClasses.text} mb-4`}>
                {errorDetails.message}
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className={`cursor-pointer text-sm ${colorClasses.text} font-medium`}>
                    Technical Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Suggestions */}
              <div className="mb-4">
                <h4 className={`font-medium ${colorClasses.text} mb-2`}>
                  What you can try:
                </h4>
                <ul className={`text-sm ${colorClasses.text} space-y-1`}>
                  {errorDetails.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className={`flex items-center gap-2 px-4 py-2 ${colorClasses.button} text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <RefreshCw 
                    size={16} 
                    className={isRetrying ? 'animate-spin' : ''} 
                  />
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </button>

                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  <Home size={16} />
                  Reset Dashboard
                </button>

                {this.props.showHomeButton !== false && (
                  <button
                    onClick={() => window.location.href = '/dashboards'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Home size={16} />
                    Go to Dashboard Home
                  </button>
                )}
              </div>

              {/* Retry Count */}
              {retryCount > 0 && (
                <div className="mt-3 text-xs text-gray-600">
                  Retry attempts: {retryCount}
                  {retryCount >= 3 && (
                    <span className="ml-2 text-orange-600">
                      • Consider contacting support if issues persist
                    </span>
                  )}
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

export default ErrorBoundary; 