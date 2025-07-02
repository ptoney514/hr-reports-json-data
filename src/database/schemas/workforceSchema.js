import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Workforce data schema
export const workforceSchema = {
  type: 'object',
  required: ['metadata', 'currentPeriod'],
  properties: {
    metadata: {
      type: 'object',
      required: ['reportingPeriod', 'generatedDate', 'dataSource'],
      properties: {
        reportingPeriod: { type: 'string' },
        generatedDate: { type: 'string', format: 'date-time' },
        dataSource: { type: 'string' },
        lastUpdated: { type: 'string', format: 'date-time' },
        currency: { type: 'string' },
        organization: { type: 'string' }
      }
    },
    currentPeriod: {
      type: 'object',
      required: ['quarter', 'startDate', 'endDate', 'headcount', 'positions'],
      properties: {
        quarter: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        headcount: {
          type: 'object',
          required: ['total', 'faculty', 'staff'],
          properties: {
            total: { type: 'number', minimum: 0 },
            faculty: { type: 'number', minimum: 0 },
            staff: { type: 'number', minimum: 0 },
            students: { type: 'number', minimum: 0 },
            changeFromPrevious: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                faculty: { type: 'number' },
                staff: { type: 'number' },
                students: { type: 'number' },
                percentChange: { type: 'number' }
              }
            }
          }
        },
        positions: {
          type: 'object',
          required: ['total', 'filled', 'vacant', 'vacancyRate'],
          properties: {
            total: { type: 'number', minimum: 0 },
            filled: { type: 'number', minimum: 0 },
            vacant: { type: 'number', minimum: 0 },
            vacancyRate: { type: 'number', minimum: 0, maximum: 100 }
          }
        },
        locations: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'total', 'breakdown'],
            properties: {
              name: { type: 'string' },
              total: { type: 'number', minimum: 0 },
              breakdown: {
                type: 'object',
                properties: {
                  faculty: { type: 'number', minimum: 0 },
                  staff: { type: 'number', minimum: 0 },
                  students: { type: 'number', minimum: 0 }
                }
              },
              percentOfTotal: { type: 'number', minimum: 0, maximum: 100 },
              changeFromPrevious: { type: 'number' }
            }
          }
        },
        topDivisions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'headcount'],
            properties: {
              name: { type: 'string' },
              headcount: { type: 'number', minimum: 0 },
              faculty: { type: 'number', minimum: 0 },
              staff: { type: 'number', minimum: 0 },
              vacancies: { type: 'number', minimum: 0 },
              vacancyRate: { type: 'number', minimum: 0, maximum: 100 },
              changeFromPrevious: { type: 'number' }
            }
          }
        }
      }
    },
    historicalTrends: {
      type: 'array',
      items: {
        type: 'object',
        required: ['quarter', 'startDate', 'endDate', 'headcount'],
        properties: {
          quarter: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          headcount: {
            type: 'object',
            properties: {
              total: { type: 'number', minimum: 0 },
              faculty: { type: 'number', minimum: 0 },
              staff: { type: 'number', minimum: 0 },
              students: { type: 'number', minimum: 0 }
            }
          }
        }
      }
    }
  }
};

// Compile the schema
export const validateWorkforceData = ajv.compile(workforceSchema);

export default {
  schema: workforceSchema,
  validate: validateWorkforceData
}; 