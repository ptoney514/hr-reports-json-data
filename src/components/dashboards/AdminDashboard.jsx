import React, { useState } from 'react';
import { Database, Upload, Download, Settings, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { DataViewer } from '../admin/DataViewer';
import { DataUploader } from '../admin/DataUploader';
import { DataEditor } from '../admin/DataEditor';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [selectedCollection, setSelectedCollection] = useState('workforce');
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  
  // Format the reporting period for display
  const formatReportingPeriod = (dateStr) => {
    if (!dateStr) return '';
    
    // Handle different date formats
    if (dateStr.includes('-')) {
      // Format: YYYY-MM-DD
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (dateStr.includes('/')) {
      // Format: M/D/YYYY
      const [month, day, year] = dateStr.split('/');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return dateStr;
  };

  const handlePeriodSelect = (period) => {
    console.log(`Period selected: ${period}`);
    setSelectedPeriod(period);
  };

  const handleEditPeriod = (period) => {
    console.log(`Edit period requested: ${period}`);
    setSelectedPeriod(period);
    setActiveTab('edit');
  };

  const collections = [
    { id: 'workforce', name: 'Workforce Metrics', path: 'dashboards/workforce' },
    { id: 'turnover', name: 'Turnover Metrics', path: 'metrics/turnover' },
    { id: 'exit-survey', name: 'Exit Survey Data', path: 'metrics/exit-survey' },
    { id: 'recruiting', name: 'Recruiting Metrics', path: 'metrics/recruiting' }
  ];

  const tabs = [
    { id: 'view', name: 'View Data', icon: Eye },
    { id: 'upload', name: 'Upload Data', icon: Upload },
    { id: 'edit', name: 'Edit Data', icon: Edit },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage HR Reports data and configurations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>New Entry</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Collection Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Collection
          </label>
          <div className="flex space-x-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCollection === collection.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Selected Period Indicator */}
        {selectedPeriod && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800">Selected Reporting Period:</span>
                <span className="text-sm text-blue-700">{formatReportingPeriod(selectedPeriod)}</span>
              </div>
              <button
                onClick={() => setSelectedPeriod(null)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'view' && (
            <DataViewer 
              collection={selectedCollection}
              onPeriodSelect={handlePeriodSelect}
              onEditPeriod={handleEditPeriod}
            />
          )}
          {activeTab === 'upload' && (
            <DataUploader collection={selectedCollection} />
          )}
          {activeTab === 'edit' && (
            <DataEditor 
              collection={selectedCollection}
              period={selectedPeriod}
            />
          )}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <p className="text-gray-600">Admin settings and configuration options coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;