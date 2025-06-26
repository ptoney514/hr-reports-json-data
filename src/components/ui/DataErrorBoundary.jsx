import React from 'react';
import { 
  Database, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

class DataErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      validationErrors: [],
      dataIssues: [],
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      validationErrors: DataErrorBoundary.extractValidationErrors(error),
      dataIssues: DataErrorBoundary.analyzeDataIssues(error)
    };
  }

  static extractValidationErrors(error) {
    const validationErrors = [];
    const errorMessage = error?.message?.toLowerCase() || '';

    // Common data validation patterns
    if (errorMessage.includes('cannot read property')) {
      const match = errorMessage.match(/cannot read property '([^']+)'/);
      if (match) {
        validationErrors.push({
          type: 'missing_property',
          field: match[1],
          message: `Required property '${match[1]}' is missing or undefined`
        });
      }
    }

    if (errorMessage.includes('undefined') || errorMessage.includes('null')) {
      validationErrors.push({
        type: 'null_data',
        message: 'Data contains null or undefined values'
      });
    }

    if (errorMessage.includes('json') || errorMessage.includes('parse')) {
      validationErrors.push({
        type: 'invalid_format',
        message: 'Data is not in valid JSON format'
      });
    }

    if (errorMessage.includes('array') || errorMessage.includes('map')) {
      validationErrors.push({
        type: 'invalid_array',
        message: 'Expected array data but received different type'
      });
    }

    return validationErrors;
  }

  static analyzeDataIssues(error) {
    const issues = [];
    const errorMessage = error?.message || '';

    // Analyze common data structure issues
    if (errorMessage.includes('TypeError')) {
      issues.push({
        severity: 'high',
        category: 'Type Mismatch',
        description: 'Data type does not match expected format'
      });
    }

    if (errorMessage.includes('ReferenceError')) {
      issues.push({
        severity: 'high',
        category: 'Missing Reference',
        description: 'Required data reference is not available'
      });
    }

    if (errorMessage.includes('length')) {
      issues.push({
        severity: 'medium',
        category: 'Data Length',
        description: 'Data array or string length issue'
      });
    }

    return issues;
  }

  componentDidCatch(error, errorInfo) {
    console.error('Data Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Perform additional data validation
    this.validateDataStructure();

    if (this.props.onDataError) {
      this.props.onDataError(error, errorInfo, this.state.validationErrors);
    }
  }

  validateDataStructure = () => {
    const { expectedSchema, data } = this.props;
    
    // Skip validation if no schema is provided or schema is empty
    if (!expectedSchema || !data || 
        ((!expectedSchema.required || expectedSchema.required.length === 0) &&
        (!expectedSchema.properties || Object.keys(expectedSchema.properties).length === 0))) {
      return;
    }

    const schemaValidation = this.performSchemaValidation(data, expectedSchema);
    
    this.setState(prevState => ({
      validationErrors: [...prevState.validationErrors, ...schemaValidation.errors],
      dataIssues: [...prevState.dataIssues, ...schemaValidation.issues]
    }));
  };

  performSchemaValidation = (data, schema) => {
    const errors = [];
    const issues = [];

    try {
      // Validate required fields
      if (schema.required) {
        schema.required.forEach(field => {
          if (!data || data[field] === undefined || data[field] === null) {
            errors.push({
              type: 'required_field',
              field,
              message: `Required field '${field}' is missing`
            });
          }
        });
      }

      // Validate data types
      if (schema.properties && data) {
        Object.keys(schema.properties).forEach(field => {
          const expectedType = schema.properties[field].type;
          const actualValue = data[field];
          
          if (actualValue !== undefined && actualValue !== null) {
            const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;
            
            if (expectedType !== actualType) {
              issues.push({
                severity: 'medium',
                category: 'Type Validation',
                description: `Field '${field}' expected ${expectedType} but got ${actualType}`
              });
            }
          }
        });
      }

      // Validate array structures
      if (schema.arrayFields && data) {
        schema.arrayFields.forEach(field => {
          if (data[field] && !Array.isArray(data[field])) {
            errors.push({
              type: 'invalid_array',
              field,
              message: `Field '${field}' should be an array`
            });
          }
        });
      }

    } catch (validationError) {
      errors.push({
        type: 'validation_error',
        message: `Schema validation failed: ${validationError.message}`
      });
    }

    return { errors, issues };
  };

  handleRetry = async () => {
    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.props.onRetry) {
      try {
        await this.props.onRetry();
        // If retry succeeds, reset error state
        this.setState({
          hasError: false,
          error: null,
          validationErrors: [],
          dataIssues: [],
          isRetrying: false
        });
      } catch (error) {
        console.error('Data retry failed:', error);
        this.setState({ isRetrying: false });
      }
    } else {
      this.setState({ isRetrying: false });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      validationErrors: [],
      dataIssues: [],
      retryCount: 0,
      isRetrying: false
    });
  };

  getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <XCircle size={16} className="text-red-500" />;
      case 'medium':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'low':
        return <Info size={16} className="text-yellow-500" />;
      default:
        return <Info size={16} className="text-gray-500" />;
    }
  };

  renderValidationErrors = () => {
    const { validationErrors } = this.state;
    
    if (validationErrors.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
          <XCircle size={16} />
          Validation Errors ({validationErrors.length})
        </h4>
        <div className="space-y-2">
          {validationErrors.map((error, index) => (
            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
              <div className="font-medium text-red-800">
                {error.type.replace('_', ' ').toUpperCase()}
                {error.field && ` - ${error.field}`}
              </div>
              <div className="text-red-700 mt-1">{error.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  renderDataIssues = () => {
    const { dataIssues } = this.state;
    
    if (dataIssues.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} />
          Data Issues ({dataIssues.length})
        </h4>
        <div className="space-y-2">
          {dataIssues.map((issue, index) => (
            <div 
              key={index} 
              className={`p-3 border rounded text-sm ${this.getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-center gap-2 font-medium">
                {this.getSeverityIcon(issue.severity)}
                {issue.category}
                <span className="text-xs px-2 py-1 rounded-full bg-white">
                  {issue.severity}
                </span>
              </div>
              <div className="mt-1">{issue.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      const { retryCount, isRetrying, validationErrors, dataIssues } = this.state;
      const { title = 'Data Error', showTechnicalDetails = false } = this.props;

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Database size={48} className="text-red-500" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {title}
              </h3>
              
              <p className="text-red-700 mb-4">
                The data could not be processed due to format or validation issues. 
                Please check the data structure and try again.
              </p>

              {this.renderValidationErrors()}
              {this.renderDataIssues()}

              {/* Technical Details */}
              {showTechnicalDetails && this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-red-700 font-medium">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Recommendations */}
              <div className="mb-4">
                <h4 className="font-medium text-red-800 mb-2">
                  Recommended Actions:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Verify the data source is providing valid JSON</li>
                  <li>• Check that all required fields are present</li>
                  <li>• Ensure data types match expected formats</li>
                  <li>• Validate array structures and object properties</li>
                  {validationErrors.length > 0 && (
                    <li>• Address the validation errors listed above</li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw 
                    size={16} 
                    className={isRetrying ? 'animate-spin' : ''} 
                  />
                  {isRetrying ? 'Retrying...' : 'Retry with Current Data'}
                </button>

                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  <CheckCircle size={16} />
                  Reset Component
                </button>

                {this.props.onReloadData && (
                  <button
                    onClick={this.props.onReloadData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Database size={16} />
                    Reload Data
                  </button>
                )}
              </div>

              {/* Retry Count */}
              {retryCount > 0 && (
                <div className="mt-3 text-xs text-gray-600">
                  Retry attempts: {retryCount}
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

export default DataErrorBoundary; 