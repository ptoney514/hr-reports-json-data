import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { toDisplayFormat } from '../../utils/quarterFormatUtils';

const EditModal = ({ isOpen, onClose, quarterData, onSave }) => {
  const [formData, setFormData] = useState({
    // Benefit Eligible - Omaha
    beFacultyOmaha: 0,
    beStaffOmaha: 0,
    
    // Benefit Eligible - Phoenix
    beFacultyPhoenix: 0,
    beStaffPhoenix: 0,
    
    // Non-Benefit Eligible - Omaha
    nbeFacultyOmaha: 0,
    nbeStaffOmaha: 0,
    
    // Non-Benefit Eligible - Phoenix
    nbeFacultyPhoenix: 0,
    nbeStaffPhoenix: 0,
    
    // HSR (House Staff Residents) - Omaha and Phoenix
    hsrOmaha: 0,
    hsrPhoenix: 0,
    
    // Students (always NBE)
    studentOmaha: 0,
    studentPhoenix: 0,
    
    // Turnover - Omaha
    turnoverBeFacultyOmaha: 0,
    turnoverBeStaffOmaha: 0,
    
    // Turnover - Phoenix
    turnoverBeFacultyPhoenix: 0,
    turnoverBeStaffPhoenix: 0,
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Cleanup function to restore scroll
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Initialize form data when quarter data changes
  useEffect(() => {
    if (quarterData) {
      const { period, rawData } = quarterData;
      
      // Extract data from various possible structures
      const demographics = rawData?.demographics || {};
      const locations = rawData?.byLocation || {};
      const omaha = locations.omaha || locations.Omaha || {};
      const phoenix = locations.phoenix || locations.Phoenix || {};
      const trends = rawData?.trends || {};
      
      setFormData({
        // Parse BE/NBE data with fallbacks
        beFacultyOmaha: omaha.beFaculty || Math.round((demographics.beFaculty || 0) * 0.9),
        beStaffOmaha: omaha.beStaff || Math.round((demographics.beStaff || 0) * 0.9),
        
        beFacultyPhoenix: phoenix.beFaculty || Math.round((demographics.beFaculty || 0) * 0.1),
        beStaffPhoenix: phoenix.beStaff || Math.round((demographics.beStaff || 0) * 0.1),
        
        nbeFacultyOmaha: omaha.nbeFaculty || Math.round((demographics.nbeFaculty || 0) * 0.9),
        nbeStaffOmaha: omaha.nbeStaff || Math.round((demographics.nbeStaff || 0) * 0.9),
        
        nbeFacultyPhoenix: phoenix.nbeFaculty || Math.round((demographics.nbeFaculty || 0) * 0.1),
        nbeStaffPhoenix: phoenix.nbeStaff || Math.round((demographics.nbeStaff || 0) * 0.1),
        
        // HSR data
        hsrOmaha: omaha.hsr || Math.round((demographics.hsr || 0) * 0.9),
        hsrPhoenix: phoenix.hsr || Math.round((demographics.hsr || 0) * 0.1),
        
        studentOmaha: omaha.students || Math.round((demographics.students || 0) * 0.9),
        studentPhoenix: phoenix.students || Math.round((demographics.students || 0) * 0.1),
        
        // Turnover data
        turnoverBeFacultyOmaha: trends.turnoverBeFacultyOmaha || 0,
        turnoverBeStaffOmaha: trends.turnoverBeStaffOmaha || 0,
        turnoverBeFacultyPhoenix: trends.turnoverBeFacultyPhoenix || 0,
        turnoverBeStaffPhoenix: trends.turnoverBeStaffPhoenix || 0,
      });
    }
  }, [quarterData]);

  const handleInputChange = useCallback((field, value) => {
    // Allow empty string for better UX while typing
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
      return;
    }
    
    // Convert to number, ensuring it's a valid positive integer
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    }
  }, []);

  const handleSave = () => {
    // Convert empty strings to 0 for calculations
    const getNumericValue = (val) => val === '' ? 0 : parseInt(val) || 0;
    
    // Calculate totals
    const totalBeFaculty = getNumericValue(formData.beFacultyOmaha) + getNumericValue(formData.beFacultyPhoenix);
    const totalBeStaff = getNumericValue(formData.beStaffOmaha) + getNumericValue(formData.beStaffPhoenix);
    const totalNbeFaculty = getNumericValue(formData.nbeFacultyOmaha) + getNumericValue(formData.nbeFacultyPhoenix);
    const totalNbeStaff = getNumericValue(formData.nbeStaffOmaha) + getNumericValue(formData.nbeStaffPhoenix);
    const totalHsr = getNumericValue(formData.hsrOmaha) + getNumericValue(formData.hsrPhoenix);
    const totalStudents = getNumericValue(formData.studentOmaha) + getNumericValue(formData.studentPhoenix);
    
    // Prepare updated data structure
    const updatedData = {
      ...quarterData.rawData,
      totalEmployees: totalBeFaculty + totalBeStaff + totalNbeFaculty + totalNbeStaff + totalHsr + totalStudents,
      demographics: {
        beFaculty: totalBeFaculty,
        beStaff: totalBeStaff,
        nbeFaculty: totalNbeFaculty,
        nbeStaff: totalNbeStaff,
        faculty: totalBeFaculty + totalNbeFaculty,
        staff: totalBeStaff + totalNbeStaff,
        hsr: totalHsr,
        students: totalStudents,
        nbeStudents: totalStudents,
      },
      byLocation: {
        omaha: {
          name: 'Omaha',
          beFaculty: getNumericValue(formData.beFacultyOmaha),
          beStaff: getNumericValue(formData.beStaffOmaha),
          nbeFaculty: getNumericValue(formData.nbeFacultyOmaha),
          nbeStaff: getNumericValue(formData.nbeStaffOmaha),
          hsr: getNumericValue(formData.hsrOmaha),
          students: getNumericValue(formData.studentOmaha),
          breakdown: {
            faculty: getNumericValue(formData.beFacultyOmaha) + getNumericValue(formData.nbeFacultyOmaha),
            staff: getNumericValue(formData.beStaffOmaha) + getNumericValue(formData.nbeStaffOmaha),
            hsr: getNumericValue(formData.hsrOmaha),
            students: getNumericValue(formData.studentOmaha),
          },
          total: getNumericValue(formData.beFacultyOmaha) + getNumericValue(formData.beStaffOmaha) + getNumericValue(formData.nbeFacultyOmaha) + getNumericValue(formData.nbeStaffOmaha) + getNumericValue(formData.hsrOmaha) + getNumericValue(formData.studentOmaha),
        },
        phoenix: {
          name: 'Phoenix',
          beFaculty: getNumericValue(formData.beFacultyPhoenix),
          beStaff: getNumericValue(formData.beStaffPhoenix),
          nbeFaculty: getNumericValue(formData.nbeFacultyPhoenix),
          nbeStaff: getNumericValue(formData.nbeStaffPhoenix),
          hsr: getNumericValue(formData.hsrPhoenix),
          students: getNumericValue(formData.studentPhoenix),
          breakdown: {
            faculty: getNumericValue(formData.beFacultyPhoenix) + getNumericValue(formData.nbeFacultyPhoenix),
            staff: getNumericValue(formData.beStaffPhoenix) + getNumericValue(formData.nbeStaffPhoenix),
            hsr: getNumericValue(formData.hsrPhoenix),
            students: getNumericValue(formData.studentPhoenix),
          },
          total: getNumericValue(formData.beFacultyPhoenix) + getNumericValue(formData.beStaffPhoenix) + getNumericValue(formData.nbeFacultyPhoenix) + getNumericValue(formData.nbeStaffPhoenix) + getNumericValue(formData.hsrPhoenix) + getNumericValue(formData.studentPhoenix),
        },
      },
      trends: {
        ...quarterData.rawData.trends,
        turnoverBeFacultyOmaha: getNumericValue(formData.turnoverBeFacultyOmaha),
        turnoverBeStaffOmaha: getNumericValue(formData.turnoverBeStaffOmaha),
        turnoverBeFacultyPhoenix: getNumericValue(formData.turnoverBeFacultyPhoenix),
        turnoverBeStaffPhoenix: getNumericValue(formData.turnoverBeStaffPhoenix),
      },
      lastUpdated: new Date(),
      lastEditedBy: 'Admin Modal Editor',
    };
    
    onSave(quarterData.period, updatedData);
    onClose();
  };

  // Helper function to safely get numeric value for display
  const getNumValue = (val) => val === '' ? 0 : parseInt(val) || 0;

  const handleKeyDown = useCallback((e) => {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
    // Prevent escape from closing modal unintentionally
    if (e.key === 'Escape') {
      e.stopPropagation();
    }
  }, []);

  const handleInputEvent = useCallback((field, value, e) => {
    // Prevent event bubbling that could cause scroll issues
    e.stopPropagation();
    handleInputChange(field, value);
  }, [handleInputChange]);

  if (!isOpen) return null;

  const InputField = ({ label, value, field, description }) => (
    <div className="p-3 border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <input
        type="number"
        value={value || ''}
        onChange={(e) => handleInputEvent(field, e.target.value, e)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        min="0"
        step="1"
        placeholder="0"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Workforce Data
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Reporting Period: {toDisplayFormat(quarterData?.period) || 'Unknown'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content - All Fields Vertical */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          <div className="space-y-4">
            {/* Reporting Period (Read-only) */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporting Period
              </label>
              <p className="text-sm text-gray-600">Fiscal year reporting period and end date</p>
              <input
                type="text"
                value={toDisplayFormat(quarterData?.period) || 'Unknown'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* BE Faculty Omaha */}
            <InputField
              label="BE Faculty Omaha"
              value={formData.beFacultyOmaha}
              field="beFacultyOmaha"
              description="Benefit Eligible faculty headcount at Omaha campus"
            />

            {/* BE Faculty Phoenix */}
            <InputField
              label="BE Faculty Phoenix"
              value={formData.beFacultyPhoenix}
              field="beFacultyPhoenix"
              description="Benefit Eligible faculty headcount at Phoenix campus"
            />

            {/* BE Staff Omaha */}
            <InputField
              label="BE Staff Omaha"
              value={formData.beStaffOmaha}
              field="beStaffOmaha"
              description="Benefit Eligible staff headcount at Omaha campus"
            />

            {/* BE Staff Phoenix */}
            <InputField
              label="BE Staff Phoenix"
              value={formData.beStaffPhoenix}
              field="beStaffPhoenix"
              description="Benefit Eligible staff headcount at Phoenix campus"
            />

            {/* HSR Omaha */}
            <InputField
              label="HSR Omaha"
              value={formData.hsrOmaha}
              field="hsrOmaha"
              description="House Staff Residents (HSR) headcount at Omaha campus"
            />

            {/* HSR Phoenix */}
            <InputField
              label="HSR Phoenix"
              value={formData.hsrPhoenix}
              field="hsrPhoenix"
              description="House Staff Residents (HSR) headcount at Phoenix campus"
            />

            {/* Student Omaha */}
            <InputField
              label="Student Omaha"
              value={formData.studentOmaha}
              field="studentOmaha"
              description="Student headcount at Omaha campus. Note: Students are all not benefit eligible."
            />

            {/* Student Phoenix */}
            <InputField
              label="Student Phoenix"
              value={formData.studentPhoenix}
              field="studentPhoenix"
              description="Student headcount at Phoenix campus. Note: Students are all not benefit eligible"
            />

            {/* Turnover BE Faculty Omaha */}
            <InputField
              label="Turnover BE Faculty Omaha"
              value={formData.turnoverBeFacultyOmaha}
              field="turnoverBeFacultyOmaha"
              description="Benefit Eligible faculty turnover at Omaha campus"
            />

            {/* Turnover BE Faculty Phoenix */}
            <InputField
              label="Turnover BE Faculty Phoenix"
              value={formData.turnoverBeFacultyPhoenix}
              field="turnoverBeFacultyPhoenix"
              description="Benefit Eligible faculty turnover at Phoenix campus"
            />

            {/* Turnover BE Staff Omaha */}
            <InputField
              label="Turnover BE Staff Omaha"
              value={formData.turnoverBeStaffOmaha}
              field="turnoverBeStaffOmaha"
              description="Benefit Eligible staff turnover at Omaha campus"
            />

            {/* Turnover BE Staff Phoenix */}
            <InputField
              label="Turnover BE Staff Phoenix"
              value={formData.turnoverBeStaffPhoenix}
              field="turnoverBeStaffPhoenix"
              description="Benefit Eligible staff turnover at Phoenix campus"
            />

            {/* NBE Faculty Omaha */}
            <InputField
              label="NBE Faculty Omaha"
              value={formData.nbeFacultyOmaha}
              field="nbeFacultyOmaha"
              description="Non-benefit eligible faculty at Omaha campus"
            />

            {/* NBE Staff Omaha */}
            <InputField
              label="NBE Staff Omaha"
              value={formData.nbeStaffOmaha}
              field="nbeStaffOmaha"
              description="Non-benefit eligible staff at Omaha campus"
            />

            {/* NBE Faculty Phoenix */}
            <InputField
              label="NBE Faculty Phoenix"
              value={formData.nbeFacultyPhoenix}
              field="nbeFacultyPhoenix"
              description="Non-benefit eligible faculty at Phoenix campus"
            />

            {/* NBE Staff Phoenix */}
            <InputField
              label="NBE Staff Phoenix"
              value={formData.nbeStaffPhoenix}
              field="nbeStaffPhoenix"
              description="Non-benefit eligible staff at Phoenix campus"
            />
          </div>

          {/* Summary Totals */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Summary Totals
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total BE Faculty:</span>{' '}
                <span className="text-blue-600 font-semibold">
                  {getNumValue(formData.beFacultyOmaha) + getNumValue(formData.beFacultyPhoenix)}
                </span>
              </div>
              <div>
                <span className="font-medium">Total BE Staff:</span>{' '}
                <span className="text-blue-600 font-semibold">
                  {getNumValue(formData.beStaffOmaha) + getNumValue(formData.beStaffPhoenix)}
                </span>
              </div>
              <div>
                <span className="font-medium">Total HSR:</span>{' '}
                <span className="text-blue-600 font-semibold">
                  {getNumValue(formData.hsrOmaha) + getNumValue(formData.hsrPhoenix)}
                </span>
              </div>
              <div>
                <span className="font-medium">Total Students:</span>{' '}
                <span className="text-blue-600 font-semibold">
                  {getNumValue(formData.studentOmaha) + getNumValue(formData.studentPhoenix)}
                </span>
              </div>
              <div>
                <span className="font-medium">Total Employees:</span>{' '}
                <span className="text-blue-600 font-semibold">
                  {getNumValue(formData.beFacultyOmaha) + getNumValue(formData.beFacultyPhoenix) +
                   getNumValue(formData.beStaffOmaha) + getNumValue(formData.beStaffPhoenix) +
                   getNumValue(formData.nbeFacultyOmaha) + getNumValue(formData.nbeFacultyPhoenix) +
                   getNumValue(formData.nbeStaffOmaha) + getNumValue(formData.nbeStaffPhoenix) +
                   getNumValue(formData.hsrOmaha) + getNumValue(formData.hsrPhoenix) +
                   getNumValue(formData.studentOmaha) + getNumValue(formData.studentPhoenix)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-600">
            All changes will be saved to Firebase
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;