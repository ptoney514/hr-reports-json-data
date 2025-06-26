# Error Handling System Guide

## Overview

The TrioReports dashboard system includes a comprehensive error handling framework designed to gracefully handle various types of errors that can occur in a React application. The system provides user-friendly error messages, automatic retry functionality, and detailed error reporting.

## Error Boundary Components

### 1. ErrorBoundary (Main Error Boundary)

The main error boundary component that catches all JavaScript errors in the component tree.

**Features:**
- Automatic error classification (network, chart, data, timeout, validation, render, general)
- User-friendly error messages with actionable suggestions
- Retry functionality with exponential backoff
- Development vs. production error display
- Error reporting to external services
- Reset functionality

**Usage:**
```jsx
import ErrorBoundary from './components/ui/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => console.error('Error:', error)}
  onRetry={() => window.location.reload()}
  showHomeButton={true}
>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `onError`: Function called when an error occurs
- `onRetry`: Function called when retry button is clicked
- `showHomeButton`: Whether to show "Go to Dashboard Home" button
- `fallback`: Custom fallback UI function

### 2. ChartErrorBoundary (Chart-Specific Error Boundary)

Specialized error boundary for chart components with compact error display.

**Features:**
- Chart-specific error messages
- Compact error display that fits within chart containers
- Chart type identification
- Data format error detection
- Recharts library error handling

**Usage:**
```jsx
import ChartErrorBoundary from './components/ui/ChartErrorBoundary';

<ChartErrorBoundary
  chartType="Bar Chart"
  title="Headcount Chart"
  height={300}
  onRetry={() => refetchData()}
  onReset={() => resetChartData()}
>
  <BarChart data={data} />
</ChartErrorBoundary>
```

**Props:**
- `chartType`: Type of chart (e.g., "Bar Chart", "Line Chart")
- `title`: Chart title for error display
- `height`: Chart height for error container sizing
- `showFullError`: Whether to show full error details in development
- `onChartError`: Callback for chart-specific error handling
- `onRetry`: Retry function
- `onReset`: Reset function

### 3. NetworkErrorBoundary (Network Error Handler)

Handles network-related errors with automatic retry and exponential backoff.

**Features:**
- Online/offline detection
- Automatic retry with exponential backoff
- Network status indicators
- Retry attempt tracking
- Maximum retry limits
- Auto-retry when coming back online

**Usage:**
```jsx
import NetworkErrorBoundary from './components/ui/NetworkErrorBoundary';

<NetworkErrorBoundary
  onRetry={refetchData}
  maxRetries={3}
  retryDelay={1000}
  showNetworkStatus={true}
>
  <DataComponent />
</NetworkErrorBoundary>
```

**Props:**
- `onRetry`: Function to retry the failed operation
- `maxRetries`: Maximum number of retry attempts (default: 3)
- `retryDelay`: Base delay between retries in ms (default: 1000)
- `showNetworkStatus`: Whether to show online/offline indicator

### 4. DataErrorBoundary (Data Validation Error Handler)

Handles data validation and format errors with detailed validation feedback.

**Features:**
- Schema validation
- Detailed validation error reporting
- Data structure analysis
- Field-level error identification
- Data format recommendations
- Severity-based error classification

**Usage:**
```jsx
import DataErrorBoundary from './components/ui/DataErrorBoundary';

<DataErrorBoundary
  title="Dashboard Data Error"
  expectedSchema={{
    required: ['data', 'metadata'],
    properties: {
      data: { type: 'array' },
      metadata: { type: 'object' }
    }
  }}
  data={responseData}
  onRetry={refetchData}
  onReloadData={reloadAllData}
  showTechnicalDetails={true}
>
  <DataVisualization />
</DataErrorBoundary>
```

**Props:**
- `title`: Error display title
- `expectedSchema`: Data validation schema
- `data`: Data to validate
- `showTechnicalDetails`: Whether to show technical error details
- `onDataError`: Callback for data-specific errors
- `onRetry`: Retry function
- `onReloadData`: Data reload function

## Error Handler Utility

### Core Functions

#### `classifyError(error)`
Automatically classifies errors based on their message and properties.

```javascript
import { classifyError, ERROR_TYPES } from './utils/errorHandler';

const errorType = classifyError(new Error('Network request failed'));
// Returns: ERROR_TYPES.NETWORK
```

#### `logError(error, context)`
Enhanced error logging with context and metadata.

```javascript
import { logError } from './utils/errorHandler';

logError(error, {
  component: 'WorkforceDashboard',
  userId: 'user123',
  operation: 'fetchData'
});
```

#### `getRecoveryStrategy(error, context)`
Provides recovery strategies based on error type and context.

```javascript
import { getRecoveryStrategy } from './utils/errorHandler';

const strategy = getRecoveryStrategy(error, { retryCount: 1 });
// Returns: { canRetry: true, retryDelay: 2000, autoRetry: false, ... }
```

#### `handleNetworkError(error, retryFn, maxRetries)`
Handles network errors with automatic retry logic.

```javascript
import { handleNetworkError } from './utils/errorHandler';

const data = await handleNetworkError(
  new Error('Network error'),
  () => fetch('/api/data'),
  3
);
```

#### `validateData(data, schema, componentName)`
Validates data against a schema and throws descriptive errors.

```javascript
import { validateData } from './utils/errorHandler';

const schema = {
  required: ['name', 'value'],
  properties: {
    name: { type: 'string' },
    value: { type: 'number' }
  }
};

validateData(responseData, schema, 'DataProcessor');
```

### Error Handler Hook

The `useErrorHandler` hook provides error handling capabilities for functional components.

```javascript
import { useErrorHandler } from './utils/errorHandler';

const MyComponent = () => {
  const { handleError } = useErrorHandler('MyComponent');
  
  const processData = async () => {
    try {
      // Process data
    } catch (error) {
      const { errorLog, strategy, canRetry } = handleError(error, {
        operation: 'processData'
      });
      
      if (canRetry) {
        // Handle retry logic
      }
    }
  };
};
```

## Implementation Examples

### 1. Dashboard with Full Error Handling

```jsx
import React from 'react';
import ErrorBoundary from './components/ui/ErrorBoundary';
import NetworkErrorBoundary from './components/ui/NetworkErrorBoundary';
import DataErrorBoundary from './components/ui/DataErrorBoundary';
import DashboardLayout from './components/dashboards/DashboardLayout';

const MyDashboard = () => {
  const handleRetry = () => window.location.reload();
  
  return (
    <ErrorBoundary onRetry={handleRetry}>
      <NetworkErrorBoundary maxRetries={3}>
        <DataErrorBoundary
          expectedSchema={{
            required: ['summary', 'charts'],
            properties: {
              summary: { type: 'object' },
              charts: { type: 'array' }
            }
          }}
          onRetry={handleRetry}
        >
          <DashboardLayout title="My Dashboard">
            {/* Dashboard content */}
          </DashboardLayout>
        </DataErrorBoundary>
      </NetworkErrorBoundary>
    </ErrorBoundary>
  );
};
```

### 2. Chart Component with Error Handling

```jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import ChartErrorBoundary from './components/ui/ChartErrorBoundary';

const MyChart = ({ data, title }) => {
  return (
    <ChartErrorBoundary
      chartType="Bar Chart"
      title={title}
      height={300}
      onRetry={() => window.location.reload()}
    >
      <div className="chart-container">
        <h3>{title}</h3>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" />
        </BarChart>
      </div>
    </ChartErrorBoundary>
  );
};
```

### 3. Data Hook with Error Handling

```jsx
import { useState, useEffect } from 'react';
import { useErrorHandler, handleNetworkError, validateData } from './utils/errorHandler';

