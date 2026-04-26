/**
 * AgriConnect 360 — Financial Inclusion Service (Phase 14D)
 * KCC, Loan EMI, Crop Insurance, Subsidy Tracking, Financial Literacy
 */

/** 14D.1 — Digital KCC Application Helper */
export function prefillKCCApplication(farmerProfile) {
  return {
    applicantName: farmerProfile?.name || '',
    fatherName: farmerProfile?.father_name || '',
    aadhaarNumber: farmerProfile?.aadhaar ? `XXXX-XXXX-${farmerProfile.aadhaar.slice(-4)}` : '',
    mobileNumber: farmerProfile?.mobile || '',
    address: `${farmerProfile?.village || ''}, ${farmerProfile?.mandal || ''}, ${farmerProfile?.district || ''}, ${farmerProfile?.state || 'Andhra Pradesh'}`,
    landHolding: farmerProfile?.total_land || 0,
    irrigationType: farmerProfile?.irrigation_type || 'Rainfed',
    crops: farmerProfile?.crops || [],
    bankName: farmerProfile?.bank_name || '',
    branchName: farmerProfile?.branch_name || '',
    ifscCode: farmerProfile?.ifsc_code || '',
    accountNumber: farmerProfile?.account_number ? `XXXX${farmerProfile.account_number.slice(-4)}` : '',
    eligibleAmount: calculateKCCLimit(farmerProfile),
    documents: [
      { name: 'Aadhaar Card', status: farmerProfile?.aadhaar ? 'uploaded' : 'pending' },
      { name: 'Land Records (Pahani)', status: farmerProfile?.land_records ? 'uploaded' : 'pending' },
      { name: 'Passport Photo', status: farmerProfile?.avatar_url ? 'uploaded' : 'pending' },
      { name: 'Bank Passbook', status: farmerProfile?.account_number ? 'uploaded' : 'pending' },
    ],
  };
}

function calculateKCCLimit(profile) {
  const landAcres = profile?.total_land || 0;
  const cropFactor = { 'Paddy': 50000, 'Cotton': 40000, 'Sugarcane': 60000, 'Groundnut': 35000 };
  const primaryCrop = profile?.crops?.[0] || 'Paddy';
  const baseLimit = landAcres * (cropFactor[primaryCrop] || 45000);
  return Math.min(Math.max(baseLimit, 50000), 300000);
}

/** 14D.2 — Loan EMI Calculator */
export function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return { emi: Math.round(principal / tenureMonths), totalPayment: principal, totalInterest: 0 };
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  const schedule = [];
  let balance = principal;
  for (let m = 1; m <= tenureMonths; m++) {
    const interestPart = balance * monthlyRate;
    const principalPart = emi - interestPart;
    balance -= principalPart;
    schedule.push({ month: m, emi: Math.round(emi), principal: Math.round(principalPart), interest: Math.round(interestPart), balance: Math.max(0, Math.round(balance)) });
  }
  return { emi: Math.round(emi), totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest), schedule };
}

/** 14D.3 — Crop Insurance Premium Calculator */
export function calculateInsurancePremium(crop, area, sumInsured, season, scheme = 'PMFBY') {
  const farmerPremiumRates = {
    'PMFBY': { Kharif: 2, Rabi: 1.5, Commercial: 5 },
    'RWBCIS': { Kharif: 2, Rabi: 1.5, Commercial: 5 },
  };
  const rates = farmerPremiumRates[scheme] || farmerPremiumRates.PMFBY;
  const rate = rates[season] || rates.Kharif;
  const premium = Math.round(sumInsured * rate / 100);
  const govSubsidy = Math.round(sumInsured * (rate > 2 ? 5 : rate) / 100) - premium;

  return {
    scheme,
    crop,
    area,
    sumInsured,
    season,
    farmerPremium: premium,
    govSubsidy: Math.max(0, govSubsidy),
    actualPremiumRate: rate,
    coverageDetails: {
      naturalCalamity: true,
      drought: true,
      flood: true,
      pest: scheme === 'PMFBY',
      postHarvest: scheme === 'PMFBY',
      localCalamity: true,
    },
    claimProcess: [
      'Report crop loss within 72 hours',
      'Submit photos via AgriConnect app',
      'Crop cutting experiment by surveyor',
      'Claim settlement within 30 days',
    ],
  };
}

/** 14D.4 — Subsidy/DBT Tracker */
export function getSubsidyStatus(schemes) {
  const DEMO_SCHEMES = [
    { name: 'PM-KISAN', amount: 6000, frequency: 'Annual (3 installments)', status: 'credited', lastCredit: '2026-04-01', nextDue: '2026-08-01', accountEnding: '4521' },
    { name: 'YSR Rythu Bharosa', amount: 13500, frequency: 'Annual', status: 'credited', lastCredit: '2026-01-15', nextDue: '2027-01-15', accountEnding: '4521' },
    { name: 'Fertilizer Subsidy', amount: 12000, frequency: 'Per Purchase', status: 'pending', lastCredit: '2025-11-20', nextDue: 'On purchase', accountEnding: '4521' },
    { name: 'PMFBY Claim', amount: 42000, frequency: 'Per Claim', status: 'processing', lastCredit: null, nextDue: '2026-05-15', accountEnding: '4521' },
  ];

  return (schemes || DEMO_SCHEMES).map(s => ({
    ...s,
    timeline: [
      { step: 'Applied', date: '2025-06-01', done: true },
      { step: 'Verified', date: '2025-06-15', done: true },
      { step: 'Approved', date: '2025-07-01', done: s.status !== 'pending' },
      { step: 'Credited', date: s.lastCredit || 'Pending', done: s.status === 'credited' },
    ],
  }));
}

/** 14D.5 — Financial Literacy Content */
export const FINANCIAL_LITERACY_VIDEOS = [
  { id: 'FL-01', title: 'KCC — How to Apply', duration: '5:30', language: 'te', category: 'Credit', thumbnail: '🏦', views: 12400 },
  { id: 'FL-02', title: 'Crop Insurance Benefits', duration: '4:45', language: 'te', category: 'Insurance', thumbnail: '🛡️', views: 8900 },
  { id: 'FL-03', title: 'Understanding Loan Interest', duration: '6:00', language: 'te', category: 'Credit', thumbnail: '📊', views: 7200 },
  { id: 'FL-04', title: 'PM-KISAN Registration', duration: '3:15', language: 'te', category: 'Subsidy', thumbnail: '🏛️', views: 15600 },
  { id: 'FL-05', title: 'Digital Payment Safety', duration: '4:00', language: 'te', category: 'Digital', thumbnail: '💳', views: 9300 },
  { id: 'FL-06', title: 'Saving vs Investment', duration: '5:45', language: 'hi', category: 'Savings', thumbnail: '💰', views: 6100 },
  { id: 'FL-07', title: 'Tax Filing for Farmers', duration: '7:00', language: 'en', category: 'Tax', thumbnail: '📋', views: 4500 },
  { id: 'FL-08', title: 'Warehouse Receipt Financing', duration: '5:00', language: 'te', category: 'Credit', thumbnail: '🏪', views: 3200 },
];

export default { prefillKCCApplication, calculateEMI, calculateInsurancePremium, getSubsidyStatus, FINANCIAL_LITERACY_VIDEOS };
