import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const NetworkErrorBoundary = ({ 
  children, 
  onRetry, 
  maxRetries = 3,
  retryDelay = 1000,
  showNetworkStatus = true 
}) => {
  const [networkError, setNetworkError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastRetryTime, setLastRetryTime] = useState(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-retry when coming back online
      if (networkError && retryCount < maxRetries) {
        handleRetry();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError({
        type: 'offline',
        message: 'No internet connection detected'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [networkError, retryCount, maxRetries]);

  // Exponential backoff calculation
  const getRetryDelay = (attempt) => {
    return Math.min(retryDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  };

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setLastRetryTime(new Date());
    
    const delay = getRetryDelay(retryCount);
    
    try {
      // Wait for exponential backoff delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (onRetry) {
        await onRetry();
      }
      
      // Success - clear error state
      setNetworkError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('Network retry failed:', error);
      setRetryCount(prev => prev + 1);
      setNetworkError({
        type: 'retry_failed',
        message: error.message || 'Retry attempt failed',
        originalError: error
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleReset = () => {
    setNetworkError(null);
    setRetryCount(0);
    setIsRetrying(false);
    setLastRetryTime(null);
  };

  // Auto-retry logic
  useEffect(() => {
    if (networkError && !isRetrying && retryCount < maxRetries && isOnline) {
      const autoRetryTimer = setTimeout(() => {
        handleRetry();
      }, getRetryDelay(retryCount));

      return () => clearTimeout(autoRetryTimer);
    }
  }, [networkError, isRetrying, retryCount, maxRetries, isOnline]);

  const renderNetworkStatus = () => {
    if (!showNetworkStatus) return null;

    return (
      <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${
        isOnline 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {isOnline ? (
          <>
            <Wifi size={12} />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff size={12} />
            <span>Offline</span>
          </>
        )}
      </div>
    );
  };

  const renderRetryInfo = () => {
    if (retryCount === 0) return null;

    const nextRetryDelay = getRetryDelay(retryCount);
    const remainingRetries = maxRetries - retryCount;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Retry {retryCount} of {maxRetries}
          </span>
          <span className="text-gray-500">
            {remainingRetries} attempts remaining
          </span>
        </div>
        
        {lastRetryTime && (
          <div className="mt-1 text-xs text-gray-500">
            Last attempt: {lastRetryTime.toLocaleTimeString()}
          </div>
        )}
        
        {!isRetrying && remainingRetries > 0 && (
          <div className="mt-1 text-xs text-blue-600">
            Next retry in {Math.ceil(nextRetryDelay / 1000)} seconds
          </div>
        )}
      </div>
    );
  };

  // Error boundary for network-related errors
  const NetworkErrorDisplay = ({ error }) => {
    const getErrorIcon = () => {
      switch (error.type) {
        case 'offline':
          return <WifiOff size={48} className="text-red-500" />;
        case 'timeout':
          return <Clock size={48} className="text-yellow-500" />;
        case 'retry_failed':
          return <AlertTriangle size={48} className="text-orange-500" />;
        default:
          return <WifiOff size={48} className="text-red-500" />;
      }
    };

    const getErrorTitle = () => {
      switch (error.type) {
        case 'offline':
          return 'No Internet Connection';
        case 'timeout':
          return 'Request Timeout';
        case 'retry_failed':
          return 'Connection Failed';
        default:
          return 'Network Error';
      }
    };

    const getErrorMessage = () => {
      switch (error.type) {
        case 'offline':
          return 'Please check your internet connection and try again.';
        case 'timeout':
          return 'The request took too long to complete. The server may be busy.';
        case 'retry_failed':
          return error.message || 'Unable to establish connection after multiple attempts.';
        default:
          return 'A network error occurred while loading data.';
      }
    };

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getErrorIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-red-800">
                {getErrorTitle()}
              </h3>
              {renderNetworkStatus()}
            </div>
            
            <p className="text-red-700 mb-4">
              {getErrorMessage()}
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={handleRetry}
                disabled={isRetrying || retryCount >= maxRetries || !isOnline}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw 
                  size={16} 
                  className={isRetrying ? 'animate-spin' : ''} 
                />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                <CheckCircle size={16} />
                Reset
              </button>
            </div>

            {renderRetryInfo()}

            {retryCount >= maxRetries && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Maximum retry attempts reached
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Please check your connection and refresh the page manually.
                </p>
              </div>
            )}

            {/* Troubleshooting tips */}
            <div className="mt-4">
              <details className="text-sm">
                <summary className="cursor-pointer text-red-700 font-medium">
                  Troubleshooting Tips
                </summary>
                <ul className="mt-2 space-y-1 text-red-600">
                  <li>• Check your internet connection</li>
                  <li>• Verify the server is accessible</li>
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Provide context for child components to report network errors
  const networkErrorContext = {
    reportNetworkError: (error) => {
      setNetworkError({
        type: 'api_error',
        message: error.message || 'Network request failed',
        originalError: error
      });
    },
    isOnline,
    retryCount,
    maxRetries
  };

  if (networkError) {
    return <NetworkErrorDisplay error={networkError} />;
  }

  // Clone children with network error context
  return React.cloneElement(children, { networkErrorContext });
};

export default NetworkErrorBoundary; 