const useApiData = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleError } = useErrorHandler('useApiData');

  const schema = {
    required: ['data'],
    properties: {
      data: { type: 'array' }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await handleNetworkError(
          new Error('API request'),
          () => fetch(url).then(res => res.json()),
          3
        );

        validateData(response, schema, 'useApiData');
        setData(response);
      } catch (err) {
        const { errorLog } = handleError(err, { url });
        setError(errorLog);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

## Global Error Handling Setup

Initialize global error handling in your main App component:

```jsx
import React, { useEffect } from 'react';
import { setupGlobalErrorHandling } from './utils/errorHandler';

function App() {
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
}
```

## Error Types and Classifications

### ERROR_TYPES
- `NETWORK`: Network connectivity issues, fetch failures, CORS errors
- `CHART`: Chart rendering errors, visualization library issues
- `DATA`: Data format issues, JSON parsing errors, validation failures
- `TIMEOUT`: Request timeouts, operation timeouts
- `VALIDATION`: Schema validation errors, missing required fields
- `RENDER`: React rendering errors, component lifecycle errors
- `GENERAL`: Uncategorized errors

### ERROR_SEVERITY
- `CRITICAL`: Errors that break the entire application
- `HIGH`: Errors affecting multiple components or core functionality
- `MEDIUM`: Errors affecting single components or features
- `LOW`: Minor errors or validation issues

## Best Practices

### 1. Error Boundary Placement
- Place error boundaries at strategic points in your component tree
- Use specific error boundaries (Chart, Network, Data) for targeted error handling
- Always have a top-level error boundary in your App component

### 2. Error Context
- Provide meaningful context when logging errors
- Include component names, user IDs, and operation details
- Use consistent error context structure across your application

### 3. User Experience
- Show user-friendly error messages, not technical details
- Provide clear action items for users
- Implement retry functionality where appropriate
- Show loading states during retry attempts

### 4. Error Reporting
- Log errors with sufficient context for debugging
- Send critical errors to error reporting services
- Include user agent, URL, and timestamp in error reports
- Respect user privacy when collecting error data

### 5. Development vs Production
- Show detailed error information in development
- Hide technical details from users in production
- Use different logging levels based on environment
- Test error scenarios in development

## Troubleshooting

### Common Issues

**1. Error boundaries not catching errors**
- Error boundaries only catch errors in child components
- They don't catch errors in event handlers, async code, or the error boundary itself
- Use try-catch blocks for event handlers and async operations

**2. Infinite retry loops**
- Set appropriate maximum retry limits
- Implement exponential backoff for retry delays
- Check retry conditions to avoid unnecessary retries

**3. Memory leaks in error handling**
- Clean up timers and event listeners in error boundary cleanup
- Avoid storing large objects in error state
- Clear error states when components unmount

**4. Error reporting failures**
- Handle errors in error reporting code
- Use fallback error reporting methods
- Don't block the UI while reporting errors

### Debugging Tips

**1. Enable detailed error logging**
```javascript
// In development, enable verbose error logging
if (process.env.NODE_ENV === 'development') {
  window.enableVerboseErrorLogging = true;
}
```

**2. Test error scenarios**
```javascript
// Create test components that throw specific error types
const TestNetworkError = () => {
  throw new Error('Network request failed');
};

const TestDataError = () => {
  throw new Error('Invalid JSON data format');
};
```

**3. Monitor error patterns**
- Track error frequency and types
- Identify common error scenarios
- Monitor retry success rates
- Analyze error context for patterns

## Performance Considerations

### 1. Error Boundary Performance
- Error boundaries have minimal performance impact when no errors occur
- Avoid complex logic in error boundary render methods
- Use memoization for expensive error processing

### 2. Error Logging Performance
- Batch error reports to reduce network requests
- Limit error context size to avoid large payloads
- Use asynchronous error reporting to avoid blocking UI

### 3. Retry Logic Performance
- Implement exponential backoff to avoid overwhelming servers
- Set reasonable maximum retry limits
- Cancel pending retries when components unmount

## Integration with External Services

### Error Reporting Services

**Sentry Integration:**
```javascript
import * as Sentry from '@sentry/react';

// In your error handler utility
export const reportError = (errorLog) => {
  Sentry.captureException(new Error(errorLog.message), {
    tags: {
      errorType: errorLog.type,
      severity: errorLog.severity
    },
    extra: errorLog.context
  });
};
```

**LogRocket Integration:**
```javascript
import LogRocket from 'logrocket';

// In your error handler utility
export const reportError = (errorLog) => {
  LogRocket.captureException(new Error(errorLog.message));
  LogRocket.track('Error Occurred', {
    errorType: errorLog.type,
    component: errorLog.context.component
  });
};
```

### Analytics Integration

Track error patterns and user experience:

```javascript
// Track error recovery success
export const trackErrorRecovery = (errorType, recoveryMethod, success) => {
  analytics.track('Error Recovery', {
    errorType,
    recoveryMethod,
    success,
    timestamp: new Date().toISOString()
  });
};
```

## Conclusion

The error handling system provides comprehensive error management for the TrioReports dashboard application. By implementing proper error boundaries, using the error handler utilities, and following best practices, you can ensure a robust and user-friendly experience even when errors occur.

For questions or improvements to the error handling system, please refer to the development team or create an issue in the project repository. 