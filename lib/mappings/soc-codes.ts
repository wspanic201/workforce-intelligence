/**
 * SOC Code Mappings for Common Occupations
 * 
 * This mapping ensures we use the correct SOC codes for BLS data lookups.
 * Prevents issues like mapping "Pharmacy Technician" to wrong code.
 * 
 * Source: Bureau of Labor Statistics 2018 SOC Structure
 * Last updated: 2026-02-16
 */

export interface SOCMapping {
  code: string;
  title: string;
  keywords: string[];
  onetCode?: string; // O*NET uses XX-XXXX.XX format
}

export const SOC_CODE_MAPPINGS: SOCMapping[] = [
  // Healthcare
  {
    code: '29-2052',
    title: 'Pharmacy Technicians',
    keywords: ['pharmacy technician', 'pharmacy tech', 'pharm tech', 'pharmacist assistant'],
    onetCode: '29-2052.00',
  },
  {
    code: '31-9092',
    title: 'Medical Assistants',
    keywords: ['medical assistant', 'clinical assistant', 'healthcare assistant'],
    onetCode: '31-9092.00',
  },
  {
    code: '31-9095',
    title: 'Pharmacy Aides',
    keywords: ['pharmacy aide', 'pharmacy clerk'],
    onetCode: '31-9095.00',
  },
  {
    code: '29-1141',
    title: 'Registered Nurses',
    keywords: ['registered nurse', 'rn', 'staff nurse'],
    onetCode: '29-1141.00',
  },
  {
    code: '29-2061',
    title: 'Licensed Practical and Licensed Vocational Nurses',
    keywords: ['lpn', 'lvn', 'practical nurse', 'vocational nurse'],
    onetCode: '29-2061.00',
  },
  {
    code: '31-1120',
    title: 'Home Health and Personal Care Aides',
    keywords: ['home health aide', 'personal care aide', 'caregiver'],
    onetCode: '31-1120.00',
  },
  {
    code: '31-9091',
    title: 'Dental Assistants',
    keywords: ['dental assistant'],
    onetCode: '31-9091.00',
  },
  {
    code: '29-1292',
    title: 'Dental Hygienists',
    keywords: ['dental hygienist'],
    onetCode: '29-1292.00',
  },
  
  // Information Technology
  {
    code: '15-1252',
    title: 'Software Developers',
    keywords: ['software developer', 'software engineer', 'programmer'],
    onetCode: '15-1252.00',
  },
  {
    code: '15-1244',
    title: 'Network and Computer Systems Administrators',
    keywords: ['system administrator', 'network administrator', 'sysadmin'],
    onetCode: '15-1244.00',
  },
  {
    code: '15-1211',
    title: 'Computer Systems Analysts',
    keywords: ['systems analyst', 'business analyst'],
    onetCode: '15-1211.00',
  },
  {
    code: '15-1254',
    title: 'Web Developers',
    keywords: ['web developer', 'front-end developer', 'back-end developer'],
    onetCode: '15-1254.00',
  },
  {
    code: '15-1212',
    title: 'Information Security Analysts',
    keywords: ['cybersecurity analyst', 'security analyst', 'infosec'],
    onetCode: '15-1212.00',
  },
  
  // Skilled Trades
  {
    code: '47-2111',
    title: 'Electricians',
    keywords: ['electrician', 'electrical technician'],
    onetCode: '47-2111.00',
  },
  {
    code: '49-9021',
    title: 'Heating, Air Conditioning, and Refrigeration Mechanics and Installers',
    keywords: ['hvac technician', 'hvac mechanic', 'hvac installer'],
    onetCode: '49-9021.00',
  },
  {
    code: '47-2152',
    title: 'Plumbers, Pipefitters, and Steamfitters',
    keywords: ['plumber', 'pipefitter'],
    onetCode: '47-2152.00',
  },
  {
    code: '49-3023',
    title: 'Automotive Service Technicians and Mechanics',
    keywords: ['auto mechanic', 'automotive technician', 'car mechanic'],
    onetCode: '49-3023.00',
  },
  {
    code: '47-2031',
    title: 'Carpenters',
    keywords: ['carpenter', 'framing carpenter', 'finish carpenter'],
    onetCode: '47-2031.00',
  },
  {
    code: '49-9041',
    title: 'Industrial Machinery Mechanics',
    keywords: ['industrial mechanic', 'machinery mechanic', 'maintenance mechanic'],
    onetCode: '49-9041.00',
  },
  {
    code: '51-4121',
    title: 'Welders, Cutters, Solderers, and Brazers',
    keywords: ['welder', 'welding technician'],
    onetCode: '51-4121.00',
  },
  
  // Business & Finance
  {
    code: '13-2011',
    title: 'Accountants and Auditors',
    keywords: ['accountant', 'auditor', 'cpa'],
    onetCode: '13-2011.00',
  },
  {
    code: '11-9111',
    title: 'Medical and Health Services Managers',
    keywords: ['healthcare manager', 'medical office manager', 'health services manager'],
    onetCode: '11-9111.00',
  },
  {
    code: '13-1071',
    title: 'Human Resources Specialists',
    keywords: ['hr specialist', 'human resources', 'recruiter'],
    onetCode: '13-1071.00',
  },
  {
    code: '41-3099',
    title: 'Sales Representatives, Services, All Other',
    keywords: ['sales representative', 'account executive'],
    onetCode: '41-3099.00',
  },
  
  // Education & Training
  {
    code: '25-3031',
    title: 'Substitute Teachers, Short-Term',
    keywords: ['substitute teacher', 'sub teacher'],
    onetCode: '25-3031.00',
  },
  {
    code: '25-9045',
    title: 'Teaching Assistants, Postsecondary',
    keywords: ['teaching assistant', 'graduate assistant'],
    onetCode: '25-9045.00',
  },
  
  // Other Common Occupations
  {
    code: '39-9011',
    title: 'Childcare Workers',
    keywords: ['childcare worker', 'daycare worker'],
    onetCode: '39-9011.00',
  },
  {
    code: '39-5012',
    title: 'Hairdressers, Hairstylists, and Cosmetologists',
    keywords: ['hairstylist', 'cosmetologist', 'barber'],
    onetCode: '39-5012.00',
  },
  {
    code: '23-2011',
    title: 'Paralegals and Legal Assistants',
    keywords: ['paralegal', 'legal assistant'],
    onetCode: '23-2011.00',
  },
  {
    code: '53-7065',
    title: 'Stockers and Order Fillers',
    keywords: ['stocker', 'order filler', 'warehouse worker'],
    onetCode: '53-7065.00',
  },
  {
    code: '35-3023',
    title: 'Fast Food and Counter Workers',
    keywords: ['fast food worker', 'counter worker'],
    onetCode: '35-3023.00',
  },
];

/**
 * Find SOC code for an occupation by matching keywords
 */
export function findSOCCode(occupationName: string): SOCMapping | null {
  const normalized = occupationName.toLowerCase().trim();
  
  // Try exact title match first
  const exactMatch = SOC_CODE_MAPPINGS.find(
    mapping => mapping.title.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;
  
  // Try keyword matching
  for (const mapping of SOC_CODE_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        return mapping;
      }
    }
  }
  
  return null;
}

/**
 * Validate a SOC code format (XX-XXXX)
 */
export function isValidSOCCode(code: string): boolean {
  return /^\d{2}-\d{4}$/.test(code);
}

/**
 * Convert O*NET code (XX-XXXX.XX) to SOC code (XX-XXXX)
 */
export function onetToSOC(onetCode: string): string {
  return onetCode.split('.')[0];
}

/**
 * Get SOC title from code
 */
export function getSOCTitle(code: string): string | null {
  const mapping = SOC_CODE_MAPPINGS.find(m => m.code === code);
  return mapping?.title || null;
}
