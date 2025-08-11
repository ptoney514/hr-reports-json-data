import { useState, useMemo } from 'react';
import { X, Database, Eye, EyeOff, ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Debug overlay component to visualize data mappings between PocketBase and UI
 * Shows field names, values, and mappings to help debug data issues
 * Enhanced with dashboard-specific field mappings
 */
export function DataDebugOverlay({ 
  data, 
  source = 'unknown', 
  rawData = null,
  dashboardType = 'generic',
  elementMappings = null // Optional custom mappings from parent
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    mappings: true,
    raw: false,
    transformed: false,
    charts: false,
    calculations: false
  });

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dashboard-specific field mappings
  const dashboardMappings = useMemo(() => {
    const mappings = {
      workforce: {
        summaryCards: [
          { 
            element: "Total Headcount Card",
            label: "Total Headcount (BE)",
            jsonPath: "metrics.totalEmployees",
            pbField: "total_employees",
            uiField: "totalBE",
            calculation: "beFaculty + beStaff",
            value: data?.current?.totalBE || data?.metrics?.totalEmployees
          },
          {
            element: "Faculty Card",
            label: "Faculty (BE)",
            jsonPath: "metrics.beFaculty",
            pbField: "benefit_eligible_faculty",
            uiField: "beFaculty",
            value: data?.current?.beFaculty || data?.metrics?.beFaculty
          },
          {
            element: "Staff Card",
            label: "Staff (BE)",
            jsonPath: "metrics.beStaff",
            pbField: "benefit_eligible_staff",
            uiField: "beStaff",
            value: data?.current?.beStaff || data?.metrics?.beStaff
          },
          {
            element: "HSR Card",
            label: "House Staff Residents",
            jsonPath: "metrics.hsr",
            pbField: "hsr_total",
            uiField: "hsr",
            value: data?.current?.hsr || data?.metrics?.hsr
          },
          {
            element: "New Hires Card",
            label: "New Hires",
            jsonPath: "metrics.newHires",
            pbField: "new_hires",
            uiField: "newHires",
            value: data?.current?.newHires || data?.metrics?.newHires
          },
          {
            element: "Departures Card",
            label: "Departures",
            jsonPath: "metrics.departures",
            pbField: "terminations",
            uiField: "departures",
            value: data?.current?.departures || data?.metrics?.departures
          }
        ],
        charts: [
          {
            element: "Headcount Trend Chart",
            jsonPath: "monthlyTrends",
            pbField: "historical_trends",
            dataType: "array",
            value: data?.charts?.historicalTrends || data?.monthlyTrends
          },
          {
            element: "Division Chart",
            jsonPath: "byDivision",
            pbField: "division_breakdown",
            dataType: "array",
            value: data?.charts?.divisionBreakdown || data?.byDivision
          },
          {
            element: "Location Chart",
            jsonPath: "byLocation",
            pbField: "location_breakdown",
            dataType: "object",
            value: data?.charts?.locationBreakdown || data?.byLocation
          }
        ],
        calculations: [
          {
            label: "Total BE Calculation",
            formula: "beFaculty + beStaff",
            inputs: {
              beFaculty: data?.current?.beFaculty || 0,
              beStaff: data?.current?.beStaff || 0
            },
            result: (data?.current?.beFaculty || 0) + (data?.current?.beStaff || 0)
          },
          {
            label: "Turnover Rate",
            formula: "(departures / avgHeadcount) * 100",
            inputs: {
              departures: data?.current?.departures || 0,
              avgHeadcount: data?.current?.totalEmployees || 1
            },
            result: ((data?.current?.departures || 0) / (data?.current?.totalEmployees || 1) * 100).toFixed(2) + '%'
          }
        ]
      },
      turnover: {
        summaryCards: [
          {
            element: "Turnover Rate Card",
            label: "Overall Turnover Rate",
            jsonPath: "metrics.overallRate",
            pbField: "turnover_rate",
            uiField: "turnoverRate",
            value: data?.summary?.turnoverRate || data?.metrics?.turnoverRate
          },
          {
            element: "Total Exits Card",
            label: "Total Exits",
            jsonPath: "metrics.totalExits",
            pbField: "total_exits",
            uiField: "totalExits",
            value: data?.summary?.totalExits || data?.metrics?.totalExits
          },
          {
            element: "Voluntary Turnover Card",
            label: "Voluntary Turnover",
            jsonPath: "metrics.voluntaryRate",
            pbField: "voluntary_rate",
            uiField: "voluntaryRate",
            value: data?.summary?.voluntaryRate || data?.metrics?.voluntaryRate
          },
          {
            element: "Average Tenure Card",
            label: "Average Tenure",
            jsonPath: "metrics.avgTenure",
            pbField: "avg_tenure",
            uiField: "avgTenure",
            value: data?.summary?.avgTenure || data?.metrics?.avgTenure
          }
        ],
        charts: [
          {
            element: "Turnover by Grade Chart",
            jsonPath: "byGrade",
            pbField: "grade_breakdown",
            dataType: "array",
            value: data?.charts?.gradeBreakdown || data?.byGrade
          },
          {
            element: "Exit Reasons Chart",
            jsonPath: "exitReasons",
            pbField: "exit_reasons",
            dataType: "array",
            value: data?.charts?.exitReasons || data?.exitReasons
          }
        ]
      },
      recruiting: {
        summaryCards: [
          {
            element: "Open Positions Card",
            label: "Open Positions",
            jsonPath: "metrics.openPositions",
            pbField: "open_positions",
            uiField: "openPositions",
            value: data?.summary?.openPositions || data?.metrics?.openPositions
          },
          {
            element: "Time to Fill Card",
            label: "Avg Time to Fill",
            jsonPath: "metrics.avgTimeToFill",
            pbField: "avg_time_to_fill",
            uiField: "avgTimeToFill",
            value: data?.summary?.avgTimeToFill || data?.metrics?.avgTimeToFill
          },
          {
            element: "Applications Card",
            label: "Total Applications",
            jsonPath: "metrics.totalApplications",
            pbField: "total_applications",
            uiField: "totalApplications",
            value: data?.summary?.totalApplications || data?.metrics?.totalApplications
          },
          {
            element: "Offer Accept Rate Card",
            label: "Offer Accept Rate",
            jsonPath: "metrics.offerAcceptRate",
            pbField: "offer_accept_rate",
            uiField: "offerAcceptRate",
            value: data?.summary?.offerAcceptRate || data?.metrics?.offerAcceptRate
          }
        ],
        charts: [
          {
            element: "Pipeline Chart",
            jsonPath: "pipeline",
            pbField: "recruitment_pipeline",
            dataType: "array",
            value: data?.charts?.pipeline || data?.pipeline
          }
        ]
      },
      exitSurvey: {
        summaryCards: [
          {
            element: "Response Rate Card",
            label: "Survey Response Rate",
            jsonPath: "metrics.responseRate",
            pbField: "response_rate",
            uiField: "responseRate",
            value: data?.summary?.responseRate || data?.metrics?.responseRate
          },
          {
            element: "Recommendation Rate Card",
            label: "Would Recommend",
            jsonPath: "metrics.recommendationRate",
            pbField: "recommendation_rate",
            uiField: "recommendationRate",
            value: data?.summary?.recommendationRate || data?.metrics?.recommendationRate
          },
          {
            element: "Satisfaction Score Card",
            label: "Overall Satisfaction",
            jsonPath: "metrics.satisfactionScore",
            pbField: "satisfaction_score",
            uiField: "satisfactionScore",
            value: data?.summary?.satisfactionScore || data?.metrics?.satisfactionScore
          }
        ],
        charts: [
          {
            element: "Exit Reasons Chart",
            jsonPath: "primaryReasons",
            pbField: "primary_reasons",
            dataType: "array",
            value: data?.charts?.primaryReasons || data?.primaryReasons
          }
        ]
      }
    };

    // Return custom mappings if provided, otherwise use dashboard-specific
    return elementMappings || mappings[dashboardType] || mappings.workforce;
  }, [dashboardType, elementMappings, data]);

  // Get field status (present, missing, error)
  const getFieldStatus = (value) => {
    if (value === undefined || value === null) return 'missing';
    if (value === 'error' || value === 'NaN') return 'error';
    return 'present';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'text-green-600';
      case 'missing': return 'text-red-600';
      case 'error': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'missing': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return null;
    }
  };

  // Count issues
  const issueCount = useMemo(() => {
    let missing = 0;
    let errors = 0;
    
    // Check summary cards
    dashboardMappings.summaryCards?.forEach(field => {
      const status = getFieldStatus(field.value);
      if (status === 'missing') missing++;
      if (status === 'error') errors++;
    });
    
    // Check charts
    dashboardMappings.charts?.forEach(field => {
      const status = getFieldStatus(field.value);
      if (status === 'missing') missing++;
      if (status === 'error') errors++;
    });
    
    return { missing, errors, total: missing + errors };
  }, [dashboardMappings]);

  return (
    <>
      {/* Floating Debug Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        title="Toggle Data Debug Overlay"
      >
        <Database className="w-5 h-5" />
        {isOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        {issueCount.total > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {issueCount.total}
          </span>
        )}
      </button>

      {/* Debug Overlay Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-40 overflow-hidden flex flex-col border-l-4 border-purple-600">
          {/* Header */}
          <div className="bg-purple-600 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold">Data Debug Overlay</h2>
                <p className="text-sm opacity-90">Dashboard: {dashboardType} | Source: {source}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-purple-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Issue Summary */}
            <div className="flex gap-4 text-sm">
              {issueCount.missing > 0 && (
                <span className="bg-red-500 px-2 py-1 rounded">
                  {issueCount.missing} Missing
                </span>
              )}
              {issueCount.errors > 0 && (
                <span className="bg-orange-500 px-2 py-1 rounded">
                  {issueCount.errors} Errors
                </span>
              )}
              {issueCount.total === 0 && (
                <span className="bg-green-500 px-2 py-1 rounded">
                  All Fields OK
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Summary Cards Field Mappings */}
            {dashboardMappings.summaryCards && (
              <div className="border rounded-lg">
                <button
                  onClick={() => toggleSection('mappings')}
                  className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                >
                  <span className="font-semibold">Summary Cards</span>
                  {expandedSections.mappings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.mappings && (
                  <div className="p-3 space-y-2">
                    {dashboardMappings.summaryCards.map((field, idx) => {
                      const status = getFieldStatus(field.value);
                      return (
                        <div key={idx} className="border rounded p-2 bg-gray-50">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-sm">{field.element}</span>
                            {getStatusIcon(status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">JSON Path:</span>
                              <code className="block font-mono bg-white px-1 rounded">{field.jsonPath}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">PB Field:</span>
                              <code className="block font-mono bg-white px-1 rounded">{field.pbField}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">UI Field:</span>
                              <code className="block font-mono bg-white px-1 rounded">{field.uiField}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">Value:</span>
                              <span className={`block font-bold ${getStatusColor(status)}`}>
                                {field.value ?? 'null'}
                              </span>
                            </div>
                          </div>
                          {field.calculation && (
                            <div className="mt-1 text-xs text-gray-500">
                              Formula: <code className="font-mono">{field.calculation}</code>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Charts Field Mappings */}
            {dashboardMappings.charts && dashboardMappings.charts.length > 0 && (
              <div className="border rounded-lg">
                <button
                  onClick={() => toggleSection('charts')}
                  className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                >
                  <span className="font-semibold">Charts & Visualizations</span>
                  {expandedSections.charts ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.charts && (
                  <div className="p-3 space-y-2">
                    {dashboardMappings.charts.map((chart, idx) => {
                      const status = getFieldStatus(chart.value);
                      return (
                        <div key={idx} className="border rounded p-2 bg-gray-50">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-sm">{chart.element}</span>
                            {getStatusIcon(status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">JSON Path:</span>
                              <code className="block font-mono bg-white px-1 rounded">{chart.jsonPath}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">PB Field:</span>
                              <code className="block font-mono bg-white px-1 rounded">{chart.pbField}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">Data Type:</span>
                              <span className="block">{chart.dataType}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Has Data:</span>
                              <span className={`block font-bold ${getStatusColor(status)}`}>
                                {Array.isArray(chart.value) ? `Array[${chart.value.length}]` : 
                                 chart.value ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Calculations */}
            {dashboardMappings.calculations && dashboardMappings.calculations.length > 0 && (
              <div className="border rounded-lg">
                <button
                  onClick={() => toggleSection('calculations')}
                  className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                >
                  <span className="font-semibold">Calculations</span>
                  {expandedSections.calculations ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.calculations && (
                  <div className="p-3 space-y-2">
                    {dashboardMappings.calculations.map((calc, idx) => (
                      <div key={idx} className="border rounded p-2 bg-gray-50">
                        <div className="font-medium text-sm mb-1">{calc.label}</div>
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="text-gray-500">Formula:</span>
                            <code className="ml-2 font-mono">{calc.formula}</code>
                          </div>
                          <div>
                            <span className="text-gray-500">Inputs:</span>
                            <div className="ml-2 font-mono">
                              {Object.entries(calc.inputs).map(([key, value]) => (
                                <div key={key}>{key}: {value}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Result:</span>
                            <span className="ml-2 font-bold text-green-600">{calc.result}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Raw PocketBase Data Section */}
            {rawData && (
              <div className="border rounded-lg">
                <button
                  onClick={() => toggleSection('raw')}
                  className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                >
                  <span className="font-semibold">Raw {source} Data</span>
                  {expandedSections.raw ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.raw && (
                  <div className="p-3">
                    <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto max-h-96">
                      {JSON.stringify(rawData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Transformed Data Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('transformed')}
                className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
              >
                <span className="font-semibold">Transformed UI Data</span>
                {expandedSections.transformed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {expandedSections.transformed && (
                <div className="p-3">
                  <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto max-h-96">
                    {JSON.stringify(data || {}, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Data Issues Summary */}
            {issueCount.total > 0 && (
              <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-3">
                <h4 className="font-semibold text-sm text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Potential Issues ({issueCount.total})
                </h4>
                <ul className="text-xs space-y-1 text-yellow-700">
                  {dashboardMappings.summaryCards?.map((field, idx) => {
                    const status = getFieldStatus(field.value);
                    if (status === 'missing') {
                      return <li key={`card-${idx}`}>• {field.label} is missing (expected: {field.pbField})</li>;
                    }
                    if (status === 'error') {
                      return <li key={`card-${idx}`}>• {field.label} has an error</li>;
                    }
                    return null;
                  }).filter(Boolean)}
                  {dashboardMappings.charts?.map((chart, idx) => {
                    const status = getFieldStatus(chart.value);
                    if (status === 'missing') {
                      return <li key={`chart-${idx}`}>• {chart.element} data is missing</li>;
                    }
                    if (status === 'error') {
                      return <li key={`chart-${idx}`}>• {chart.element} has an error</li>;
                    }
                    return null;
                  }).filter(Boolean)}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3 bg-gray-50">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Development mode only</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="mt-1 text-xs">
              <span className="text-gray-500">Dashboard:</span> 
              <span className="ml-1 font-mono bg-white px-1 rounded">{dashboardType}</span>
              <span className="ml-2 text-gray-500">Source:</span> 
              <span className="ml-1 font-mono bg-white px-1 rounded">{source}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}