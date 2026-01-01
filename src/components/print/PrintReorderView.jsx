import React, { useState } from 'react';
import {
  GripVertical, FileText, BarChart3, TrendingUp, Layout,
  Check, Edit3, Archive, Save, X
} from 'lucide-react';

/**
 * PrintReorderView - Drag and drop interface for reordering pages
 *
 * Features:
 * - Drag handle for each page
 * - Visual feedback during drag
 * - Section dividers
 * - Save/Cancel actions
 * - Reorder updates page order numbers
 */

// Page type icons
const pageTypeIcons = {
  cover: Layout,
  toc: FileText,
  data: BarChart3,
  trend: TrendingUp,
  divider: Layout
};

// Status icons
const statusIcons = {
  published: Check,
  draft: Edit3,
  archived: Archive
};

const PrintReorderView = ({ reportData, pages, onSave, onCancel }) => {
  // Local state for reordering
  const [orderedPages, setOrderedPages] = useState([...pages].sort((a, b) => a.order - b.order));
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Handle drag start
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    // Add dragging class after a brief delay for visual feedback
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  // Handle drop
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOrder = [...orderedPages];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    // Update order numbers
    const reorderedPages = newOrder.map((page, index) => ({
      ...page,
      order: index + 1
    }));

    setOrderedPages(reorderedPages);
    setHasChanges(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle save
  const handleSave = () => {
    onSave(orderedPages);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'text-green-600';
      case 'draft':
        return 'text-yellow-600';
      case 'archived':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get section name
  const getSectionName = (sectionId) => {
    const section = reportData?.sections?.find(s => s.id === sectionId);
    return section?.name || null;
  };

  // Track current section for dividers
  let currentSection = null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reorder Pages</h2>
            <p className="text-sm text-gray-500">
              Drag and drop to rearrange page order
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Save Order
            </button>
          </div>
        </div>
      </div>

      {/* Reorder List */}
      <div className="flex-1 overflow-auto p-6 bg-gray-100">
        <div className="max-w-2xl mx-auto">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Tip:</span> Drag the handle (<GripVertical className="w-4 h-4 inline" />) to reorder pages.
              Section dividers will be automatically inserted based on page sections.
            </p>
          </div>

          {/* Pages List */}
          <div className="space-y-2">
            {orderedPages.map((page, index) => {
              const PageIcon = pageTypeIcons[page.type] || FileText;
              const StatusIcon = statusIcons[page.status] || Check;
              const showSectionDivider = page.section && page.section !== currentSection;

              if (page.section) {
                currentSection = page.section;
              }

              return (
                <React.Fragment key={page.id}>
                  {/* Section Divider */}
                  {showSectionDivider && (
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex-1 border-t border-gray-300" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {getSectionName(page.section)}
                      </span>
                      <div className="flex-1 border-t border-gray-300" />
                    </div>
                  )}

                  {/* Page Item */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`
                      flex items-center gap-4 p-4 bg-white rounded-lg border-2
                      cursor-move transition-all duration-200
                      ${draggedIndex === index ? 'opacity-50 border-blue-300' : 'border-gray-200'}
                      ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-500 border-dashed bg-blue-50' : ''}
                      hover:border-gray-300 hover:shadow-sm
                    `}
                  >
                    {/* Drag Handle */}
                    <div className="text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Order Number */}
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                      {page.order}
                    </div>

                    {/* Page Icon */}
                    <PageIcon className="w-5 h-5 text-gray-400" />

                    {/* Page Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{page.title}</h3>
                      <p className="text-xs text-gray-500">
                        {page.type.charAt(0).toUpperCase() + page.type.slice(1)} page
                        {page.section && ` • ${getSectionName(page.section)}`}
                      </p>
                    </div>

                    {/* Status Icon */}
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(page.status)}`} />
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Drop Zone at End */}
          {draggedIndex !== null && (
            <div
              onDragOver={(e) => handleDragOver(e, orderedPages.length)}
              onDrop={(e) => handleDrop(e, orderedPages.length)}
              className={`
                mt-2 p-8 border-2 border-dashed rounded-lg text-center text-gray-400
                ${dragOverIndex === orderedPages.length ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              `}
            >
              Drop here to move to end
            </div>
          )}
        </div>
      </div>

      {/* Footer with status */}
      {hasChanges && (
        <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-3">
          <p className="text-sm text-yellow-800 text-center">
            <span className="font-medium">Unsaved changes</span> - Click "Save Order" to apply your changes
          </p>
        </div>
      )}
    </div>
  );
};

export default PrintReorderView;
