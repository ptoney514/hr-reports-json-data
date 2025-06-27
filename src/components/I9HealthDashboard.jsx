import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Filter, Calendar, Download, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import './I9Dashboard.css';

const I9HealthDashboard = () => {

    // I-9 Compliance Data
    const currentMetrics = {
        totalI9s: 619,
        section2OnTime: 579,
        section2Late: 40,
        section2Compliance: 94,
        overallCompliance: 90,
        reverifications: 10,
        auditReady: 88
    };

    const previousMetrics = {
        totalI9s: 587,
        section2Compliance: 91,
        overallCompliance: 87
    };

    // Compliance by employee type
    const complianceByType = [
        { name: 'Faculty/Staff', total: 363, onTime: 340, late: 23, rate: 94 },
        { name: 'Students', total: 252, onTime: 235, late: 17, rate: 93 },
        { name: 'Phoenix Campus', total: 4, onTime: 4, late: 0, rate: 100 }
    ];

    // Historical trend data
    const trendData = [
        { quarter: 'Q1-24', compliance: 85, processed: 532 },
        { quarter: 'Q2-24', compliance: 87, processed: 598 },
        { quarter: 'Q3-24', compliance: 89, processed: 612 },
        { quarter: 'Q4-24', compliance: 91, processed: 587 },
        { quarter: 'Q1-25', compliance: 87, processed: 645 },
        { quarter: 'Q2-25', compliance: 90, processed: 619 }
    ];

    // Risk indicators
    const riskMetrics = [
        { category: 'Late Section 2', count: 40, risk: 'Medium', color: '#f59e0b' },
        { category: 'Missing Training', count: 12, risk: 'High', color: '#ef4444' },
        { category: 'Audit Findings', count: 3, risk: 'High', color: '#ef4444' },
        { category: 'Process Gaps', count: 8, risk: 'Medium', color: '#f59e0b' }
    ];

    // Process improvement tracking
    const improvements = [
        { item: 'SOP v2 Implementation', status: 'Complete', impact: '+3% compliance' },
        { item: 'Annual Training Program', status: 'In Progress', impact: 'TBD' },
        { item: 'Interfolio Integration', status: 'Pilot Phase', impact: 'TBD' },
        { item: 'Dashboard Automation', status: 'Complete', impact: '+15% efficiency' }
    ];

    // Calculate percentage changes
    const complianceChange = ((currentMetrics.overallCompliance - previousMetrics.overallCompliance) / previousMetrics.overallCompliance * 100).toFixed(1);
    const section2Change = ((currentMetrics.section2Compliance - previousMetrics.section2Compliance) / previousMetrics.section2Compliance * 100).toFixed(1);

    // Chart data for bar chart
    const barChartData = complianceByType.map(type => ({
        name: type.name,
        'On-Time': type.onTime,
        'Late': type.late
    }));

    // Chart data for line chart
    const lineChartData = trendData.map(item => ({
        quarter: item.quarter,
        compliance: item.compliance,
        target: 95
    }));

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-gray-50 p-4 min-h-screen print:bg-white print:p-2 print:text-black">
            {/* Header */}
            <div className="mb-4 print:mb-2 flex justify-between items-center print:no-break">
                <div>
                    <h1 className="text-2xl print:text-xl font-bold text-blue-700 print:text-black">
                        I-9 Compliance Health Dashboard
                    </h1>
                    <p className="text-sm print:text-xs text-gray-600 print:text-black">
                        Quarter: Q2 2025 | Generated: {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-3 no-print">
                    <button className="flex items-center gap-1 px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50">
                        <Filter size={16} />
                        <span>Filters</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50">
                        <Calendar size={16} />
                        <span>Q2 2025</span>
                    </button>
                    <button 
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
                        onClick={handlePrint}
                    >
                        <Download size={16} />
                        <span>Print PDF</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:gap-2 mb-4 print:mb-3 print:no-break">
                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <div className="flex items-center gap-2 mb-1 print:mb-1">
                        <CheckCircle className="text-green-500 print:text-black" size={16} />
                        <h2 className="text-sm print:text-xs font-medium text-blue-700 print:text-black">
                            Overall Compliance
                        </h2>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl print:text-xl font-bold text-green-600 print:text-black">
                            {currentMetrics.overallCompliance}%
                        </span>
                        <span className={`text-xs ${complianceChange >= 0 ? 'text-green-500 print:text-black' : 'text-red-500 print:text-black'}`}>
                            {complianceChange >= 0 ? '+' : ''}{complianceChange}%
                        </span>
                    </div>
                    <p className="text-gray-500 print:text-black text-xs print:text-xs">
                        Target: 95% | Prev: {previousMetrics.overallCompliance}%
                    </p>
                </div>

                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="text-blue-500 print:text-black" size={16} />
                        <h2 className="text-sm print:text-xs font-medium text-blue-700 print:text-black">
                            Section 2 Timeliness
                        </h2>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl print:text-xl font-bold print:text-black">
                            {currentMetrics.section2Compliance}%
                        </span>
                        <span className={`text-xs ${section2Change >= 0 ? 'text-green-500 print:text-black' : 'text-red-500 print:text-black'}`}>
                            {section2Change >= 0 ? '↑' : '↓'}
                        </span>
                    </div>
                    <p className="text-gray-500 print:text-black text-xs">
                        {currentMetrics.section2OnTime} on-time / {currentMetrics.totalI9s} total
                    </p>
                </div>

                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="text-purple-500 print:text-black" size={16} />
                        <h2 className="text-sm print:text-xs font-medium text-blue-700 print:text-black">
                            Forms Processed
                        </h2>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl print:text-xl font-bold print:text-black">
                            {currentMetrics.totalI9s}
                        </span>
                    </div>
                    <p className="text-gray-500 print:text-black text-xs">
                        +{currentMetrics.totalI9s - previousMetrics.totalI9s} vs prev quarter
                    </p>
                </div>

                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="text-orange-500 print:text-black" size={16} />
                        <h2 className="text-sm print:text-xs font-medium text-blue-700 print:text-black">
                            Audit Readiness
                        </h2>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl print:text-xl font-bold text-orange-600 print:text-black">
                            {currentMetrics.auditReady}%
                        </span>
                    </div>
                    <p className="text-gray-500 print:text-black text-xs">
                        Risk factors identified: 4
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-4 print:mb-3 print:break-page">
                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
                        Compliance by Employee Type
                    </h3>
                    <ResponsiveContainer width="100%" height={240} className="print:h-48">
                        <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="On-Time" fill="#10b981" />
                            <Bar dataKey="Late" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
                        Quarterly Compliance Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={240} className="print:h-48">
                        <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="quarter" />
                            <YAxis domain={[80, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="compliance" stroke="#1d4ed8" strokeWidth={2} />
                            <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Risk and Improvements Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-4 print:mb-3 print:no-break">
                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
                        Risk Assessment
                    </h3>
                    <div className="space-y-2 print:space-y-1">
                        {riskMetrics.map((risk, index) => (
                            <div key={index} className="flex justify-between items-center p-2 print:p-1 bg-gray-50 print:bg-white rounded">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: risk.color }}
                                    ></div>
                                    <span className="text-sm print:text-xs font-medium">{risk.category}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm print:text-xs font-bold">{risk.count}</div>
                                    <div className={`text-xs ${risk.risk === 'High' ? 'text-red-600 print:text-black' : 'text-orange-600 print:text-black'}`}>
                                        {risk.risk} Risk
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
                    <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
                        Process Improvements
                    </h3>
                    <div className="space-y-2 print:space-y-1">
                        {improvements.map((improvement, index) => (
                            <div key={index} className="flex justify-between items-center p-2 print:p-1 bg-gray-50 print:bg-white rounded">
                                <div>
                                    <div className="text-sm print:text-xs font-medium">{improvement.item}</div>
                                    <div className="text-xs text-gray-500 print:text-black">{improvement.impact}</div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                    improvement.status === 'Complete' 
                                        ? 'bg-green-100 text-green-800 print:bg-white print:text-black' 
                                        : improvement.status === 'In Progress'
                                        ? 'bg-blue-100 text-blue-800 print:bg-white print:text-black'
                                        : 'bg-yellow-100 text-yellow-800 print:bg-white print:text-black'
                                }`}>
                                    {improvement.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray mb-4 print:mb-3 print:no-break">
                <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
                    Compliance Metrics by Location/Type
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm print:text-xs">
                        <thead>
                            <tr className="border-b print:border-gray">
                                <th className="text-left p-2 print:p-1 font-semibold">Employee Type</th>
                                <th className="text-right p-2 print:p-1 font-semibold">Total Forms</th>
                                <th className="text-right p-2 print:p-1 font-semibold">On-Time</th>
                                <th className="text-right p-2 print:p-1 font-semibold">Late</th>
                                <th className="text-right p-2 print:p-1 font-semibold">Compliance Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complianceByType.map((type, index) => (
                                <tr key={index} className="border-b print:border-gray">
                                    <td className="p-2 print:p-1 font-medium">{type.name}</td>
                                    <td className="text-right p-2 print:p-1">{type.total}</td>
                                    <td className="text-right p-2 print:p-1 text-green-600 print:text-black">{type.onTime}</td>
                                    <td className="text-right p-2 print:p-1 text-red-600 print:text-black">{type.late}</td>
                                    <td className="text-right p-2 print:p-1 font-semibold">{type.rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-gray-50 print:bg-white p-4 print:p-3 rounded-lg border border-gray-200 print:border-gray print:no-break">
                <h2 className="text-xl print:text-lg font-bold text-blue-700 print:text-black mb-3 print:mb-2">
                    I-9 COMPLIANCE EXECUTIVE SUMMARY
                </h2>
                <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
                    <p className="text-gray-700 print:text-black">
                        <strong>Current Status:</strong> Creighton University processed 619 I-9 forms in Q2 2025, achieving a 90% overall compliance rate and 94% Section 2 timeliness. This represents a +3% improvement from the previous quarter, demonstrating steady progress toward our 95% target.
                    </p>
                    <p className="text-gray-700 print:text-black">
                        <strong>Key Achievements:</strong> Implementation of SOP v2 has improved process consistency. Phoenix Campus maintains 100% compliance. Training program enrollment is at 79% completion with all I-9 completers on track for certification by year-end.
                    </p>
                    <p className="text-gray-700 print:text-black">
                        <strong>Areas for Improvement:</strong> Faculty/Staff operations show 6% late completion rate (23/363 forms), while student worker processing shows 7% late rate (17/252 forms). The Interfolio pilot for faculty onboarding is underway to address systemic delays.
                    </p>
                    <p className="text-gray-700 print:text-black">
                        <strong>Next Quarter Focus:</strong> Complete annual training rollout, finalize Interfolio integration pilot, and implement enhanced monitoring for high-volume hiring periods to achieve and maintain 95% compliance target.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default I9HealthDashboard; 