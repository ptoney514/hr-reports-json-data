import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Turnover data schema
export const turnoverSchema = {
  type: 'object',
  required: ['metadata', 'currentFiscalYear'],
  properties: {
    metadata: {
      type: 'object',
      required: ['fiscalYear', 'reportingPeriod', 'generatedDate', 'dataSource'],
      properties: {
        fiscalYear: { type: 'string' },
        reportingPeriod: { type: 'string' },
        generatedDate: { type: 'string', format: 'date-time' },
        dataSource: { type: 'string' },
        lastUpdated: { type: 'string', format: 'date-time' },
        organization: { type: 'string' },
        benchmarkSource: { type: 'string' }
      }
    },
    currentFiscalYear: {
      type: 'object',
      required: ['period', 'startDate', 'endDate', 'overallTurnover'],
      properties: {
        period: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        overallTurnover: {
          type: 'object',
          required: ['totalDepartures', 'averageHeadcount', 'annualizedTurnoverRate'],
          properties: {
            totalDepartures: { type: 'number', minimum: 0 },
            averageHeadcount: { type: 'number', minimum: 0 },
            annualizedTurnoverRate: { type: 'number', minimum: 0, maximum: 100 },
            changeFromPreviousYear: { type: 'number' },
            quarterlyProgression: {
              type: 'array',
              items: {
                type: 'object',
                required: ['quarter', 'rate'],
                properties: {
                  quarter: { type: 'string' },
                  rate: { type: 'number', minimum: 0, maximum: 100 }
                }
              }
            }
          }
        },
        turnoverByCategory: {
          type: 'array',
          items: {
            type: 'object',
            required: ['category', 'totalEmployees', 'departures', 'turnoverRate'],
            properties: {
              category: { type: 'string' },
              totalEmployees: { type: 'number', minimum: 0 },
              departures: { type: 'number', minimum: 0 },
              turnoverRate: { type: 'number', minimum: 0, maximum: 100 },
              voluntary: { type: 'number', minimum: 0 },
              involuntary: { type: 'number', minimum: 0 },
              voluntaryRate: { type: 'number', minimum: 0, maximum: 100 },
              involuntaryRate: { type: 'number', minimum: 0, maximum: 100 },
              changeFromPreviousYear: { type: 'number' }
            }
          }
        },
        voluntaryTurnoverReasons: {
          type: 'array',
          items: {
            type: 'object',
            required: ['reason', 'count', 'percentage'],
            properties: {
              reason: { type: 'string' },
              count: { type: 'number', minimum: 0 },
              percentage: { type: 'number', minimum: 0, maximum: 100 },
              facultyCount: { type: 'number', minimum: 0 },
              staffCount: { type: 'number', minimum: 0 },
              studentCount: { type: 'number', minimum: 0 }
            }
          }
        },
        departuresByTenure: {
          type: 'array',
          items: {
            type: 'object',
            required: ['tenureRange', 'departures', 'totalInRange', 'turnoverRate'],
            properties: {
              tenureRange: { type: 'string' },
              departures: { type: 'number', minimum: 0 },
              totalInRange: { type: 'number', minimum: 0 },
              turnoverRate: { type: 'number', minimum: 0, maximum: 100 },
              percentOfDepartures: { type: 'number', minimum: 0, maximum: 100 },
              voluntary: { type: 'number', minimum: 0 },
              involuntary: { type: 'number', minimum: 0 }
            }
          }
        },
        departuresByGrade: {
          type: 'array',
          items: {
            type: 'object',
            required: ['grade', 'departures', 'totalInGrade', 'turnoverRate'],
            properties: {
              grade: { type: 'string' },
              departures: { type: 'number', minimum: 0 },
              totalInGrade: { type: 'number', minimum: 0 },
              turnoverRate: { type: 'number', minimum: 0, maximum: 100 },
              voluntary: { type: 'number', minimum: 0 },
              involuntary: { type: 'number', minimum: 0 },
              averageTenure: { type: 'string' },
              topReasons: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      }
    },
    benchmarkComparison: {
      type: 'object',
      properties: {
        higherEducationBenchmarks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              benchmarkRate: { type: 'number', minimum: 0, maximum: 100 },
              organizationRate: { type: 'number', minimum: 0, maximum: 100 },
              variance: { type: 'number' },
              performance: { type: 'string', enum: ['Above', 'Below', 'At'] }
            }
          }
        }
      }
    }
  }
};

// Compile the schema
export const validateTurnoverData = ajv.compile(turnoverSchema);

export default {
  schema: turnoverSchema,
  validate: validateTurnoverData
}; 