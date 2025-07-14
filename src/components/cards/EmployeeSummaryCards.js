import React, { useRef, useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  BookOpen, 
  GraduationCap, 
  ChevronRight,
  ChevronLeft,
  Activity
} from 'lucide-react';
import WorkforceCategoryCard from './WorkforceCategoryCard';

const EmployeeSummaryCards = ({ stats, selectedQuarter }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Define all 12 workforce categories based on the requirements
  const workforceCategories = [
    { 
      key: 'beFacultyOmaha', 
      title: 'BE Faculty Omaha', 
      displayName: 'Faculty', 
      icon: BookOpen, 
      color: 'green' 
    },
    { 
      key: 'beFacultyPhoenix', 
      title: 'BE Faculty Phoenix', 
      displayName: 'Faculty', 
      icon: BookOpen, 
      color: 'green' 
    },
    { 
      key: 'beStaffOmaha', 
      title: 'BE Staff Omaha', 
      displayName: 'Staff', 
      icon: Building, 
      color: 'blue' 
    },
    { 
      key: 'beStaffPhoenix', 
      title: 'BE Staff Phoenix', 
      displayName: 'Staff', 
      icon: Building, 
      color: 'blue' 
    },
    { 
      key: 'hsrOmaha', 
      title: 'HSR Omaha', 
      displayName: 'House Staff Physician', 
      icon: Activity, 
      color: 'purple' 
    },
    { 
      key: 'hsrPhoenix', 
      title: 'HSR Phoenix', 
      displayName: 'House Staff Physician', 
      icon: Activity, 
      color: 'purple' 
    },
    { 
      key: 'studentOmaha', 
      title: 'Student Omaha', 
      displayName: 'Student', 
      icon: GraduationCap, 
      color: 'orange' 
    },
    { 
      key: 'studentPhoenix', 
      title: 'Student Phoenix', 
      displayName: 'Student', 
      icon: GraduationCap, 
      color: 'orange' 
    },
    { 
      key: 'nbeFacultyOmaha', 
      title: 'NBE Faculty Omaha', 
      displayName: 'NBE Faculty', 
      icon: Users, 
      color: 'gray' 
    },
    { 
      key: 'nbeStaffOmaha', 
      title: 'NBE Staff Omaha', 
      displayName: 'NBE Staff', 
      icon: Users, 
      color: 'gray' 
    },
    { 
      key: 'nbeFacultyPhoenix', 
      title: 'NBE Faculty Phoenix', 
      displayName: 'NBE Faculty', 
      icon: Users, 
      color: 'gray' 
    },
    { 
      key: 'nbeStaffPhoenix', 
      title: 'NBE Staff Phoenix', 
      displayName: 'NBE Staff', 
      icon: Users, 
      color: 'gray' 
    }
  ];

  // Handle scroll position updates for arrow visibility
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Update arrow visibility when cards change
  useEffect(() => {
    handleScroll();
  }, [stats]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -220, // Card width + gap (negative for left)
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 220, // Card width + gap
        behavior: 'smooth'
      });
    }
  };

  // Left Arrow Component
  const LeftArrow = () => (
    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-50 via-gray-50 to-transparent pr-8 pointer-events-none z-10">
      <button
        onClick={scrollLeft}
        className="h-12 w-8 bg-white border border-gray-300 rounded-md shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 pointer-events-auto flex items-center justify-center"
        aria-label="Scroll left to see previous categories"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );

  // Right Arrow Component  
  const RightArrow = () => (
    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent pl-8 pointer-events-none z-10">
      <button
        onClick={scrollRight}
        className="h-12 w-8 bg-white border border-gray-300 rounded-md shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 pointer-events-auto flex items-center justify-center"
        aria-label="Scroll right to see more categories"
      >
        <ChevronRight className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Horizontal Scrolling Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ 
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none'  // IE/Edge
          }}
        >
          {workforceCategories.map((category) => (
            <WorkforceCategoryCard 
              key={category.key}
              category={category}
              count={stats[category.key] || 0}
              selectedQuarter={selectedQuarter}
            />
          ))}
        </div>
        
        {/* Conditional Scroll Arrows */}
        {showLeftArrow && <LeftArrow />}
        {showRightArrow && <RightArrow />}
      </div>
    </div>
  );
};

export default EmployeeSummaryCards;