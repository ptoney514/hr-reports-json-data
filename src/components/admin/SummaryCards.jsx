import React, { useMemo } from 'react';
import { Users, TrendingUp, Calendar, Database, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const SummaryCards = ({ allQuartersData, dashboardType }) => {
  // Calculate summary statistics from all quarters data
  const summaryStats = useMemo(() => {
    if (!allQuartersData || Object.keys(allQuartersData).length === 0) {
      return {
        totalEmployees: 0,
        averageGrowth: 0,
        quarterCount: 0,
        recentGrowth: 0,
        trend: 'stable'
      };
    }

    const quarters = Object.entries(allQuartersData).sort(([a], [b]) => a.localeCompare(b));
    const quarterCount = quarters.length;

    if (dashboardType === 'workforce') {
      // Get latest quarter data
      const latestQuarter = quarters[quarters.length - 1]?.[1];
      const totalEmployees = latestQuarter?.totalEmployees || 0;

      // Calculate average growth
      const growthRates = quarters
        .map(([period, data]) => data.trends?.quarterlyGrowth || 0)
        .filter(rate => rate !== 0);
      const averageGrowth = growthRates.length > 0 
        ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length 
        : 0;

      // Calculate recent growth trend (last 2 quarters)
      let recentGrowth = 0;
      let trend = 'stable';
      if (quarters.length >= 2) {
        const recent = quarters.slice(-2);
        const oldValue = recent[0][1].totalEmployees || 0;
        const newValue = recent[1][1].totalEmployees || 0;
        
        if (oldValue > 0) {
          recentGrowth = ((newValue - oldValue) / oldValue) * 100;
          trend = recentGrowth > 1 ? 'up' : recentGrowth < -1 ? 'down' : 'stable';
        }
      }

      return {
        totalEmployees,
        averageGrowth,
        quarterCount,
        recentGrowth,
        trend
      };
    }

    // For other dashboard types, provide generic stats
    return {
      totalRecords: quarterCount,
      averageGrowth: 0,
      quarterCount,
      recentGrowth: 0,
      trend: 'stable'
    };
  }, [allQuartersData, dashboardType]);

  // Get card configurations based on dashboard type
  const getCardConfigs = () => {
    if (dashboardType === 'workforce') {
      return [
        {
          title: 'Total Employees',
          value: summaryStats.totalEmployees,
          format: 'number',
          subtitle: 'Latest Quarter',
          icon: Users,
          color: 'blue',
          trend: summaryStats.trend,
          trendValue: summaryStats.recentGrowth
        },
        {
          title: 'Average Growth',
          value: summaryStats.averageGrowth,
          format: 'percentage',
          subtitle: 'Across All Quarters',
          icon: TrendingUp,
          color: 'green',
          trend: summaryStats.averageGrowth > 0 ? 'up' : summaryStats.averageGrowth < 0 ? 'down' : 'stable'
        },
        {
          title: 'Quarters Tracked',
          value: summaryStats.quarterCount,
          format: 'number',
          subtitle: 'Available Data Points',
          icon: Calendar,
          color: 'purple'
        }
      ];
    }

    // Generic cards for other dashboard types
    return [
      {
        title: 'Total Records',
        value: summaryStats.totalRecords || 0,
        format: 'number',
        subtitle: 'Data Points',
        icon: Database,
        color: 'blue'
      },
      {
        title: 'Quarters Tracked',
        value: summaryStats.quarterCount,
        format: 'number',
        subtitle: 'Available Periods',
        icon: Calendar,
        color: 'green'
      },
      {
        title: 'Data Completeness',
        value: summaryStats.quarterCount > 0 ? 100 : 0,
        format: 'percentage',
        subtitle: 'Coverage',
        icon: TrendingUp,
        color: 'purple'
      }
    ];
  };

  // Format value based on type
  const formatValue = (value, format) => {
    if (value === null || value === undefined) return '0';
    
    switch (format) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'percentage':
        return typeof value === 'number' ? `${value.toFixed(1)}%` : value;
      default:
        return String(value);
    }
  };

  // Get color classes
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-900',
        progress: 'bg-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        text: 'text-green-900',
        progress: 'bg-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        text: 'text-purple-900',
        progress: 'bg-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        text: 'text-orange-900',
        progress: 'bg-orange-600'
      }
    };
    return colors[color] || colors.blue;
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUp size={14} className="text-green-600" />;
      case 'down':
        return <ArrowDown size={14} className="text-red-600" />;
      default:
        return <Minus size={14} className="text-gray-400" />;
    }
  };

  const cards = getCardConfigs();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Available Balance
        </h2>
        <p className="text-sm text-gray-600">
          Track your current {dashboardType} data and available metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const colorClasses = getColorClasses(card.color);
          const IconComponent = card.icon;
          
          return (
            <div
              key={index}
              className={`relative p-6 rounded-lg border-2 ${colorClasses.bg} ${colorClasses.border}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.border}`}>
                  <IconComponent size={20} className={colorClasses.icon} />
                </div>
                {card.trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(card.trend)}
                    {card.trendValue !== undefined && (
                      <span className={`text-sm font-medium ${
                        card.trend === 'up' ? 'text-green-600' : 
                        card.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {card.trendValue > 0 ? '+' : ''}{card.trendValue.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className={`text-2xl font-bold ${colorClasses.text}`}>
                  {formatValue(card.value, card.format)}
                </div>
                <div className="text-sm text-gray-600">
                  {card.subtitle}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colorClasses.progress} transition-all duration-500`}
                  style={{
                    width: card.format === 'percentage' 
                      ? `${Math.min(card.value || 0, 100)}%`
                      : `${Math.min((card.value || 0) / Math.max(summaryStats.totalEmployees || 1000, 1000) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryCards;