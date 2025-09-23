import React from 'react';
import { Target, CheckCircle } from 'lucide-react';

const FY2026Recommendations = ({ className = "" }) => {
  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border p-8 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Target style={{color: '#2E7D32'}} size={24} />
        FY26 Recommendations
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-yellow-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900">Short Term Initiatives</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
              <span>Encourage manager/supervisor upskilling</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
              <span>Create career development pathways</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
              <span>Improve exit survey response to 40%+</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
              <span>Establish retention task force</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900">FY26 Goals</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-green-600 mt-0.5" />
              <span>Reduce total terminations by 15%</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-green-600 mt-0.5" />
              <span>Achieve 50%+ survey response rate</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-green-600 mt-0.5" />
              <span>Lift all satisfaction scores above 3.5/5.0</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 rounded-lg border border-yellow-200 p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Data Quality & Methodology Notes</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Turnover data extracted from HR system "Terms Since 2017 Detail PT.xlsx" excluding TEMPS category</li>
          <li>• Exit survey data available for Q1 (20 responses), Q2 (11 responses), and Q4 (18 responses) only</li>
        </ul>
      </div>
    </div>
  );
};

export default FY2026Recommendations;