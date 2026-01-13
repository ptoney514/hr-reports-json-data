import React from 'react';

const AgeGenderPyramid = ({ data }) => {
  if (!data || !data.ageGenderBreakdown) return null;

  // Prepare data for split bar charts (no negative values)
  const preparePyramidData = (ageGenderData, totals) => {
    const ageBands = ['61 Plus', '51-60', '41-50', '31-40', '20-30'];
    
    return ageBands.map(band => {
      const male = ageGenderData[band]?.male || 0;
      const female = ageGenderData[band]?.female || 0;
      const total = male + female;
      
      return {
        ageBand: band,
        male: male,
        female: female,
        malePercent: ((male / totals) * 100).toFixed(1),
        femalePercent: ((female / totals) * 100).toFixed(1),
        total: total
      };
    });
  };

  const facultyData = preparePyramidData(data.ageGenderBreakdown.faculty, data.totals.faculty);
  const staffData = preparePyramidData(data.ageGenderBreakdown.staff, data.totals.staff);

  // Calculate overall gender percentages
  const facultyMaleTotal = Object.values(data.ageGenderBreakdown.faculty).reduce((sum, band) => sum + band.male, 0);
  const facultyFemaleTotal = Object.values(data.ageGenderBreakdown.faculty).reduce((sum, band) => sum + band.female, 0);
  const staffMaleTotal = Object.values(data.ageGenderBreakdown.staff).reduce((sum, band) => sum + band.male, 0);
  const staffFemaleTotal = Object.values(data.ageGenderBreakdown.staff).reduce((sum, band) => sum + band.female, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 print:break-inside-avoid">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Age/Gender Distribution - Horizontal Bars
      </h3>
      <p className="text-sm text-gray-600 mb-4">As of 6/30/25</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Faculty Chart */}
        <div>
          <h4 className="text-md font-medium text-center mb-2 text-gray-700">
            Faculty ({data.totals.faculty} total)
          </h4>
          <div className="text-center text-sm mb-4">
            <span className="text-pink-500 font-semibold">
              ♀ {((facultyFemaleTotal / data.totals.faculty) * 100).toFixed(1)}% Female
            </span>
            <span className="mx-3">|</span>
            <span className="text-blue-600 font-semibold">
              ♂ {((facultyMaleTotal / data.totals.faculty) * 100).toFixed(1)}% Male
            </span>
          </div>
          
          <div className="space-y-2">
            {facultyData.map((row, index) => (
              <div key={row.ageBand} className={`${index < facultyData.length - 1 ? 'border-b border-gray-200' : ''} pb-2`}>
                <div className="flex items-center gap-2">
                  {/* Age label - fixed width for alignment */}
                  <div className="w-16 text-xs font-medium text-gray-700 text-right pr-2">
                    {row.ageBand}
                  </div>
                  {/* Bars container */}
                  <div className="flex-1 flex items-center gap-0">
                    {/* Female bar (left) */}
                    <div className="flex-1 flex justify-end">
                      <div 
                        className="bg-pink-500 text-white text-xs flex items-center justify-center h-6 rounded-l transition-all duration-300 hover:opacity-90"
                        style={{ width: `${(row.female / 200) * 100}%` }}
                      >
                        {row.female > 0 && row.female}
                      </div>
                    </div>
                    {/* Center divider */}
                    <div className="w-px h-8 bg-gray-400"></div>
                    {/* Male bar (right) */}
                    <div className="flex-1 flex justify-start">
                      <div 
                        className="bg-blue-600 text-white text-xs flex items-center justify-center h-6 rounded-r transition-all duration-300 hover:opacity-90"
                        style={{ width: `${(row.male / 200) * 100}%` }}
                      >
                        {row.male > 0 && row.male}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <span className="text-pink-500">◄ Female</span>
            <span className="mx-4">|</span>
            <span className="text-blue-600">Male ►</span>
          </div>
        </div>

        {/* Staff Chart */}
        <div>
          <h4 className="text-md font-medium text-center mb-2 text-gray-700">
            Staff ({data.totals.staff} total)
          </h4>
          <div className="text-center text-sm mb-4">
            <span className="text-pink-500 font-semibold">
              ♀ {((staffFemaleTotal / data.totals.staff) * 100).toFixed(1)}% Female
            </span>
            <span className="mx-3">|</span>
            <span className="text-blue-600 font-semibold">
              ♂ {((staffMaleTotal / data.totals.staff) * 100).toFixed(1)}% Male
            </span>
          </div>
          
          <div className="space-y-2">
            {staffData.map((row, index) => (
              <div key={row.ageBand} className={`${index < staffData.length - 1 ? 'border-b border-gray-200' : ''} pb-2`}>
                <div className="flex items-center gap-2">
                  {/* Age label - fixed width for alignment */}
                  <div className="w-16 text-xs font-medium text-gray-700 text-right pr-2">
                    {row.ageBand}
                  </div>
                  {/* Bars container */}
                  <div className="flex-1 flex items-center gap-0">
                    {/* Female bar (left) */}
                    <div className="flex-1 flex justify-end">
                      <div 
                        className="bg-pink-500 text-white text-xs flex items-center justify-center h-6 rounded-l transition-all duration-300 hover:opacity-90"
                        style={{ width: `${(row.female / 250) * 100}%` }}
                      >
                        {row.female > 0 && row.female}
                      </div>
                    </div>
                    {/* Center divider */}
                    <div className="w-px h-8 bg-gray-400"></div>
                    {/* Male bar (right) */}
                    <div className="flex-1 flex justify-start">
                      <div 
                        className="bg-blue-600 text-white text-xs flex items-center justify-center h-6 rounded-r transition-all duration-300 hover:opacity-90"
                        style={{ width: `${(row.male / 250) * 100}%` }}
                      >
                        {row.male > 0 && row.male}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <span className="text-pink-500">◄ Female</span>
            <span className="mx-4">|</span>
            <span className="text-blue-600">Male ►</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-sm mb-2 text-gray-700">Key Insights:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="mb-1">• <strong>Faculty:</strong> Gender balance shifts with age</p>
            <p className="mb-1">• Younger cohorts (31-50) are predominantly female</p>
            <p className="mb-1">• 61+ age group is 62% male (111 of 178)</p>
          </div>
          <div>
            <p className="mb-1">• <strong>Staff:</strong> Consistently more female across all ages</p>
            <p className="mb-1">• Largest cohort is 51-60 years (343 employees)</p>
            <p className="mb-1">• Overall 63% female, 37% male distribution</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AgeGenderPyramid;