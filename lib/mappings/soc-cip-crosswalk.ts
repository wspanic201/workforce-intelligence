/**
 * SOC-to-CIP Crosswalk Lookup Module
 *
 * Bidirectional mapping between Standard Occupational Classification (SOC)
 * codes and Classification of Instructional Programs (CIP) codes.
 *
 * Source: National Center for Education Statistics (NCES)
 * "2018 CIP to 2018 SOC Crosswalk"
 * https://nces.ed.gov/ipeds/cipcode/post3702.aspx
 *
 * This file embeds the ~250 most relevant mappings for community college
 * programs across healthcare, IT, manufacturing, trades, business,
 * education, criminal justice, transportation, cosmetology, and culinary.
 *
 * Last updated: 2026-02-19
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CipMapping {
  cipCode: string;
  cipTitle: string;
}

export interface SocMapping {
  socCode: string;
  socTitle: string;
}

interface CrosswalkEntry {
  cipCode: string;
  cipTitle: string;
  socCode: string;
  socTitle: string;
}

// ---------------------------------------------------------------------------
// Data — static crosswalk entries
// ---------------------------------------------------------------------------

const CROSSWALK_DATA: readonly CrosswalkEntry[] = [
  // =======================================================================
  // HEALTHCARE
  // =======================================================================
  // Registered Nursing
  { cipCode: '51.3801', cipTitle: 'Registered Nursing/Registered Nurse', socCode: '29-1141', socTitle: 'Registered Nurses' },
  // Licensed Practical/Vocational Nursing
  { cipCode: '51.3901', cipTitle: 'Licensed Practical/Vocational Nurse Training', socCode: '29-2061', socTitle: 'Licensed Practical and Licensed Vocational Nurses' },
  // Pharmacy Technician
  { cipCode: '51.0805', cipTitle: 'Pharmacy Technician/Assistant', socCode: '29-2052', socTitle: 'Pharmacy Technicians' },
  { cipCode: '51.0805', cipTitle: 'Pharmacy Technician/Assistant', socCode: '31-9095', socTitle: 'Pharmacy Aides' },
  // Medical Assistant
  { cipCode: '51.0801', cipTitle: 'Medical/Clinical Assistant', socCode: '31-9092', socTitle: 'Medical Assistants' },
  // Dental Assisting
  { cipCode: '51.0601', cipTitle: 'Dental Assisting/Assistant', socCode: '31-9091', socTitle: 'Dental Assistants' },
  // Dental Hygiene
  { cipCode: '51.0602', cipTitle: 'Dental Hygiene/Hygienist', socCode: '29-1292', socTitle: 'Dental Hygienists' },
  // Medical Coding / Health Information
  { cipCode: '51.0707', cipTitle: 'Health Information/Medical Records Technology/Technician', socCode: '29-2072', socTitle: 'Medical Records Specialists' },
  // Surgical Technology
  { cipCode: '51.0909', cipTitle: 'Surgical Technology/Technologist', socCode: '29-2055', socTitle: 'Surgical Technologists' },
  // Respiratory Therapy
  { cipCode: '51.0908', cipTitle: 'Respiratory Care Therapy/Therapist', socCode: '29-1126', socTitle: 'Respiratory Therapists' },
  // Radiologic Technology
  { cipCode: '51.0911', cipTitle: 'Radiologic Technology/Science - Radiographer', socCode: '29-2034', socTitle: 'Radiologic Technologists and Technicians' },
  // Emergency Medical Technology
  { cipCode: '51.0904', cipTitle: 'Emergency Medical Technology/Technician (EMT Paramedic)', socCode: '29-2041', socTitle: 'Emergency Medical Technicians and Paramedics' },
  // Physical Therapy Assistant
  { cipCode: '51.0806', cipTitle: 'Physical Therapy Technician/Assistant', socCode: '31-2021', socTitle: 'Physical Therapist Assistants' },
  // Occupational Therapy Assistant
  { cipCode: '51.0803', cipTitle: 'Occupational Therapist Assistant', socCode: '31-2012', socTitle: 'Occupational Therapy Assistants' },
  // Medical Lab Technician
  { cipCode: '51.1004', cipTitle: 'Clinical/Medical Laboratory Technician', socCode: '29-2012', socTitle: 'Medical and Clinical Laboratory Technicians' },
  // Home Health Aide / Nursing Assistant
  { cipCode: '51.3902', cipTitle: 'Nursing Assistant/Aide and Patient Care Assistant/Aide', socCode: '31-1120', socTitle: 'Home Health and Personal Care Aides' },
  { cipCode: '51.3902', cipTitle: 'Nursing Assistant/Aide and Patient Care Assistant/Aide', socCode: '31-1131', socTitle: 'Nursing Assistants' },
  // Phlebotomy
  { cipCode: '51.1009', cipTitle: 'Phlebotomy Technician/Phlebotomist', socCode: '31-9097', socTitle: 'Phlebotomists' },
  // Diagnostic Medical Sonography
  { cipCode: '51.0910', cipTitle: 'Diagnostic Medical Sonography/Sonographer and Ultrasound Technician', socCode: '29-2032', socTitle: 'Diagnostic Medical Sonographers' },
  // Health Services Management
  { cipCode: '51.0701', cipTitle: 'Health/Health Care Administration/Management', socCode: '11-9111', socTitle: 'Medical and Health Services Managers' },
  // Massage Therapy
  { cipCode: '51.3501', cipTitle: 'Massage Therapy/Therapeutic Massage', socCode: '31-9011', socTitle: 'Massage Therapists' },
  // Veterinary Technology
  { cipCode: '51.0808', cipTitle: 'Veterinary/Animal Health Technology/Technician and Veterinary Assistant', socCode: '29-2056', socTitle: 'Veterinary Technologists and Technicians' },
  // Substance Abuse Counseling
  { cipCode: '51.1501', cipTitle: 'Substance Abuse/Addiction Counseling', socCode: '21-1011', socTitle: 'Substance Abuse and Behavioral Disorder Counselors' },
  // Community Health Worker
  { cipCode: '51.2208', cipTitle: 'Community Health and Preventive Medicine', socCode: '21-1094', socTitle: 'Community Health Workers' },
  // Mental Health Counseling (Associate level)
  { cipCode: '51.1508', cipTitle: 'Mental Health Counseling/Counselor', socCode: '21-1014', socTitle: 'Mental Health Counselors' },
  // Dietetic Technician
  { cipCode: '51.3103', cipTitle: 'Dietetic Technician', socCode: '29-2051', socTitle: 'Dietetic Technicians' },
  // Optician
  { cipCode: '51.1801', cipTitle: 'Opticianry/Ophthalmic Dispensing Optician', socCode: '29-2081', socTitle: 'Opticians, Dispensing' },

  // =======================================================================
  // INFORMATION TECHNOLOGY
  // =======================================================================
  // Computer Science
  { cipCode: '11.0101', cipTitle: 'Computer and Information Sciences, General', socCode: '15-1252', socTitle: 'Software Developers' },
  { cipCode: '11.0101', cipTitle: 'Computer and Information Sciences, General', socCode: '15-1211', socTitle: 'Computer Systems Analysts' },
  // Computer Programming
  { cipCode: '11.0201', cipTitle: 'Computer Programming/Programmer, General', socCode: '15-1251', socTitle: 'Computer Programmers' },
  { cipCode: '11.0201', cipTitle: 'Computer Programming/Programmer, General', socCode: '15-1252', socTitle: 'Software Developers' },
  // Data Processing
  { cipCode: '11.0301', cipTitle: 'Data Processing and Data Processing Technology/Technician', socCode: '15-1299', socTitle: 'Computer Occupations, All Other' },
  // Information Science
  { cipCode: '11.0401', cipTitle: 'Information Science/Studies', socCode: '15-1211', socTitle: 'Computer Systems Analysts' },
  { cipCode: '11.0401', cipTitle: 'Information Science/Studies', socCode: '15-1244', socTitle: 'Network and Computer Systems Administrators' },
  // Computer Systems Analysis
  { cipCode: '11.0501', cipTitle: 'Computer Systems Analysis/Analyst', socCode: '15-1211', socTitle: 'Computer Systems Analysts' },
  // Data Entry
  { cipCode: '11.0601', cipTitle: 'Data Entry/Microcomputer Applications, General', socCode: '43-9021', socTitle: 'Data Entry Keyers' },
  // Computer Networking
  { cipCode: '11.0901', cipTitle: 'Computer Systems Networking and Telecommunications', socCode: '15-1244', socTitle: 'Network and Computer Systems Administrators' },
  { cipCode: '11.0901', cipTitle: 'Computer Systems Networking and Telecommunications', socCode: '15-1241', socTitle: 'Computer Network Architects' },
  // Web Development
  { cipCode: '11.0801', cipTitle: 'Web Page, Digital/Multimedia and Information Resources Design', socCode: '15-1254', socTitle: 'Web Developers' },
  { cipCode: '11.0801', cipTitle: 'Web Page, Digital/Multimedia and Information Resources Design', socCode: '15-1255', socTitle: 'Web and Digital Interface Designers' },
  // Database Administration
  { cipCode: '11.0802', cipTitle: 'Data Modeling/Warehousing and Database Administration', socCode: '15-1242', socTitle: 'Database Administrators' },
  // Cybersecurity
  { cipCode: '11.1003', cipTitle: 'Computer and Information Systems Security/Auditing/Information Assurance', socCode: '15-1212', socTitle: 'Information Security Analysts' },
  // Computer Support
  { cipCode: '11.1006', cipTitle: 'Computer Support Specialist', socCode: '15-1231', socTitle: 'Computer Network Support Specialists' },
  { cipCode: '11.1006', cipTitle: 'Computer Support Specialist', socCode: '15-1232', socTitle: 'Computer User Support Specialists' },
  // IT Project Management
  { cipCode: '11.1005', cipTitle: 'Information Technology Project Management', socCode: '15-1299', socTitle: 'Computer Occupations, All Other' },
  // Data Analytics
  { cipCode: '11.0802', cipTitle: 'Data Modeling/Warehousing and Database Administration', socCode: '15-2051', socTitle: 'Data Scientists' },
  // Cloud Computing
  { cipCode: '11.0901', cipTitle: 'Computer Systems Networking and Telecommunications', socCode: '15-1299', socTitle: 'Computer Occupations, All Other' },

  // =======================================================================
  // MANUFACTURING & INDUSTRIAL
  // =======================================================================
  // Welding
  { cipCode: '48.0508', cipTitle: 'Welding Technology/Welder', socCode: '51-4121', socTitle: 'Welders, Cutters, Solderers, and Brazers' },
  // CNC / Machine Tool
  { cipCode: '48.0501', cipTitle: 'Machine Tool Technology/Machinist', socCode: '51-4041', socTitle: 'Machinists' },
  { cipCode: '48.0501', cipTitle: 'Machine Tool Technology/Machinist', socCode: '51-4011', socTitle: 'Computer Numerically Controlled Tool Operators' },
  // Industrial Mechanics
  { cipCode: '47.0303', cipTitle: 'Industrial Mechanics and Maintenance Technology', socCode: '49-9041', socTitle: 'Industrial Machinery Mechanics' },
  // Quality Control
  { cipCode: '15.0702', cipTitle: 'Quality Control Technology/Technician', socCode: '51-9061', socTitle: 'Inspectors, Testers, Sorters, Samplers, and Weighers' },
  // Industrial Technology
  { cipCode: '15.0612', cipTitle: 'Industrial Technology/Technician', socCode: '17-3026', socTitle: 'Industrial Engineering Technologists and Technicians' },
  // Mechatronics / Robotics
  { cipCode: '15.0405', cipTitle: 'Robotics Technology/Technician', socCode: '17-3024', socTitle: 'Electro-Mechanical and Mechatronics Technologists and Technicians' },
  // Drafting / CAD
  { cipCode: '15.1301', cipTitle: 'Drafting and Design Technology/Technician, General', socCode: '17-3011', socTitle: 'Architectural and Civil Drafters' },
  { cipCode: '15.1301', cipTitle: 'Drafting and Design Technology/Technician, General', socCode: '17-3013', socTitle: 'Mechanical Drafters' },
  // Electronics Technology
  { cipCode: '15.0303', cipTitle: 'Electrical, Electronic, and Communications Engineering Technology/Technician', socCode: '17-3023', socTitle: 'Electrical and Electronic Engineering Technologists and Technicians' },
  // Manufacturing Engineering Tech
  { cipCode: '15.0613', cipTitle: 'Manufacturing Engineering Technology/Technician', socCode: '17-3026', socTitle: 'Industrial Engineering Technologists and Technicians' },
  // Precision Metal Working
  { cipCode: '48.0503', cipTitle: 'Machine Shop Technology/Assistant', socCode: '51-4041', socTitle: 'Machinists' },
  // Sheet Metal
  { cipCode: '48.0506', cipTitle: 'Sheet Metal Technology/Sheetworking', socCode: '47-2211', socTitle: 'Sheet Metal Workers' },
  // Plastics/Composites
  { cipCode: '15.0607', cipTitle: 'Plastics and Polymer Engineering Technology/Technician', socCode: '51-9199', socTitle: 'Production Workers, All Other' },
  // Tool and Die
  { cipCode: '48.0507', cipTitle: 'Tool and Die Technology/Technician', socCode: '51-4111', socTitle: 'Tool and Die Makers' },

  // =======================================================================
  // SKILLED TRADES
  // =======================================================================
  // Electrician
  { cipCode: '46.0302', cipTitle: 'Electrician', socCode: '47-2111', socTitle: 'Electricians' },
  // HVAC
  { cipCode: '47.0201', cipTitle: 'Heating, Air Conditioning, Ventilation and Refrigeration Maintenance Technology/Technician', socCode: '49-9021', socTitle: 'Heating, Air Conditioning, and Refrigeration Mechanics and Installers' },
  // Plumbing
  { cipCode: '46.0503', cipTitle: 'Plumbing Technology/Plumber', socCode: '47-2152', socTitle: 'Plumbers, Pipefitters, and Steamfitters' },
  // Automotive
  { cipCode: '47.0604', cipTitle: 'Automobile/Automotive Mechanics Technology/Technician', socCode: '49-3023', socTitle: 'Automotive Service Technicians and Mechanics' },
  // Diesel Mechanics
  { cipCode: '47.0605', cipTitle: 'Diesel Mechanics Technology/Technician', socCode: '49-3031', socTitle: 'Bus and Truck Mechanics and Diesel Engine Specialists' },
  // Collision Repair
  { cipCode: '47.0603', cipTitle: 'Autobody/Collision and Repair Technology/Technician', socCode: '49-3021', socTitle: 'Automotive Body and Related Repairers' },
  // Carpentry
  { cipCode: '46.0201', cipTitle: 'Carpentry/Carpenter', socCode: '47-2031', socTitle: 'Carpenters' },
  // Construction Management
  { cipCode: '46.0412', cipTitle: 'Building/Construction Site Management/Manager', socCode: '11-9021', socTitle: 'Construction Managers' },
  // Masonry
  { cipCode: '46.0101', cipTitle: 'Mason/Masonry', socCode: '47-2021', socTitle: 'Brickmasons and Blockmasons' },
  // Painting
  { cipCode: '46.0408', cipTitle: 'Painting/Painter and Wall Coverer', socCode: '47-2141', socTitle: 'Painters, Construction and Maintenance' },
  // Heavy Equipment
  { cipCode: '49.0202', cipTitle: 'Construction/Heavy Equipment/Earthmoving Equipment Operation', socCode: '47-2073', socTitle: 'Operating Engineers and Other Construction Equipment Operators' },
  // Small Engine Repair
  { cipCode: '47.0606', cipTitle: 'Small Engine Mechanics and Repair Technology/Technician', socCode: '49-3053', socTitle: 'Outdoor Power Equipment and Other Small Engine Mechanics' },
  // Lineworker
  { cipCode: '46.0303', cipTitle: 'Lineworker', socCode: '49-9051', socTitle: 'Electrical Power-Line Installers and Repairers' },

  // =======================================================================
  // BUSINESS & ACCOUNTING
  // =======================================================================
  // Accounting
  { cipCode: '52.0301', cipTitle: 'Accounting', socCode: '13-2011', socTitle: 'Accountants and Auditors' },
  { cipCode: '52.0302', cipTitle: 'Accounting Technology/Technician and Bookkeeping', socCode: '43-3031', socTitle: 'Bookkeeping, Accounting, and Auditing Clerks' },
  // Business Administration
  { cipCode: '52.0201', cipTitle: 'Business Administration and Management, General', socCode: '11-1021', socTitle: 'General and Operations Managers' },
  { cipCode: '52.0201', cipTitle: 'Business Administration and Management, General', socCode: '13-1199', socTitle: 'Business Operations Specialists, All Other' },
  // Marketing
  { cipCode: '52.1401', cipTitle: 'Marketing/Marketing Management, General', socCode: '13-1161', socTitle: 'Market Research Analysts and Marketing Specialists' },
  { cipCode: '52.1401', cipTitle: 'Marketing/Marketing Management, General', socCode: '41-3099', socTitle: 'Sales Representatives, Services, All Other' },
  // Human Resources
  { cipCode: '52.1001', cipTitle: 'Human Resources Management/Personnel Administration, General', socCode: '13-1071', socTitle: 'Human Resources Specialists' },
  { cipCode: '52.1001', cipTitle: 'Human Resources Management/Personnel Administration, General', socCode: '11-3121', socTitle: 'Human Resources Managers' },
  // Office Administration
  { cipCode: '52.0401', cipTitle: 'Administrative Assistant and Secretarial Science, General', socCode: '43-6014', socTitle: 'Secretaries and Administrative Assistants, Except Legal, Medical, and Executive' },
  { cipCode: '52.0401', cipTitle: 'Administrative Assistant and Secretarial Science, General', socCode: '43-6011', socTitle: 'Executive Secretaries and Executive Administrative Assistants' },
  // Medical Office Administration
  { cipCode: '51.0710', cipTitle: 'Medical Office Management/Administration', socCode: '43-6013', socTitle: 'Medical Secretaries and Administrative Assistants' },
  // Legal Office Administration
  { cipCode: '22.0302', cipTitle: 'Legal Assistant/Paralegal', socCode: '23-2011', socTitle: 'Paralegals and Legal Assistants' },
  // Entrepreneurship
  { cipCode: '52.0701', cipTitle: 'Entrepreneurship/Entrepreneurial Studies', socCode: '11-1021', socTitle: 'General and Operations Managers' },
  // Supply Chain / Logistics
  { cipCode: '52.0203', cipTitle: 'Logistics, Materials, and Supply Chain Management', socCode: '13-1081', socTitle: 'Logisticians' },
  { cipCode: '52.0203', cipTitle: 'Logistics, Materials, and Supply Chain Management', socCode: '11-3071', socTitle: 'Transportation, Storage, and Distribution Managers' },
  // Real Estate
  { cipCode: '52.1501', cipTitle: 'Real Estate', socCode: '41-9022', socTitle: 'Real Estate Sales Agents' },
  // Finance
  { cipCode: '52.0801', cipTitle: 'Finance, General', socCode: '13-2051', socTitle: 'Financial Analysts' },
  { cipCode: '52.0801', cipTitle: 'Finance, General', socCode: '13-2072', socTitle: 'Loan Officers' },
  // Insurance
  { cipCode: '52.1701', cipTitle: 'Insurance', socCode: '13-2053', socTitle: 'Insurance Underwriters' },
  // Banking
  { cipCode: '52.0803', cipTitle: 'Banking and Financial Support Services', socCode: '43-3071', socTitle: 'Tellers' },

  // =======================================================================
  // EDUCATION & CHILD DEVELOPMENT
  // =======================================================================
  // Early Childhood Education
  { cipCode: '13.1210', cipTitle: 'Early Childhood Education and Teaching', socCode: '25-2011', socTitle: 'Preschool Teachers, Except Special Education' },
  { cipCode: '13.1210', cipTitle: 'Early Childhood Education and Teaching', socCode: '39-9011', socTitle: 'Childcare Workers' },
  // Teacher Education
  { cipCode: '13.1202', cipTitle: 'Elementary Education and Teaching', socCode: '25-2021', socTitle: 'Elementary School Teachers, Except Special Education' },
  // Teacher Assistant
  { cipCode: '13.1501', cipTitle: 'Teacher Assistant/Aide', socCode: '25-9042', socTitle: 'Teaching Assistants, Preschool, Elementary, Middle, and Secondary School, Except Special Education' },
  // Special Education
  { cipCode: '13.1001', cipTitle: 'Special Education and Teaching, General', socCode: '25-2058', socTitle: 'Special Education Teachers, All Other' },
  // Library Technician
  { cipCode: '25.0301', cipTitle: 'Library and Archives Assisting', socCode: '25-4031', socTitle: 'Library Technicians' },

  // =======================================================================
  // CRIMINAL JUSTICE & PUBLIC SAFETY
  // =======================================================================
  // Criminal Justice
  { cipCode: '43.0104', cipTitle: 'Criminal Justice/Safety Studies', socCode: '33-3051', socTitle: 'Police and Sheriff\'s Patrol Officers' },
  { cipCode: '43.0104', cipTitle: 'Criminal Justice/Safety Studies', socCode: '33-3012', socTitle: 'Correctional Officers and Jailers' },
  { cipCode: '43.0104', cipTitle: 'Criminal Justice/Safety Studies', socCode: '33-9032', socTitle: 'Security Guards' },
  // Law Enforcement
  { cipCode: '43.0107', cipTitle: 'Criminal Justice/Police Science', socCode: '33-3051', socTitle: 'Police and Sheriff\'s Patrol Officers' },
  // Corrections
  { cipCode: '43.0102', cipTitle: 'Corrections', socCode: '33-3012', socTitle: 'Correctional Officers and Jailers' },
  { cipCode: '43.0102', cipTitle: 'Corrections', socCode: '21-1092', socTitle: 'Probation Officers and Correctional Treatment Specialists' },
  // Fire Science
  { cipCode: '43.0203', cipTitle: 'Fire Science/Fire-fighting', socCode: '33-2011', socTitle: 'Firefighters' },
  { cipCode: '43.0203', cipTitle: 'Fire Science/Fire-fighting', socCode: '33-1021', socTitle: 'First-Line Supervisors of Firefighting and Prevention Workers' },
  // Forensic Science
  { cipCode: '43.0106', cipTitle: 'Forensic Science and Technology', socCode: '19-4092', socTitle: 'Forensic Science Technicians' },
  // Homeland Security
  { cipCode: '43.0301', cipTitle: 'Homeland Security', socCode: '33-9032', socTitle: 'Security Guards' },
  // Emergency Management
  { cipCode: '43.0302', cipTitle: 'Crisis/Emergency/Disaster Management', socCode: '13-1061', socTitle: 'Emergency Management Directors' },

  // =======================================================================
  // TRANSPORTATION & LOGISTICS
  // =======================================================================
  // CDL / Truck Driving
  { cipCode: '49.0205', cipTitle: 'Truck and Bus Driver/Commercial Vehicle Operator and Instructor', socCode: '53-3032', socTitle: 'Heavy and Tractor-Trailer Truck Drivers' },
  { cipCode: '49.0205', cipTitle: 'Truck and Bus Driver/Commercial Vehicle Operator and Instructor', socCode: '53-3052', socTitle: 'Bus Drivers, Transit and Intercity' },
  // Aviation
  { cipCode: '49.0101', cipTitle: 'Aeronautics/Aviation/Aerospace Science and Technology, General', socCode: '53-2012', socTitle: 'Commercial Pilots' },
  // Aviation Maintenance
  { cipCode: '47.0607', cipTitle: 'Airframe Mechanics and Aircraft Maintenance Technology/Technician', socCode: '49-3011', socTitle: 'Aircraft Mechanics and Service Technicians' },
  // Automotive Parts
  { cipCode: '47.0616', cipTitle: 'Automobile/Automotive Mechanics Technology/Technician', socCode: '41-2022', socTitle: 'Parts Salespersons' },
  // Marine Technology
  { cipCode: '49.0306', cipTitle: 'Marine Maintenance/Fitter and Ship Repair Technology/Technician', socCode: '49-3051', socTitle: 'Motorboat Mechanics and Service Technicians' },

  // =======================================================================
  // COSMETOLOGY & PERSONAL SERVICES
  // =======================================================================
  // Cosmetology
  { cipCode: '12.0401', cipTitle: 'Cosmetology/Cosmetologist, General', socCode: '39-5012', socTitle: 'Hairdressers, Hairstylists, and Cosmetologists' },
  // Barbering
  { cipCode: '12.0402', cipTitle: 'Barbering/Barber', socCode: '39-5011', socTitle: 'Barbers' },
  // Nail Technician
  { cipCode: '12.0410', cipTitle: 'Nail Technician/Specialist and Manicurist', socCode: '39-5092', socTitle: 'Manicurists and Pedicurists' },
  // Esthetician
  { cipCode: '12.0409', cipTitle: 'Aesthetician/Esthetician and Skin Care Specialist', socCode: '39-5094', socTitle: 'Skincare Specialists' },
  // Funeral Service
  { cipCode: '12.0301', cipTitle: 'Funeral Service and Mortuary Science, General', socCode: '39-4031', socTitle: 'Morticians, Undertakers, and Funeral Arrangers' },

  // =======================================================================
  // CULINARY ARTS & HOSPITALITY
  // =======================================================================
  // Culinary Arts
  { cipCode: '12.0500', cipTitle: 'Cooking and Related Culinary Arts, General', socCode: '35-1011', socTitle: 'Chefs and Head Cooks' },
  { cipCode: '12.0500', cipTitle: 'Cooking and Related Culinary Arts, General', socCode: '35-2014', socTitle: 'Cooks, Restaurant' },
  // Baking/Pastry
  { cipCode: '12.0501', cipTitle: 'Baking and Pastry Arts/Baker/Pastry Chef', socCode: '51-3011', socTitle: 'Bakers' },
  { cipCode: '12.0501', cipTitle: 'Baking and Pastry Arts/Baker/Pastry Chef', socCode: '35-1011', socTitle: 'Chefs and Head Cooks' },
  // Hospitality Management
  { cipCode: '52.0901', cipTitle: 'Hospitality Administration/Management, General', socCode: '11-9081', socTitle: 'Lodging Managers' },
  { cipCode: '52.0901', cipTitle: 'Hospitality Administration/Management, General', socCode: '35-1012', socTitle: 'First-Line Supervisors of Food Preparation and Serving Workers' },
  // Hotel/Motel Management
  { cipCode: '52.0904', cipTitle: 'Hotel/Motel Administration/Management', socCode: '11-9081', socTitle: 'Lodging Managers' },
  // Restaurant Management
  { cipCode: '52.0905', cipTitle: 'Restaurant/Food Services Management', socCode: '11-9051', socTitle: 'Food Service Managers' },
  // Food Science
  { cipCode: '01.1001', cipTitle: 'Food Science', socCode: '19-1012', socTitle: 'Food Scientists and Technologists' },

  // =======================================================================
  // ARTS, DESIGN & MEDIA
  // =======================================================================
  // Graphic Design
  { cipCode: '50.0409', cipTitle: 'Graphic Design', socCode: '27-1024', socTitle: 'Graphic Designers' },
  // Photography
  { cipCode: '50.0605', cipTitle: 'Photography', socCode: '27-4021', socTitle: 'Photographers' },
  // Interior Design
  { cipCode: '50.0408', cipTitle: 'Interior Design', socCode: '27-1025', socTitle: 'Interior Designers' },
  // Radio/TV Broadcasting
  { cipCode: '09.0701', cipTitle: 'Radio and Television', socCode: '27-3011', socTitle: 'Broadcast Announcers and Radio Disc Jockeys' },
  // Film/Video Production
  { cipCode: '50.0602', cipTitle: 'Cinematography and Film/Video Production', socCode: '27-4032', socTitle: 'Film and Video Editors' },
  // Music
  { cipCode: '50.0901', cipTitle: 'Music, General', socCode: '27-2042', socTitle: 'Musicians and Singers' },
  // Digital Media
  { cipCode: '09.0702', cipTitle: 'Digital Communication and Media/Multimedia', socCode: '27-1024', socTitle: 'Graphic Designers' },

  // =======================================================================
  // AGRICULTURE & NATURAL RESOURCES
  // =======================================================================
  // Agriculture
  { cipCode: '01.0000', cipTitle: 'Agriculture, General', socCode: '11-9013', socTitle: 'Farmers, Ranchers, and Other Agricultural Managers' },
  // Horticulture
  { cipCode: '01.0601', cipTitle: 'Applied Horticulture/Horticulture Operations, General', socCode: '37-1012', socTitle: 'First-Line Supervisors of Landscaping, Lawn Service, and Groundskeeping Workers' },
  { cipCode: '01.0601', cipTitle: 'Applied Horticulture/Horticulture Operations, General', socCode: '37-3011', socTitle: 'Landscaping and Groundskeeping Workers' },
  // Veterinary Assistant (farm)
  { cipCode: '01.8301', cipTitle: 'Veterinary/Animal Health Technology/Technician and Veterinary Assistant', socCode: '29-2056', socTitle: 'Veterinary Technologists and Technicians' },
  // Environmental Science
  { cipCode: '03.0104', cipTitle: 'Environmental Science', socCode: '19-2041', socTitle: 'Environmental Scientists and Specialists, Including Health' },
  // Water/Wastewater
  { cipCode: '15.0507', cipTitle: 'Environmental Engineering Technology/Environmental Technology', socCode: '51-8031', socTitle: 'Water and Wastewater Treatment Plant and System Operators' },

  // =======================================================================
  // SOCIAL SERVICES
  // =======================================================================
  // Social Work
  { cipCode: '44.0701', cipTitle: 'Social Work', socCode: '21-1029', socTitle: 'Social Workers, All Other' },
  // Human Services
  { cipCode: '44.0000', cipTitle: 'Human Services, General', socCode: '21-1093', socTitle: 'Social and Human Service Assistants' },
  // Gerontology
  { cipCode: '30.1101', cipTitle: 'Gerontology', socCode: '21-1093', socTitle: 'Social and Human Service Assistants' },
  // Sign Language Interpreting
  { cipCode: '16.1603', cipTitle: 'Sign Language Interpretation and Translation', socCode: '27-3091', socTitle: 'Interpreters and Translators' },

  // =======================================================================
  // ENGINEERING TECHNOLOGY
  // =======================================================================
  // Civil Engineering Tech
  { cipCode: '15.0201', cipTitle: 'Civil Engineering Technology/Technician', socCode: '17-3022', socTitle: 'Civil Engineering Technologists and Technicians' },
  // Mechanical Engineering Tech
  { cipCode: '15.0805', cipTitle: 'Mechanical Engineering/Mechanical Technology/Technician', socCode: '17-3027', socTitle: 'Mechanical Engineering Technologists and Technicians' },
  // Electrical Engineering Tech
  { cipCode: '15.0303', cipTitle: 'Electrical, Electronic, and Communications Engineering Technology/Technician', socCode: '17-3023', socTitle: 'Electrical and Electronic Engineering Technologists and Technicians' },
  // Biomedical Equipment Tech
  { cipCode: '15.0401', cipTitle: 'Biomedical Technology/Technician', socCode: '49-9062', socTitle: 'Medical Equipment Repairers' },
  // Energy / Solar
  { cipCode: '15.0503', cipTitle: 'Energy Management and Systems Technology/Technician', socCode: '47-2231', socTitle: 'Solar Photovoltaic Installers' },
  // Wind Energy
  { cipCode: '15.0505', cipTitle: 'Solar Energy Technology/Technician', socCode: '49-9081', socTitle: 'Wind Turbine Service Technicians' },

  // =======================================================================
  // MISCELLANEOUS COMMUNITY COLLEGE PROGRAMS
  // =======================================================================
  // GIS
  { cipCode: '45.0702', cipTitle: 'Geographic Information Science and Cartography', socCode: '15-1299', socTitle: 'Computer Occupations, All Other' },
  // Fitness / Personal Training
  { cipCode: '31.0507', cipTitle: 'Physical Fitness Technician', socCode: '39-9031', socTitle: 'Exercise Trainers and Group Fitness Instructors' },
  // Medical Interpreting
  { cipCode: '51.0712', cipTitle: 'Medical Receptionist/Receptionist', socCode: '43-4171', socTitle: 'Receptionists and Information Clerks' },
] as const;

// ---------------------------------------------------------------------------
// Indexes (built once at module load)
// ---------------------------------------------------------------------------

const socToCipIndex = new Map<string, CipMapping[]>();
const cipToSocIndex = new Map<string, SocMapping[]>();
const cipTitleMap = new Map<string, string>();
const socTitleMap = new Map<string, string>();

for (const entry of CROSSWALK_DATA) {
  // SOC → CIP
  if (!socToCipIndex.has(entry.socCode)) {
    socToCipIndex.set(entry.socCode, []);
  }
  const cipList = socToCipIndex.get(entry.socCode)!;
  if (!cipList.some(c => c.cipCode === entry.cipCode)) {
    cipList.push({ cipCode: entry.cipCode, cipTitle: entry.cipTitle });
  }

  // CIP → SOC
  if (!cipToSocIndex.has(entry.cipCode)) {
    cipToSocIndex.set(entry.cipCode, []);
  }
  const socList = cipToSocIndex.get(entry.cipCode)!;
  if (!socList.some(s => s.socCode === entry.socCode)) {
    socList.push({ socCode: entry.socCode, socTitle: entry.socTitle });
  }

  // Title lookups
  cipTitleMap.set(entry.cipCode, entry.cipTitle);
  socTitleMap.set(entry.socCode, entry.socTitle);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns all CIP codes that map to the given SOC code. */
