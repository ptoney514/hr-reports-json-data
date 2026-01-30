import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, AlertTriangle, TrendingDown, Users, Calendar } from 'lucide-react';
import { getExitSurveyData, AVAILABLE_DATES } from '../../services/dataService';
import { getHistoricalComparison, getExitReasonAnalysis, getSurveyQualityMetrics } from '../../utils/exitSurveyAnalytics';
import ExitVolumeAlert from '../alerts/ExitVolumeAlert';
import ExitVolumeHistoryChart from '../charts/ExitVolumeHistoryChart';
import DepartmentExitAnalysis from '../charts/DepartmentExitAnalysis';

const ExitSurveyDashboard = () => {
  // Period selection state - default to Q4 FY25 (most recent complete quarter)
  const [selectedPeriod, setSelectedPeriod] = useState("2025-06-30");
  
  // Get current period data
  const currentData = getExitSurveyData(selectedPeriod);
  const historicalComparison = getHistoricalComparison();
  
  const exitReasons = currentData?.departureReasons ? currentData.departureReasons.map(reason => ({
    name: reason.reason,
    value: reason.percentage
  })) : [];
  
  const keyInsights = currentData?.keyInsights || null;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div id="exit-survey-dashboard" data-dashboard-content className="min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-6 print:max-w-none print:px-0 print:mx-0">
        
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="text-blue-600" size={24} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Exit Survey Insights Report</h1>
                  <p className="text-gray-700 text-base mt-1">
                    {currentData?.quarter ? `${currentData.quarter} Analysis` : 'Historical Analysis'} - {currentData?.reportingDate || 'Selected Period'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Analysis Period:</span>
              </div>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {AVAILABLE_DATES.filter(date => date.status === 'complete').map(date => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exit Volume Alert */}
        <div className="mb-6">
          <ExitVolumeAlert />
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:gap-2 mb-8 print:mb-4">
          {/* Total Exits Card */}
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <Users size={16} />
              Total Exits
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{currentData?.totalExits || 0}</span>
              {historicalComparison && (
                <div className={`flex items-center text-sm ${
                  historicalComparison.changes.direction === 'improving' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <TrendingDown 
                    size={14} 
                    className={historicalComparison.changes.direction === 'improving' ? 'rotate-180' : ''} 
                  />
                  <span>{Math.abs(historicalComparison.changes.exitVolumeChange)}%</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {currentData?.quarter || selectedPeriod}
            </p>
          </div>

          {/* Would Recommend Card */}
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3">Would Recommend</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">
                {currentData?.wouldRecommend ? `${currentData.wouldRecommend}%` : 'N/A'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {currentData?.wouldRecommendCount?.positive || 0} of {currentData?.wouldRecommendCount?.total || 0} respondents
            </p>
          </div>

          {/* Response Rate Card */}
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-blue-700 mb-3">Response Rate</h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">
                {currentData?.responseRate ? `${currentData.responseRate}%` : 'N/A'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                (currentData?.responseRate || 0) >= 50 ? 'bg-green-100 text-green-800' :
                (currentData?.responseRate || 0) >= 30 ? 'bg-yellow-100 text-yellow-800' :
                (currentData?.responseRate || 0) > 0 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {(currentData?.responseRate || 0) >= 50 ? 'GOOD' :
                 (currentData?.responseRate || 0) >= 30 ? 'FAIR' :
                 (currentData?.responseRate || 0) > 0 ? 'LOW' : 'NONE'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {currentData?.totalResponses || 0} of {currentData?.totalExits || 0} exits
            </p>
          </div>

          {/* Concerns Reported Card */}
          <div className="bg-white print:bg-white p-6 print:p-2 rounded-lg shadow-sm border print:border-gray">
            <h2 className="text-base font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              Concerns Reported
            </h2>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-amber-600">
                {currentData?.concernsReported?.percentage ? `${currentData.concernsReported.percentage}%` : 'N/A'}
              </span>
              {currentData?.concernsReported?.percentage && (
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                  currentData.concernsReported.percentage >= 40 ? 'bg-red-100 text-red-800' :
                  currentData.concernsReported.percentage >= 25 ? 'bg-orange-100 text-orange-800' :
                  currentData.concernsReported.percentage >= 10 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {currentData.concernsReported.percentage >= 40 ? 'CRITICAL' :
                   currentData.concernsReported.percentage >= 25 ? 'HIGH' :
                   currentData.concernsReported.percentage >= 10 ? 'MODERATE' : 'LOW'}
                </span>
              )}
            </div>
            <p className="text-sm text-amber-600 mt-2">
              {currentData?.concernsReported?.count || 0} of {currentData?.concernsReported?.total || 0} respondents
            </p>
          </div>
        </div>

        {/* Historical Trend Analysis */}
        <div className="mb-8 print:mb-4">
          <ExitVolumeHistoryChart />
        </div>

        {/* Exit Reasons Analysis */}
        {exitReasons.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:mb-4">
            {/* Left Column: Primary Reasons for Leaving */}
            <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Primary Reasons for Leaving</h2>
              <div className="space-y-4">
                {exitReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-sm font-medium text-gray-800 min-w-0 flex-1">{reason.name}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="w-24 bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${reason.value}%`, 
                            backgroundColor: COLORS[index % COLORS.length] 
                          }}
                        ></div>
                      </div>
                      <span className="font-bold text-sm text-gray-900 w-8 text-right">{reason.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-600 print:text-black">
                Based on {currentData?.totalResponses || 0} survey responses from {currentData?.totalExits || 0} employee exits{currentData?.quarter ? ` in ${currentData.quarter}` : ''}
              </div>
            </div>
            
            {/* Right Column: Current Quarter Insights */}
            <div className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Quarter Insights</h2>
              <div className="space-y-4">
                {currentData?.totalResponses > 0 ? (
                  <>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="text-lg font-bold text-blue-600">
                        {currentData.wouldRecommend}%
                      </div>
                      <div className="text-sm text-gray-600">Would recommend organization</div>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="text-lg font-bold text-green-600">
                        {currentData.responseRate}%
                      </div>
                      <div className="text-sm text-gray-600">Exit interview participation</div>
                    </div>
                    
                    {currentData.concernsReported?.percentage && (
                      <div className="border-l-4 border-amber-500 pl-4">
                        <div className="text-lg font-bold text-amber-600">
                          {currentData.concernsReported.percentage}%
                        </div>
                        <div className="text-sm text-gray-600">Reported workplace concerns</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-600">No survey data available for selected period</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentData?.totalExits || 0} exits recorded
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Exit Survey Key Insights */}
        {keyInsights && (
          <div className="bg-white print:bg-white p-8 print:p-4 rounded-lg shadow-sm border print:border-gray mb-8 print:mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Exit Survey Key Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-base">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Areas of Concern</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  {keyInsights.areasOfConcern?.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Positive Feedback</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  {keyInsights.positiveFeedback?.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Department Analysis */}
        <div className="mb-8 print:mb-4">
          <DepartmentExitAnalysis layout="both" />
        </div>
      </div>
    </div>
  );
};

export default ExitSurveyDashboard;