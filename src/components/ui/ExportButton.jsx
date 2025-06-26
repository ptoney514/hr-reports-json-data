import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';

const ExportButton = ({ 
  onExport,
  dashboardTitle = 'Dashboard',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportOptions = [
    {
      id: 'pdf',
      label: 'Export as PDF',
      icon: FileText,
      action: () => handleExport('pdf')
    },
    {
      id: 'excel',
      label: 'Export to Excel',
      icon: FileSpreadsheet,
      action: () => handleExport('excel')
    },
    {
      id: 'print',
      label: 'Print Dashboard',
      icon: Printer,
      action: () => handleExport('print')
    }
  ];

  const handleExport = (type) => {
    setIsOpen(false);
    
    switch (type) {
      case 'pdf':
        // For now, use browser print to PDF functionality
        window.print();
        break;
      case 'excel':
        // Placeholder for Excel export - will implement later
        console.log('Excel export functionality will be implemented');
        alert('Excel export functionality will be implemented in a future update.');
        break;
      case 'print':
        window.print();
        break;
      default:
        break;
    }

    // Call custom export handler if provided
    if (onExport) {
      onExport(type);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition-colors"
      >
        <Download size={16} />
        <span className="text-sm">Export</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            {exportOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <IconComponent size={16} className="text-gray-500" />
                  {option.label}
                </button>
              );
            })}
          </div>
          
          {/* Footer note */}
          <div className="border-t border-gray-200 p-2">
            <p className="text-xs text-gray-500 text-center">
              {dashboardTitle} Export
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton; 