export function socToCip(socCode: string): CipMapping[] {
  return socToCipIndex.get(socCode) ?? [];
}

/** Returns all SOC codes that map to the given CIP code. */
export function cipToSoc(cipCode: string): SocMapping[] {
  return cipToSocIndex.get(cipCode) ?? [];
}

/** Returns the human-readable title for a CIP code, or null if not found. */
export function getCipTitle(cipCode: string): string | null {
  return cipTitleMap.get(cipCode) ?? null;
}

/** Returns the human-readable title for a SOC code, or null if not found. */
export function getSocTitle(socCode: string): string | null {
  return socTitleMap.get(socCode) ?? null;
}

/** Returns all unique CIP codes in the crosswalk. */
export function getAllCipCodes(): string[] {
  return Array.from(cipTitleMap.keys());
}

/** Returns all unique SOC codes in the crosswalk. */
export function getAllSocCodes(): string[] {
  return Array.from(socTitleMap.keys());
}

/** Returns the full crosswalk dataset. */
export function getCrosswalkData(): readonly CrosswalkEntry[] {
  return CROSSWALK_DATA;
}

// ---------------------------------------------------------------------------
// Test examples (comment block)
// ---------------------------------------------------------------------------
/*
 * Expected outputs:
 *
 * socToCip('29-2052')
 * → [{ cipCode: '51.0805', cipTitle: 'Pharmacy Technician/Assistant' }]
 *
 * cipToSoc('51.0805')
 * → [
 *     { socCode: '29-2052', socTitle: 'Pharmacy Technicians' },
 *     { socCode: '31-9095', socTitle: 'Pharmacy Aides' },
 *   ]
 *
 * getCipTitle('51.0805')
 * → 'Pharmacy Technician/Assistant'
 *
 * getSocTitle('29-2052')
 * → 'Pharmacy Technicians'
 *
 * socToCip('99-9999')
 * → []
 */
