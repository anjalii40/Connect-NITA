// College data with tiers and additional information
export const collegeOptions = [
  { name: 'IIT Bombay', tier: 'Tier 1', location: 'Mumbai, Maharashtra' },
  { name: 'IIT Delhi', tier: 'Tier 1', location: 'New Delhi, Delhi' },
  { name: 'IIT Madras', tier: 'Tier 1', location: 'Chennai, Tamil Nadu' },
  { name: 'IIT Kanpur', tier: 'Tier 1', location: 'Kanpur, Uttar Pradesh' },
  { name: 'IIT Kharagpur', tier: 'Tier 1', location: 'Kharagpur, West Bengal' },
  { name: 'BITS Pilani', tier: 'Tier 1', location: 'Pilani, Rajasthan' },
  { name: 'NIT Trichy', tier: 'Tier 2', location: 'Tiruchirappalli, Tamil Nadu' },
  { name: 'NIT Surathkal', tier: 'Tier 2', location: 'Surathkal, Karnataka' },
  { name: 'NIT Agartala', tier: 'Tier 2', location: 'Agartala, Tripura' },
  { name: 'DTU', tier: 'Tier 2', location: 'New Delhi, Delhi' },
  { name: 'NSIT', tier: 'Tier 2', location: 'New Delhi, Delhi' },
  { name: 'IIIT Hyderabad', tier: 'Tier 1', location: 'Hyderabad, Telangana' },
  { name: 'IIIT Bangalore', tier: 'Tier 1', location: 'Bangalore, Karnataka' },
  { name: 'IIIT Agartala', tier: 'Tier 2', location: 'Agartala, Tripura' },
  { name: 'BITS Goa', tier: 'Tier 1', location: 'Goa' },
  { name: 'BITS Hyderabad', tier: 'Tier 1', location: 'Hyderabad, Telangana' },
  { name: 'Other', tier: 'Tier 2', location: 'Various' },
];

// Branch options
export const branchOptions = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Data Science',
  'Artificial Intelligence',
  'Cybersecurity',
  'Other'
];

// Domain options
export const domainOptions = [
  'technology',
  'banking',
  'consulting',
  'startups',
  'government',
  'design',
  'research',
  'other'
];

// User type options
export const userTypeOptions = [
  { value: 'student', label: 'Student' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'admin', label: 'Admin' }
];

// Get colleges by tier
export const getCollegesByTier = (tier) => {
  return collegeOptions.filter(college => college.tier === tier);
};

// Get college by name
export const getCollegeByName = (name) => {
  return collegeOptions.find(college => college.name === name);
};

// Get tier 1 colleges
export const getTier1Colleges = () => {
  return getCollegesByTier('Tier 1');
};

// Get tier 2 colleges
export const getTier2Colleges = () => {
  return getCollegesByTier('Tier 2');
};

// Get college names for display
export const getCollegeNames = () => {
  return collegeOptions.map(college => college.name);
};

// Validate college name
export const isValidCollege = (name) => {
  return collegeOptions.some(college => college.name === name);
};

// Get college tier
export const getCollegeTier = (name) => {
  const college = getCollegeByName(name);
  return college ? college.tier : 'Tier 2';
}; 