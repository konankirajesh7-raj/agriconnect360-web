import React, { useMemo, useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import {
  prefillKCCApplication,
  calculateEMI,
  calculateInsurancePremium,
  getSubsidyStatus,
  FINANCIAL_LITERACY_VIDEOS
} from '../lib/services/financialService';

const CURRENCY = new Intl.NumberFormat('en-IN');
const PIPELINE_STEPS = ['Reported', 'Survey Scheduled', 'Verified', 'Approved', 'Paid'];

const LENDER_CATALOG = [
  { id: 'sbi', name: 'State Bank of India', type: 'Public Sector', rate: 7.1, processingFee: 0.6, approvalDays: 4, maxAmount: 700000 },
  { id: 'hdfc', name: 'HDFC Bank Agri', type: 'Private Bank', rate: 8.4, processingFee: 1.2, approvalDays: 2, maxAmount: 900000 },
  { id: 'icici', name: 'ICICI Rural Finance', type: 'Private Bank', rate: 8.8, processingFee: 1.1, approvalDays: 2, maxAmount: 850000 },
  { id: 'axis', name: 'Axis Agri Credit', type: 'Private Bank', rate: 8.6, processingFee: 1.0, approvalDays: 3, maxAmount: 800000 },
  { id: 'baroda', name: 'Bank of Baroda Kisan', type: 'Public Sector', rate: 7.5, processingFee: 0.8, approvalDays: 5, maxAmount: 650000 },
  { id: 'nabard', name: 'NABARD Partner NBFC', type: 'NBFC', rate: 9.2, processingFee: 1.5, approvalDays: 2, maxAmount: 600000 },
  { id: 'mahindra', name: 'Mahindra Finance', type: 'NBFC', rate: 9.5, processingFee: 1.8, approvalDays: 1, maxAmount: 550000 },
  { id: 'coop', name: 'District Co-op Bank', type: 'Cooperative', rate: 7.8, processingFee: 0.5, approvalDays: 6, maxAmount: 450000 }
];

const SUBSIDY_SCHEMES = [
  'PM-KISAN',
  'YSR Rythu Bharosa',
  'PMFBY Premium Support',
  'Soil Health Card Incentive',
  'Micro Irrigation Fund',
  'Solar Pump Subsidy',
  'Organic Farming Mission',
  'Drip Irrigation Subsidy',
  'Farm Mechanization Grant',
  'Custom Hiring Center Support',
  'Warehouse Receipt Interest Subvention',
  'e-NAM Logistics Support',
  'KCC Interest Subvention',
  'Dairy Entrepreneurship Scheme',
  'Poultry Venture Capital',
  'Fisheries Infrastructure Support',
  'Bee Keeping Mission',
  'National Horticulture Mission',
  'Polyhouse Subsidy',
  'Cold Storage Capital Subsidy',
  'Crop Diversification Grant',
  'Seed Village Programme',
  'Bio-fertilizer Support',
  'Vermi Compost Unit Support',
  'FPO Equity Grant',
  'Post-Harvest Management Scheme',
  'Agri Export Promotion Aid',
  'Natural Farming Incentive',
  'Millet Mission Assistance',
  'Water Harvesting Support',
  'Farm Pond Subsidy',
  'Greenhouse Cultivation Aid',
  'Precision Farming Assistance',
  'Rural Godown Scheme',
  'Agri Start-up Innovation Grant',
  'Agri Clinic Support',
  'Mechanized Sowing Support',
  'Harvesting Machinery Grant',
  'Tractor Assistance',
  'Mini Tractor Support',
  'Women Farmer Empowerment Grant',
  'SC/ST Farmer Assistance',
  'Rainfed Area Development Aid',
  'Integrated Farming Support',
  'Farm Safety Net Assistance',
  'Disaster Relief Compensation',
  'Input Subsidy - Seeds',
  'Input Subsidy - Fertilizer',
  'Input Subsidy - Diesel',
  'Crop Residue Management Support',
  'Livestock Health Mission',
  'Digital Agriculture Mission'
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the ideal time window to report PMFBY crop loss?',
    options: ['Within 72 hours', 'Within 15 days', 'At harvest only', 'No deadline'],
    answer: 'Within 72 hours'
  },
  {
    id: 'q2',
    question: 'KCC interest can drop to 4% when repayment is:',
    options: ['Annual only', 'Done on time', 'Done in cash only', 'Done through agent'],
    answer: 'Done on time'
  },
  {
    id: 'q3',
    question: 'Which value impacts straight-line depreciation the most?',
    options: ['Purchase value', 'Soil type', 'Rainfall', 'Seed variety'],
    answer: 'Purchase value'
  },
  {
    id: 'q4',
    question: 'DBT payments are usually credited to:',
    options: ['Input dealer account', 'Village office cashbox', 'Linked beneficiary bank account', 'Any UPI ID'],
    answer: 'Linked beneficiary bank account'
  }
];

function formatCurrency(amount) {
  return `₹${CURRENCY.format(Math.round(Number(amount) || 0))}`;
}

function getToneByPercent(value) {
  if (value >= 80) return 'red';
  if (value >= 60) return 'yellow';
  return 'green';
}

function getHealthLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Healthy';
  if (score >= 50) return 'Watchlist';
  return 'At Risk';
}

function buildSubsidyCatalog(profile) {
  const seededSchemes = getSubsidyStatus();
  const landHolding = Number(profile?.total_land || 0);
  const categoryRules = ['all', 'small-farmer', 'tenant', 'women', 'youth'];
  const frequencies = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Seasonal'];
  const fallbackStatuses = ['credited', 'processing', 'pending'];

  return SUBSIDY_SCHEMES.map((name, index) => {
    const seeded = seededSchemes.find((item) =>
      item.name.toLowerCase() === name.toLowerCase() ||
      item.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(item.name.toLowerCase())
    );

    const status = seeded?.status || fallbackStatuses[index % fallbackStatuses.length];
    const eligibilityBucket = categoryRules[index % categoryRules.length];
    const isEligible = eligibilityBucket === 'all'
      || (eligibilityBucket === 'small-farmer' && landHolding <= 5)
      || (eligibilityBucket === 'tenant' && landHolding <= 8)
      || (eligibilityBucket === 'women')
      || (eligibilityBucket === 'youth');

    const baseAmount = seeded?.amount || (2500 + ((index % 9) * 1750));

    return {
      id: `scheme-${index + 1}`,
      name,
      amount: baseAmount,
      frequency: seeded?.frequency || frequencies[index % frequencies.length],
      status,
      eligibilityBucket,
      isEligible,
      timeline: seeded?.timeline || [
        { step: 'Applied', done: true },
        { step: 'Verified', done: true },
        { step: 'Approved', done: status !== 'pending' },
        { step: 'Credited', done: status === 'credited' }
      ],
      nextPaymentWindow: seeded?.nextDue || `2026-${String((index % 12) + 1).padStart(2, '0')}-15`
    };
  });
}

function getAnnualDepreciation(asset) {
  const usefulLife = Math.max(Number(asset.usefulLifeYears || 1), 1);
  const purchaseValue = Number(asset.purchaseValue || 0);
  const salvageValue = Number(asset.salvageValue || 0);
  return Math.max(0, (purchaseValue - salvageValue) / usefulLife);
}

function getBookValue(asset) {
  const purchaseYear = Number((asset.purchaseDate || '').slice(0, 4)) || new Date().getFullYear();
  const elapsedYears = Math.max(new Date().getFullYear() - purchaseYear, 0);
  const purchaseValue = Number(asset.purchaseValue || 0);
  const salvageValue = Number(asset.salvageValue || 0);
  return Math.max(salvageValue, Math.round(purchaseValue - (getAnnualDepreciation(asset) * elapsedYears)));
}

export default function FinancialServicesPage() {
  const { farmerProfile } = useAuth();
  const profile = farmerProfile || {};
  const [activeTab, setActiveTab] = useState('kcc');

  const tabs = [
    { id: 'kcc', icon: '🏦', label: 'KCC' },
    { id: 'loans', icon: '💸', label: 'Loans' },
    { id: 'insurance', icon: '🛡️', label: 'Insurance' },
    { id: 'subsidies', icon: '🏛️', label: 'Subsidies' },
    { id: 'tax', icon: '📋', label: 'Tax' },
    { id: 'assets', icon: '🚜', label: 'Assets' },
    { id: 'health', icon: '❤️', label: 'Health Score' },
    { id: 'literacy', icon: '📚', label: 'Literacy' }
  ];

  return (
    <div className="animated fin-page">
      <div className="section-header">
        <div>
          <div className="section-title">💼 Financial Services</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Manage loans, insurance, subsidies, and financial health
          </div>
        </div>
      </div>

      <div className="fin-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`fin-tab ${activeTab === t.id ? 'active' : ''}`}
          >
            <span className="fin-tab-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="fin-content" style={{ animation: 'fadeIn 0.3s ease' }}>
        {activeTab === 'kcc' && <KCCSection profile={profile} />}
        {activeTab === 'loans' && <LoansSection />}
        {activeTab === 'insurance' && <InsuranceSection profile={profile} />}
        {activeTab === 'subsidies' && <SubsidiesSection profile={profile} />}
        {activeTab === 'tax' && <TaxSection />}
        {activeTab === 'assets' && <AssetsSection />}
        {activeTab === 'health' && <HealthScoreSection profile={profile} />}
        {activeTab === 'literacy' && <LiteracySection />}
      </div>
    </div>
  );
}

function KCCSection({ profile }) {
  const kccData = prefillKCCApplication(profile);
  const [utilizedAmount, setUtilizedAmount] = useState(Math.round(kccData.eligibleAmount * 0.38));
  const [projectionMonths, setProjectionMonths] = useState(6);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ bank:'SBI', branch:'Guntur Main', ifsc:'SBIN0000001', account:'1234567890', limit:'200000', disbursed:'150000', utilized:'80000', rate:'7', due:'3' });
  const [kccLinked, setKccLinked] = useState(false);
  const [calcAmt, setCalcAmt] = useState('80000');
  const [calcRate, setCalcRate] = useState('7');
  const [calcDays, setCalcDays] = useState('30');
  const [showCalcResult, setShowCalcResult] = useState(false);

  const sanctioned = kccLinked ? 200000 : kccData.eligibleAmount;
  const utilized = kccLinked ? 80000 : utilizedAmount;
  const available = kccLinked ? (200000 - 150000) + (150000 - 80000) : sanctioned - utilized;
  const utilizationPercent = Math.min(100, Math.round((utilized / Math.max(sanctioned, 1)) * 100));
  const tone = getToneByPercent(utilizationPercent);
  const subsidizedInterest = Math.round((utilized * 0.04 * projectionMonths) / 12);
  const standardInterest = Math.round((utilized * 0.07 * projectionMonths) / 12);
  const savedInterest = Math.max(0, standardInterest - subsidizedInterest);
  const calcInterest = ((parseFloat(calcAmt)||0) * (parseFloat(calcRate)||0) / 100 * (parseFloat(calcDays)||0) / 365).toFixed(2);

  const linkedAccounts = kccLinked
    ? [{ bank: 'SBI', account: '1234567890', status: 'Primary KCC', ifsc: 'SBIN0000001', branch: 'Guntur Main' }, { bank: 'District Co-op Bank', account: 'XXXX1187', status: 'Secondary payout' }]
    : [{ bank: kccData.bankName || 'State Bank of India', account: kccData.accountNumber || 'XXXX4521', status: 'Primary KCC' }, { bank: 'District Co-op Bank', account: 'XXXX1187', status: 'Secondary payout' }];

  const TODAY_STR = new Date().toISOString().slice(0,10);
  const dueSchedule = [
    { label: 'Interest servicing', dueDate: '2026-05-31', amount: Math.round(subsidizedInterest / 2) },
    { label: 'Mid-cycle review', dueDate: '2026-07-15', amount: Math.round(subsidizedInterest / 2) },
    { label: 'Renewal/rollover', dueDate: '2026-10-01', amount: 0 }
  ];

  function getDueDateColor(dueDate) {
    const diff = Math.ceil((new Date(dueDate) - new Date(TODAY_STR)) / 86400000);
    if (diff < 7) return { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: '⚠️ <7 days' };
    if (diff < 30) return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: '⏰ <30 days' };
    return { bg: 'rgba(16,185,129,0.08)', color: '#34d399', label: '✅ On Track' };
  }

  function downloadKCCStatement() {
    const content = `RythuSphere — KCC Statement\n${'='.repeat(40)}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nAccount: ${linkedAccounts[0].account}\nBank: ${linkedAccounts[0].bank}\nSanctioned Limit: ₹${CURRENCY.format(sanctioned)}\nDisbursed: ₹${CURRENCY.format(kccLinked?150000:sanctioned)}\nUtilized: ₹${CURRENCY.format(utilized)}\nAvailable: ₹${CURRENCY.format(available)}\nUtilization: ${utilizationPercent}%\nInterest Rate: ${kccLinked?'7':'4'}% p.a.\n\n--- Due Dates ---\n${dueSchedule.map(d=>`${d.label}: ${d.dueDate} — ₹${d.amount>0?CURRENCY.format(d.amount):'N/A'}`).join('\n')}\n\nPowered by RythuSphere 🌾`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'RythuSphere_KCC_Statement.pdf'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">🏦 Kisan Credit Card (KCC)</h3>
      <div className="fin-summary-row">
        <div className="fin-summary-card">
          <div className="fin-card-label">Sanctioned Limit</div>
          <div className="fin-card-value text-green-500">{formatCurrency(sanctioned)}</div>
          <div className="fin-card-sub">{kccLinked ? 'SBI Guntur Main' : `Based on ${kccData.landHolding} acres`}</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Utilized</div>
          <div className="fin-card-value text-blue-500">{formatCurrency(utilized)}</div>
          <div className="fin-card-sub">{utilizationPercent}% utilization</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Available</div>
          <div className="fin-card-value text-green-500">{formatCurrency(available)}</div>
          <div className="fin-card-sub">ready to draw</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Interest Saved</div>
          <div className="fin-card-value text-yellow-500">{formatCurrency(savedInterest)}</div>
          <div className="fin-card-sub">by paying on schedule</div>
        </div>
      </div>

      <div className="fin-slider-group">
        <div className="fin-slider-header">
          <span className="fin-slider-label">KCC Utilization Planning</span>
          <span className="fin-slider-value">{utilizationPercent}%</span>
        </div>
        <input
          type="range"
          min="25000"
          max={Math.max(kccData.eligibleAmount, 50000)}
          step="5000"
          value={utilizedAmount}
          onChange={(e) => setUtilizedAmount(Number(e.target.value))}
          className="fin-slider"
        />
        <div className="fin-util-bar">
          <div className={`fin-util-fill ${tone}`} style={{ width: `${utilizationPercent}%` }}></div>
        </div>
      </div>

      <div className="fin-slider-group">
        <div className="fin-slider-header">
          <span className="fin-slider-label">Projection (months)</span>
          <span className="fin-slider-value">{projectionMonths} months</span>
        </div>
        <input
          type="range"
          min="3"
          max="12"
          step="1"
          value={projectionMonths}
          onChange={(e) => setProjectionMonths(Number(e.target.value))}
          className="fin-slider"
        />
      </div>

      <div className="fin-compare-grid" style={{ marginBottom: '20px' }}>
        <div className="fin-compare-card">
          <div className="fin-lender-name">Interest Projection</div>
          <div className="fin-lender-type">Current cycle</div>
          <div className="fin-compare-row"><span className="fin-compare-label">Subsidized (4%)</span><span className="fin-compare-value">{formatCurrency(subsidizedInterest)}</span></div>
          <div className="fin-compare-row"><span className="fin-compare-label">Standard (7%)</span><span className="fin-compare-value">{formatCurrency(standardInterest)}</span></div>
          <div className="fin-compare-row"><span className="fin-compare-label">Potential savings</span><span className="fin-compare-value text-green-500">{formatCurrency(savedInterest)}</span></div>
        </div>
        <div className="fin-compare-card">
          <div className="fin-lender-name">Linked Accounts</div>
          <div className="fin-lender-type">Disbursement + DBT mapping</div>
          <div className="fin-account-list">
            {linkedAccounts.map((account) => (
              <div key={account.account} className="fin-account-item">
                <div>
                  <div className="fin-account-bank">{account.bank}</div>
                  <div className="fin-account-meta">{account.account}</div>
                </div>
                <span className="fin-badge blue">{account.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Upcoming Due Dates</h4>
        <table className="fin-table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dueSchedule.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.dueDate}</td>
                <td>{item.amount > 0 ? formatCurrency(item.amount) : 'N/A'}</td>
                <td><span className="fin-badge yellow">Pending</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interest Calculator */}
      <div className="fin-compare-grid" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className="fin-compare-card">
          <div className="fin-lender-name">🧮 Interest Calculator</div>
          <div className="fin-input-grid" style={{ marginTop: '10px' }}>
            <label className="fin-input-group"><span>Amount (₹)</span><input className="fin-filter-input" type="number" value={calcAmt} onChange={e=>setCalcAmt(e.target.value)} /></label>
            <label className="fin-input-group"><span>Rate (%)</span><input className="fin-filter-input" type="number" value={calcRate} onChange={e=>setCalcRate(e.target.value)} /></label>
            <label className="fin-input-group"><span>Days</span><input className="fin-filter-input" type="number" value={calcDays} onChange={e=>setCalcDays(e.target.value)} /></label>
          </div>
          <button className="btn btn-primary" style={{ marginTop:'10px', width:'100%' }} onClick={()=>setShowCalcResult(true)}>Calculate Interest</button>
          {showCalcResult && (
            <div style={{ marginTop:'12px', padding:'14px', borderRadius:'10px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.15)', textAlign:'center' }}>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Monthly Interest</div>
              <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#34d399' }}>₹{parseFloat(calcInterest).toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:4 }}>₹{calcAmt} × {calcRate}% × {calcDays} days / 365</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '12px' }}>Required Documents</h4>
        <div className="fin-content-grid">
          {kccData.documents.map((doc, idx) => (
            <div key={idx} className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{doc.name}</span>
              <span className={`fin-badge ${doc.status === 'uploaded' ? 'green' : 'yellow'}`}>{doc.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="fin-actions">
        <button className="btn btn-outline" onClick={() => setShowLinkModal(true)}>+ Link KCC Account</button>
        <button className="btn btn-outline" onClick={downloadKCCStatement}>📄 Download KCC Statement</button>
        <button className="btn btn-primary">Apply for KCC Limit</button>
      </div>

      {/* Link KCC Modal */}
      {showLinkModal && (
        <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }} onClick={()=>setShowLinkModal(false)}>
          <div style={{ width:'min(500px,92vw)',maxHeight:'85vh',overflowY:'auto',background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ fontSize:'1rem',fontWeight:800,color:'var(--text-primary)' }}>+ Link KCC Account</div>
              <button style={{ background:'none',border:'none',color:'var(--text-muted)',fontSize:'1.3rem',cursor:'pointer' }} onClick={()=>setShowLinkModal(false)}>✕</button>
            </div>
            <div style={{ padding:'18px 22px' }}>
              <div className="fin-input-grid">
                <label className="fin-input-group"><span>Bank</span><input className="fin-filter-input" value={linkForm.bank} onChange={e=>setLinkForm(p=>({...p,bank:e.target.value}))} /></label>
                <label className="fin-input-group"><span>Branch</span><input className="fin-filter-input" value={linkForm.branch} onChange={e=>setLinkForm(p=>({...p,branch:e.target.value}))} /></label>
                <label className="fin-input-group"><span>IFSC</span><input className="fin-filter-input" value={linkForm.ifsc} onChange={e=>setLinkForm(p=>({...p,ifsc:e.target.value}))} /></label>
                <label className="fin-input-group"><span>Account No.</span><input className="fin-filter-input" value={linkForm.account} onChange={e=>setLinkForm(p=>({...p,account:e.target.value}))} /></label>
                <label className="fin-input-group"><span>Sanctioned Limit (₹)</span><input className="fin-filter-input" type="number" value={linkForm.limit} onChange={e=>setLinkForm(p=>({...p,limit:e.target.value}))} /></label>
                <label className="fin-input-group"><span>Disbursed (₹)</span><input className="fin-filter-input" type="number" value={linkForm.disbursed} onChange={e=>setLinkForm(p=>({...p,disbursed:e.target.value}))} /></label>
                <label className="fin-input-group"><span>Utilized (₹)</span><input className="fin-filter-input" type="number" value={linkForm.utilized} onChange={e=>setLinkForm(p=>({...p,utilized:e.target.value}))} /></label>
                <label className="fin-input-group"><span>Interest Rate (%)</span><input className="fin-filter-input" type="number" value={linkForm.rate} onChange={e=>setLinkForm(p=>({...p,rate:e.target.value}))} /></label>
                <label className="fin-input-group"><span>Due In (months)</span><input className="fin-filter-input" type="number" value={linkForm.due} onChange={e=>setLinkForm(p=>({...p,due:e.target.value}))} /></label>
              </div>
              <button className="btn btn-primary" style={{ width:'100%', marginTop:'16px' }} onClick={()=>{setKccLinked(true);setShowLinkModal(false);}}>💾 Save & Link KCC</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoansSection() {
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(24);
  const [selectedLenders, setSelectedLenders] = useState(['sbi', 'hdfc', 'baroda']);
  const [showApply, setShowApply] = useState(false);
  const [applyLender, setApplyLender] = useState(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const lenderQuotes = useMemo(
    () => LENDER_CATALOG.map((lender) => {
      const emi = calculateEMI(amount, lender.rate, tenure);
      const processingFee = Math.round((amount * lender.processingFee) / 100);
      return {
        ...lender,
        emi: emi.emi,
        totalInterest: emi.totalInterest,
        totalPayment: emi.totalPayment,
        totalOutflow: emi.totalPayment + processingFee,
        processingFeeAmount: processingFee
      };
    }),
    [amount, tenure]
  );

  const bestQuote = useMemo(
    () => [...lenderQuotes].sort((a, b) => a.emi - b.emi)[0],
    [lenderQuotes]
  );

  function toggleLender(lenderId) {
    setSelectedLenders((prev) => {
      if (prev.includes(lenderId)) return prev.filter((id) => id !== lenderId);
      if (prev.length >= 3) return [...prev.slice(1), lenderId];
      return [...prev, lenderId];
    });
  }

  const comparedLenders = lenderQuotes.filter((lender) => selectedLenders.includes(lender.id));

  function handleApply(lender) {
    setApplyLender(lender);
    setShowApply(true);
  }

  function submitApplication() {
    setApplicationId(`AGRI-LN-${Date.now().toString(36).toUpperCase()}`);
    setApplicationSubmitted(true);
    setShowApply(false);
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">💸 Micro-Loan Marketplace & EMI Compare</h3>

      {/* Application Status */}
      {applicationSubmitted && (
        <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.15)', marginBottom:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <div><div style={{ fontWeight:700, color:'var(--text-primary)' }}>Application: {applicationId}</div><div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{applyLender?.name} • {formatCurrency(amount)} • {tenure} months</div></div>
            <span className="fin-badge green">Submitted</span>
          </div>
          <div className="fin-pipeline">
            {['Submitted','Documents Verified','Credit Check','Approved','Disbursed'].map((step, i) => (
              <React.Fragment key={step}>
                <div className={`fin-pipeline-step ${i < 1 ? 'done' : ''} ${i === 1 ? 'active' : ''}`}>
                  <div className="fin-pipeline-dot">{i < 1 ? '✓' : i + 1}</div>
                  <div className="fin-pipeline-label">{step}</div>
                </div>
                {i < 4 && <div className={`fin-pipeline-line ${i < 1 ? 'done' : ''}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Loan Calculator */}
      <div className="fin-compare-grid" style={{ marginBottom: '24px' }}>
        <div className="fin-slider-group">
          <div className="fin-slider-header">
            <span className="fin-slider-label">Loan Amount (₹)</span>
            <span className="fin-slider-value">{formatCurrency(amount)}</span>
          </div>
          <input type="range" min="50000" max="900000" step="10000" value={amount} onChange={e => setAmount(Number(e.target.value))} className="fin-slider" />
        </div>
        <div className="fin-slider-group">
          <div className="fin-slider-header">
            <span className="fin-slider-label">Tenure (Months)</span>
            <span className="fin-slider-value">{tenure} months</span>
          </div>
          <input type="range" min="6" max="60" step="1" value={tenure} onChange={e => setTenure(Number(e.target.value))} className="fin-slider" />
        </div>
      </div>

      <div className="fin-summary-row">
        <div className="fin-summary-card">
          <div className="fin-card-label">Best EMI</div>
          <div className="fin-card-value text-green-500">{formatCurrency(bestQuote?.emi || 0)}/mo</div>
          <div className="fin-card-sub">{bestQuote?.name}</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Total Payable</div>
          <div className="fin-card-value text-blue-500">{formatCurrency(bestQuote?.totalPayment || 0)}</div>
          <div className="fin-card-sub">principal + interest</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Total Interest</div>
          <div className="fin-card-value text-yellow-500">{formatCurrency(bestQuote?.totalInterest || 0)}</div>
          <div className="fin-card-sub">over {tenure} months</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Compared</div>
          <div className="fin-card-value text-blue-500">{selectedLenders.length}/3</div>
          <div className="fin-card-sub">side-by-side</div>
        </div>
      </div>

      <div className="fin-loan-cards">
        {lenderQuotes.map((lender) => (
          <div
            key={lender.id}
            className={`fin-compare-card ${selectedLenders.includes(lender.id) ? 'selected' : ''}`}
            style={{ position:'relative' }}
          >
            <div onClick={() => toggleLender(lender.id)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && toggleLender(lender.id)} style={{ cursor:'pointer' }}>
              {lender.id === bestQuote?.id && <span className="fin-badge green" style={{ position:'absolute',top:8,right:8 }}>⭐ Best Deal</span>}
              <div className="fin-lender-name">{lender.name}</div>
              <div className="fin-lender-type">{lender.type} • Max: {formatCurrency(lender.maxAmount)}</div>
              <div className="fin-compare-row"><span className="fin-compare-label">Rate</span><span className="fin-compare-value">{lender.rate}%</span></div>
              <div className="fin-compare-row"><span className="fin-compare-label">EMI</span><span className="fin-compare-value">{formatCurrency(lender.emi)}</span></div>
              <div className="fin-compare-row"><span className="fin-compare-label">Processing Fee</span><span className="fin-compare-value">{formatCurrency(lender.processingFeeAmount)}</span></div>
              <div className="fin-compare-row"><span className="fin-compare-label">Total Outflow</span><span className="fin-compare-value">{formatCurrency(lender.totalOutflow)}</span></div>
              <div className="fin-compare-row"><span className="fin-compare-label">Approval</span><span className="fin-compare-value">{lender.approvalDays} days</span></div>
            </div>
            <button className="btn btn-primary" style={{ width:'100%', marginTop:'10px', fontSize:'0.8rem' }} onClick={() => handleApply(lender)}>📝 Apply Now</button>
          </div>
        ))}
      </div>

      <div className="fin-compare-table-wrap">
        <h4 style={{ marginBottom: '12px' }}>Side-by-side Compare</h4>
        <table className="fin-table">
          <thead>
            <tr>
              <th>Metric</th>
              {comparedLenders.map((lender) => <th key={lender.id}>{lender.name}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr><td>Interest Rate</td>{comparedLenders.map((lender) => <td key={`${lender.id}-rate`}>{lender.rate}%</td>)}</tr>
            <tr><td>Monthly EMI</td>{comparedLenders.map((lender) => <td key={`${lender.id}-emi`}>{formatCurrency(lender.emi)}</td>)}</tr>
            <tr><td>Total Interest</td>{comparedLenders.map((lender) => <td key={`${lender.id}-interest`}>{formatCurrency(lender.totalInterest)}</td>)}</tr>
            <tr><td>Total Outflow</td>{comparedLenders.map((lender) => <td key={`${lender.id}-outflow`}>{formatCurrency(lender.totalOutflow)}</td>)}</tr>
          </tbody>
        </table>
      </div>

      {/* Apply Modal */}
      {showApply && applyLender && (
        <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }} onClick={()=>setShowApply(false)}>
          <div style={{ width:'min(500px,92vw)',maxHeight:'85vh',overflowY:'auto',background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ fontSize:'1rem',fontWeight:800,color:'var(--text-primary)' }}>📝 Apply — {applyLender.name}</div>
              <button style={{ background:'none',border:'none',color:'var(--text-muted)',fontSize:'1.3rem',cursor:'pointer' }} onClick={()=>setShowApply(false)}>✕</button>
            </div>
            <div style={{ padding:'18px 22px' }}>
              <div style={{ padding:'12px',borderRadius:'10px',background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.12)',marginBottom:'16px',fontSize:'0.82rem',color:'#93c5fd' }}>
                ℹ️ Farmer data auto-filled from profile. EMI: {formatCurrency(applyLender.emi)}/mo @ {applyLender.rate}%
              </div>
              <div className="fin-input-grid">
                <label className="fin-input-group"><span>Full Name</span><input className="fin-filter-input" defaultValue="Rajesh Kumar" /></label>
                <label className="fin-input-group"><span>Aadhaar No.</span><input className="fin-filter-input" defaultValue="XXXX-XXXX-4521" /></label>
                <label className="fin-input-group"><span>Mobile</span><input className="fin-filter-input" defaultValue="+91 98765 43210" /></label>
                <label className="fin-input-group"><span>Village</span><input className="fin-filter-input" defaultValue="Guntur, AP" /></label>
                <label className="fin-input-group"><span>Loan Amount</span><input className="fin-filter-input" defaultValue={amount} /></label>
                <label className="fin-input-group"><span>Tenure</span><input className="fin-filter-input" defaultValue={`${tenure} months`} /></label>
                <label className="fin-input-group"><span>Purpose</span><input className="fin-filter-input" defaultValue="Crop Investment - Kharif 2026" /></label>
                <label className="fin-input-group"><span>Land (acres)</span><input className="fin-filter-input" defaultValue="5" /></label>
              </div>
              <button className="btn btn-primary" style={{ width:'100%', marginTop:'16px' }} onClick={submitApplication}>🚀 Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsuranceSection({ profile }) {
  const [crop, setCrop] = useState(profile?.crops?.[0] || 'Paddy');
  const [season, setSeason] = useState('Kharif');
  const [area, setArea] = useState(Math.max(Number(profile?.total_land || 2), 1));
  const [sumInsured, setSumInsured] = useState(120000);
  const [claimStage, setClaimStage] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [lossType, setLossType] = useState('Flood');
  const [lossPct, setLossPct] = useState('60');
  const [policyNo, setPolicyNo] = useState('PMFBY-2024-001');
  const [weatherAttached, setWeatherAttached] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimId, setClaimId] = useState('');

  const insuranceData = calculateInsurancePremium(crop, area, sumInsured, season, 'PMFBY');
  const claimTicket = `PMFBY-${new Date().getFullYear()}-${String(area).replace('.', '')}${season.slice(0, 1)}`;
  const autoFilledDetails = [
    { label: 'Farmer', value: profile?.name || 'Rajesh Kumar' },
    { label: 'Village', value: profile?.village || 'Guntur, AP' },
    { label: 'Primary Crop', value: crop },
    { label: 'Area (acres)', value: area },
    { label: 'Aadhaar', value: 'XXXX-XXXX-4521' },
    { label: 'Policy No.', value: policyNo },
  ];

  function onPhotoUpload(event) {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos(files.map((file) => ({ name: file.name, gps: `16.30°N, 80.43°E`, time: new Date().toLocaleTimeString('en-IN') })));
  }

  function submitClaim() {
    const id = `CLM-${Date.now().toString(36).toUpperCase()}`;
    setClaimId(id);
    setClaimSubmitted(true);
    setClaimStage(1);
    setShowClaimForm(false);
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">🛡️ Insurance Claims (PMFBY)</h3>

      {/* Claim Status */}
      {claimSubmitted && (
        <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.15)', marginBottom:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <div><div style={{ fontWeight:700, color:'var(--text-primary)' }}>Claim ID: {claimId}</div><div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{lossType} — {lossPct}% loss — {crop} — Policy: {policyNo}</div></div>
            <span className="fin-badge green">Filed</span>
          </div>
        </div>
      )}

      <div style={{ marginBottom:'16px' }}>
        <button className="btn btn-primary" onClick={() => setShowClaimForm(true)} style={{ fontSize:'0.88rem' }}>📋 File New Claim</button>
      </div>

      <div className="fin-input-grid">
        <label className="fin-input-group"><span>Crop</span>
          <select className="fin-filter-select" value={crop} onChange={(event) => setCrop(event.target.value)}>
            <option value="Paddy">Paddy</option><option value="Cotton">Cotton</option><option value="Groundnut">Groundnut</option><option value="Maize">Maize</option>
          </select>
        </label>
        <label className="fin-input-group"><span>Season</span>
          <select className="fin-filter-select" value={season} onChange={(event) => setSeason(event.target.value)}>
            <option value="Kharif">Kharif</option><option value="Rabi">Rabi</option><option value="Commercial">Commercial</option>
          </select>
        </label>
        <label className="fin-input-group"><span>Area (acres)</span><input className="fin-filter-input" type="number" value={area} min="1" max="50" onChange={(event) => setArea(Number(event.target.value) || 1)} /></label>
        <label className="fin-input-group"><span>Sum insured (₹)</span><input className="fin-filter-input" type="number" value={sumInsured} min="50000" step="5000" onChange={(event) => setSumInsured(Number(event.target.value) || 50000)} /></label>
      </div>

      <div className="fin-summary-row">
        <div className="fin-summary-card"><div className="fin-card-label">Farmer Premium</div><div className="fin-card-value text-green-500">{formatCurrency(insuranceData.farmerPremium)}</div><div className="fin-card-sub">@ {insuranceData.actualPremiumRate}% rate</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Govt Subsidy</div><div className="fin-card-value text-blue-500">{formatCurrency(insuranceData.govSubsidy)}</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Claim Ticket</div><div className="fin-card-value text-yellow-500">{claimTicket}</div><div className="fin-card-sub">Auto-filled from profile</div></div>
      </div>

      <div className="fin-compare-grid" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '16px' }}><h4>PMFBY Auto-fill Summary</h4>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {autoFilledDetails.map((entry) => <li key={entry.label}><strong>{entry.label}:</strong> {entry.value}</li>)}
          </ul>
        </div>
        <div className="card" style={{ padding: '16px' }}><h4>Coverage Scope</h4>
          <div className="fin-policy-meta">
            {Object.entries(insuranceData.coverageDetails).filter(([, value]) => value).map(([key]) => (
              <span key={key} className="fin-chip">{key.replace(/([A-Z])/g, ' $1')}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="fin-upload-box">
        <label htmlFor="claim-photo-upload" className="fin-input-group"><span>Damage Proof Upload (Images)</span><input id="claim-photo-upload" type="file" accept="image/*" multiple onChange={onPhotoUpload} /></label>
        <div className="fin-photo-list">
          {uploadedPhotos.length === 0
            ? <span className="fin-card-sub">No photos uploaded yet.</span>
            : uploadedPhotos.map((photo) => (
              <div key={photo.name} style={{ display:'inline-flex', gap:6, alignItems:'center', padding:'4px 10px', borderRadius:8, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.12)', marginRight:6, marginBottom:4 }}>
                <span className="fin-badge blue">{photo.name}</span>
                <span style={{ fontSize:'0.6rem', color:'#34d399' }}>📍 {photo.gps}</span>
                <span style={{ fontSize:'0.6rem', color:'var(--text-muted)' }}>⏰ {photo.time}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ marginTop: '18px' }}>
        <h4 style={{ marginBottom: '10px' }}>Claim Status Pipeline</h4>
        <div className="fin-pipeline">
          {['Filed','Acknowledged','Survey','Verified','Approved','Paid'].map((step, index) => (
            <React.Fragment key={step}>
              <div className={`fin-pipeline-step ${index < claimStage ? 'done' : ''} ${index === claimStage ? 'active' : ''}`}>
                <div className="fin-pipeline-dot">{index < claimStage ? '✓' : index + 1}</div>
                <div className="fin-pipeline-label">{step}</div>
              </div>
              {index < 5 && (<div className={`fin-pipeline-line ${index < claimStage ? 'done' : ''}`}></div>)}
            </React.Fragment>
          ))}
        </div>
        <div className="fin-actions">
          <button className="btn btn-outline" onClick={() => setClaimStage((prev) => Math.max(0, prev - 1))}>◀ Move Back</button>
          <button className="btn btn-primary" onClick={() => setClaimStage((prev) => Math.min(5, prev + 1))}>Advance Stage ▶</button>
        </div>
      </div>

      {/* File New Claim Modal */}
      {showClaimForm && (
        <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }} onClick={()=>setShowClaimForm(false)}>
          <div style={{ width:'min(520px,92vw)',maxHeight:'85vh',overflowY:'auto',background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ fontSize:'1rem',fontWeight:800,color:'var(--text-primary)' }}>📋 File New PMFBY Claim</div>
              <button style={{ background:'none',border:'none',color:'var(--text-muted)',fontSize:'1.3rem',cursor:'pointer' }} onClick={()=>setShowClaimForm(false)}>✕</button>
            </div>
            <div style={{ padding:'18px 22px' }}>
              <div style={{ padding:'12px',borderRadius:'10px',background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.12)',marginBottom:'16px',fontSize:'0.82rem',color:'#93c5fd' }}>
                ℹ️ Farmer data auto-filled from profile
              </div>
              <div className="fin-input-grid">
                <label className="fin-input-group"><span>Farmer Name</span><input className="fin-filter-input" defaultValue={profile?.name || 'Rajesh Kumar'} readOnly /></label>
                <label className="fin-input-group"><span>Village</span><input className="fin-filter-input" defaultValue={profile?.village || 'Guntur, AP'} readOnly /></label>
                <label className="fin-input-group"><span>Loss Type</span>
                  <select className="fin-filter-select" value={lossType} onChange={e=>setLossType(e.target.value)}>
                    <option>Flood</option><option>Drought</option><option>Cyclone</option><option>Hailstorm</option><option>Pest Attack</option><option>Fire</option>
                  </select>
                </label>
                <label className="fin-input-group"><span>Loss Percentage (%)</span><input className="fin-filter-input" type="number" value={lossPct} onChange={e=>setLossPct(e.target.value)} min="10" max="100" /></label>
                <label className="fin-input-group"><span>Policy Number</span><input className="fin-filter-input" value={policyNo} onChange={e=>setPolicyNo(e.target.value)} /></label>
                <label className="fin-input-group"><span>Crop</span><input className="fin-filter-input" value={crop} readOnly /></label>
              </div>

              <div style={{ marginTop:'14px' }}>
                <label className="fin-input-group"><span>Upload Crop Loss Photos (GPS tagged)</span><input type="file" accept="image/*" multiple onChange={onPhotoUpload} /></label>
                {uploadedPhotos.length > 0 && (
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                    {uploadedPhotos.map((p,i) => (
                      <div key={i} style={{ padding:'8px 12px', borderRadius:8, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.12)', fontSize:'0.75rem' }}>
                        📷 {p.name} <span style={{ color:'#34d399',fontSize:'0.65rem' }}>📍 {p.gps}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-outline" style={{ width:'100%', marginTop:'14px' }} onClick={()=>setWeatherAttached(true)}>
                {weatherAttached ? '✅ Weather Evidence Attached — 145mm rainfall in 72hrs' : '🌧️ Attach Weather Evidence (Auto-fetch)'}
              </button>

              <button className="btn btn-primary" style={{ width:'100%', marginTop:'12px' }} onClick={submitClaim}>🚀 Submit Claim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubsidiesSection({ profile }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const allSchemes = useMemo(() => buildSubsidyCatalog(profile), [profile]);

  const filteredSchemes = useMemo(
    () => allSchemes.filter((scheme) => {
      const matchesQuery = scheme.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || scheme.status === statusFilter;
      const matchesEligibility = eligibilityFilter === 'all' || scheme.eligibilityBucket === eligibilityFilter;
      return matchesQuery && matchesStatus && matchesEligibility;
    }),
    [allSchemes, query, statusFilter, eligibilityFilter]
  );

  const creditedCount = allSchemes.filter((scheme) => scheme.status === 'credited').length;
  const eligibleCount = allSchemes.filter((scheme) => scheme.isEligible).length;
  const upcomingAmount = allSchemes
    .filter((scheme) => scheme.status !== 'credited')
    .reduce((total, scheme) => total + scheme.amount, 0);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">🏛️ Subsidy & DBT Tracker</h3>
      <div className="fin-summary-row">
        <div className="fin-summary-card">
          <div className="fin-card-label">Total Schemes</div>
          <div className="fin-card-value text-blue-500">{allSchemes.length}+</div>
          <div className="fin-card-sub">catalog ready</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Eligible For You</div>
          <div className="fin-card-value text-green-500">{eligibleCount}</div>
          <div className="fin-card-sub">from profile snapshot</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Already Credited</div>
          <div className="fin-card-value text-green-500">{creditedCount}</div>
          <div className="fin-card-sub">DBT settlements</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Upcoming Amount</div>
          <div className="fin-card-value text-yellow-500">{formatCurrency(upcomingAmount)}</div>
          <div className="fin-card-sub">pending + processing</div>
        </div>
      </div>

      <div className="fin-filter-row">
        <input
          className="fin-filter-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by scheme name..."
        />
        <select className="fin-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="credited">Credited</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
        </select>
        <select className="fin-filter-select" value={eligibilityFilter} onChange={(event) => setEligibilityFilter(event.target.value)}>
          <option value="all">All eligibility buckets</option>
          <option value="small-farmer">Small farmer</option>
          <option value="tenant">Tenant</option>
          <option value="women">Women farmers</option>
          <option value="youth">Youth farmers</option>
        </select>
      </div>

      <div className="fin-content-grid">
        {filteredSchemes.slice(0, 16).map((scheme) => (
          <div key={scheme.id} className="card fin-compare-card">
            <div className="fin-lender-name">{scheme.name}</div>
            <div className="fin-lender-type">{scheme.frequency}</div>
            <div className="fin-compare-row">
              <span className="fin-compare-label">Amount</span>
              <span className="fin-compare-value">{formatCurrency(scheme.amount)}</span>
            </div>
            <div className="fin-compare-row">
              <span className="fin-compare-label">Status</span>
              <span className={`fin-badge ${scheme.status === 'credited' ? 'green' : scheme.status === 'pending' ? 'yellow' : 'blue'}`}>{scheme.status}</span>
            </div>
            <div className="fin-compare-row"><span className="fin-compare-label">Eligibility</span><span className="fin-compare-value">{scheme.eligibilityBucket}</span></div>
            <div className="fin-compare-row"><span className="fin-compare-label">Next Window</span><span className="fin-compare-value">{scheme.nextPaymentWindow}</span></div>
            <div className="fin-pipeline">
              {scheme.timeline.map((step, i) => (
                <React.Fragment key={i}>
                  <div className={`fin-pipeline-step ${step.done ? 'done' : ''}`}>
                    <div className="fin-pipeline-dot">{step.done ? '✓' : i + 1}</div>
                    <div className="fin-pipeline-label">{step.step}</div>
                  </div>
                  {i < scheme.timeline.length - 1 && <div className={`fin-pipeline-line ${step.done ? 'done' : ''}`}></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="fin-card-sub" style={{ marginTop: '14px' }}>
        Showing {Math.min(filteredSchemes.length, 16)} of {filteredSchemes.length} matched schemes from 50+ coverage list.
      </div>
    </div>
  );
}

function TaxSection() {
  const [fy, setFy] = useState('2024-25');
  const [showSummary, setShowSummary] = useState(false);
  const [income, setIncome] = useState({
    cropRevenue: 760000,
    livestockRevenue: 85000,
    subsidyIncome: 22000,
    nonFarmIncome: 120000
  });

  const [deductions, setDeductions] = useState({
    seeds: 64000,
    fertilizer: 52000,
    labour: 143000,
    transport: 32000,
    interestPaid: 18000,
    depreciation: 42000
  });

  function onIncomeChange(key, value) {
    setIncome((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }

  function onDeductionChange(key, value) {
    setDeductions((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }

  const totalIncome = Object.values(income).reduce((sum, amount) => sum + amount, 0);
  const totalDeductions = Object.values(deductions).reduce((sum, amount) => sum + amount, 0);
  const agriIncome = income.cropRevenue + income.livestockRevenue + income.subsidyIncome;
  const agriExpenses = deductions.seeds + deductions.fertilizer + deductions.labour + deductions.transport;
  const agriNet = agriIncome - agriExpenses;
  const itr4Taxable = Math.max(0, income.nonFarmIncome - deductions.interestPaid - deductions.depreciation);
  const estimatedTax = itr4Taxable <= 300000 ? 0 : Math.round((itr4Taxable - 300000) * 0.05);

  function exportPDF() {
    const content = `RythuSphere — Tax Summary (ITR-4)\n${'='.repeat(45)}\nFY: ${fy}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\n--- REVENUE ---\nCrop Sales: ₹${CURRENCY.format(income.cropRevenue)}\nLivestock: ₹${CURRENCY.format(income.livestockRevenue)}\nSubsidy/DBT: ₹${CURRENCY.format(income.subsidyIncome)}\nNon-Farm: ₹${CURRENCY.format(income.nonFarmIncome)}\nTotal Revenue: ₹${CURRENCY.format(totalIncome)}\n\n--- DEDUCTIONS ---\nSeeds: ₹${CURRENCY.format(deductions.seeds)}\nFertilizer: ₹${CURRENCY.format(deductions.fertilizer)}\nLabour: ₹${CURRENCY.format(deductions.labour)}\nTransport: ₹${CURRENCY.format(deductions.transport)}\nInterest: ₹${CURRENCY.format(deductions.interestPaid)}\nDepreciation: ₹${CURRENCY.format(deductions.depreciation)}\nTotal Deductions: ₹${CURRENCY.format(totalDeductions)}\n\n--- ITR-4 SUMMARY ---\nNet Agri Income: ₹${CURRENCY.format(agriNet)} (Exempt)\nNon-Farm Taxable: ₹${CURRENCY.format(itr4Taxable)}\nEstimated Tax: ₹${CURRENCY.format(estimatedTax)}\n\nPowered by RythuSphere 🌾`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `RythuSphere_Tax_ITR4_${fy}.pdf`; a.click(); URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const rows = [['Item','Amount','Category'],['Crop Sales',income.cropRevenue,'Revenue'],['Livestock',income.livestockRevenue,'Revenue'],['Subsidy/DBT',income.subsidyIncome,'Revenue'],['Non-Farm',income.nonFarmIncome,'Revenue'],['Seeds',deductions.seeds,'Deduction'],['Fertilizer',deductions.fertilizer,'Deduction'],['Labour',deductions.labour,'Deduction'],['Transport',deductions.transport,'Deduction'],['Interest Paid',deductions.interestPaid,'Deduction'],['Depreciation',deductions.depreciation,'Deduction'],['','',''],['Total Revenue',totalIncome,'Summary'],['Total Deductions',totalDeductions,'Summary'],['Net Agri Income',agriNet,'Summary'],['Non-Farm Taxable',itr4Taxable,'Summary'],['Estimated Tax',estimatedTax,'Summary']];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `RythuSphere_Tax_${fy}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
        <h3 className="fin-section-title" style={{ margin:0 }}>📋 Tax Engine (ITR-4 Summary)</h3>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <select className="fin-filter-select" value={fy} onChange={e => setFy(e.target.value)} style={{ minWidth:'120px' }}>
            <option value="2024-25">FY 2024-25</option>
            <option value="2023-24">FY 2023-24</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowSummary(true)}>📊 Generate Tax Summary</button>
        </div>
      </div>

      <div className="fin-itr-grid">
        <div className="fin-itr-card">
          <h4>Revenue Aggregation</h4>
          <div className="fin-input-group"><span>Crop Sales</span><input className="fin-filter-input" type="number" value={income.cropRevenue} onChange={(e) => onIncomeChange('cropRevenue', e.target.value)} /></div>
          <div className="fin-input-group"><span>Livestock Revenue</span><input className="fin-filter-input" type="number" value={income.livestockRevenue} onChange={(e) => onIncomeChange('livestockRevenue', e.target.value)} /></div>
          <div className="fin-input-group"><span>Subsidy/DBT Income</span><input className="fin-filter-input" type="number" value={income.subsidyIncome} onChange={(e) => onIncomeChange('subsidyIncome', e.target.value)} /></div>
          <div className="fin-input-group"><span>Non-farm Income</span><input className="fin-filter-input" type="number" value={income.nonFarmIncome} onChange={(e) => onIncomeChange('nonFarmIncome', e.target.value)} /></div>
        </div>

        <div className="fin-itr-card">
          <h4>Deductions Aggregation</h4>
          <div className="fin-input-group"><span>Seeds</span><input className="fin-filter-input" type="number" value={deductions.seeds} onChange={(e) => onDeductionChange('seeds', e.target.value)} /></div>
          <div className="fin-input-group"><span>Fertilizer</span><input className="fin-filter-input" type="number" value={deductions.fertilizer} onChange={(e) => onDeductionChange('fertilizer', e.target.value)} /></div>
          <div className="fin-input-group"><span>Labour</span><input className="fin-filter-input" type="number" value={deductions.labour} onChange={(e) => onDeductionChange('labour', e.target.value)} /></div>
          <div className="fin-input-group"><span>Transport</span><input className="fin-filter-input" type="number" value={deductions.transport} onChange={(e) => onDeductionChange('transport', e.target.value)} /></div>
          <div className="fin-input-group"><span>Interest Paid</span><input className="fin-filter-input" type="number" value={deductions.interestPaid} onChange={(e) => onDeductionChange('interestPaid', e.target.value)} /></div>
          <div className="fin-input-group"><span>Depreciation</span><input className="fin-filter-input" type="number" value={deductions.depreciation} onChange={(e) => onDeductionChange('depreciation', e.target.value)} /></div>
        </div>
      </div>

      <div className="fin-summary-row" style={{ marginTop: '18px' }}>
        <div className="fin-summary-card">
          <div className="fin-card-label">Total Revenue</div>
          <div className="fin-card-value text-blue-500">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Total Deductions</div>
          <div className="fin-card-value text-yellow-500">{formatCurrency(totalDeductions)}</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Net Agri Income</div>
          <div className="fin-card-value text-green-500">{formatCurrency(agriNet)}</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Estimated Tax (ITR-4)</div>
          <div className="fin-card-value text-red-500">{formatCurrency(estimatedTax)}</div>
          {estimatedTax === 0 && <div className="fin-card-sub" style={{ color:'#34d399' }}>Below exemption limit ✅</div>}
        </div>
      </div>

      {showSummary && (
        <div className="fin-itr-card" style={{ marginTop:'16px', borderColor:'rgba(16,185,129,0.3)' }}>
          <h4>📊 Tax Summary — FY {fy}</h4>
          <table className="fin-table">
            <thead><tr><th>ITR-4 Line Item</th><th>Amount</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>Gross agricultural receipts</td><td>{formatCurrency(agriIncome)}</td><td>Exempt but report for disclosures</td></tr>
              <tr><td>Agricultural operating expenses</td><td>{formatCurrency(agriExpenses)}</td><td>Seeds + fertilizer + labour + transport</td></tr>
              <tr><td>Net agricultural income</td><td>{formatCurrency(agriNet)}</td><td>Use for financial planning</td></tr>
              <tr><td>Non-farm taxable income</td><td>{formatCurrency(itr4Taxable)}</td><td>After interest and depreciation</td></tr>
              <tr style={{ fontWeight:700, background:'rgba(16,185,129,0.06)' }}><td>Estimated tax payable</td><td>{formatCurrency(estimatedTax)}</td><td>{estimatedTax === 0 ? '₹0 — Below ₹3L exemption' : 'For planning only'}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="fin-actions" style={{ marginTop:'16px' }}>
        <button className="btn btn-outline" onClick={exportPDF}>📄 Export PDF for CA</button>
        <button className="btn btn-outline" onClick={exportCSV}>📊 Export Excel (CSV)</button>
      </div>
    </div>
  );
}

function AssetsSection() {
  const [assets, setAssets] = useState([
    {
      id: 'asset-1',
      type: 'Equipment',
      name: 'Mahindra 575 Tractor',
      purchaseValue: 560000,
      salvageValue: 120000,
      usefulLifeYears: 10,
      purchaseDate: '2022-04-01',
      status: 'Active',
      maintenanceLog: [{ date: '2026-03-10', note: 'Engine oil + filters', cost: 4200 }]
    },
    {
      id: 'asset-2',
      type: 'Irrigation',
      name: 'Drip Irrigation Kit',
      purchaseValue: 180000,
      salvageValue: 25000,
      usefulLifeYears: 8,
      purchaseDate: '2021-09-01',
      status: 'Active',
      maintenanceLog: [{ date: '2026-02-18', note: 'Line pressure check', cost: 1600 }]
    }
  ]);

  const [assetForm, setAssetForm] = useState({
    id: null,
    type: 'Equipment',
    name: '',
    purchaseValue: '',
    salvageValue: '',
    usefulLifeYears: '',
    purchaseDate: '',
    status: 'Active'
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    assetId: 'asset-1',
    date: '',
    note: '',
    cost: ''
  });

  function resetAssetForm() {
    setAssetForm({
      id: null,
      type: 'Equipment',
      name: '',
      purchaseValue: '',
      salvageValue: '',
      usefulLifeYears: '',
      purchaseDate: '',
      status: 'Active'
    });
  }

  function saveAsset(event) {
    event.preventDefault();
    if (!assetForm.name.trim()) return;

    const normalizedAsset = {
      ...assetForm,
      id: assetForm.id || `asset-${Date.now()}`,
      purchaseValue: Number(assetForm.purchaseValue || 0),
      salvageValue: Number(assetForm.salvageValue || 0),
      usefulLifeYears: Number(assetForm.usefulLifeYears || 1),
      maintenanceLog: assetForm.id
        ? assets.find((asset) => asset.id === assetForm.id)?.maintenanceLog || []
        : []
    };

    setAssets((prev) => {
      if (assetForm.id) {
        return prev.map((asset) => asset.id === assetForm.id ? normalizedAsset : asset);
      }
      return [normalizedAsset, ...prev];
    });
    resetAssetForm();
  }

  function editAsset(asset) {
    setAssetForm({
      id: asset.id,
      type: asset.type,
      name: asset.name,
      purchaseValue: asset.purchaseValue,
      salvageValue: asset.salvageValue,
      usefulLifeYears: asset.usefulLifeYears,
      purchaseDate: asset.purchaseDate,
      status: asset.status
    });
  }

  function deleteAsset(assetId) {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    setMaintenanceForm((prev) => prev.assetId === assetId ? { ...prev, assetId: '' } : prev);
    if (assetForm.id === assetId) {
      resetAssetForm();
    }
  }

  function addMaintenanceLog(event) {
    event.preventDefault();
    if (!maintenanceForm.assetId || !maintenanceForm.note.trim()) return;
    setAssets((prev) => prev.map((asset) => {
      if (asset.id !== maintenanceForm.assetId) return asset;
      return {
        ...asset,
        maintenanceLog: [
          {
            date: maintenanceForm.date || new Date().toISOString().slice(0, 10),
            note: maintenanceForm.note.trim(),
            cost: Number(maintenanceForm.cost || 0)
          },
          ...asset.maintenanceLog
        ]
      };
    }));
    setMaintenanceForm((prev) => ({ ...prev, note: '', cost: '' }));
  }

  const totalAssetValue = assets.reduce((sum, asset) => sum + Number(asset.purchaseValue || 0), 0);
  const totalDepreciation = assets.reduce((sum, asset) => sum + getAnnualDepreciation(asset), 0);
  const selectedAsset = assets.find((asset) => asset.id === maintenanceForm.assetId);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">🚜 Asset Register</h3>

      <div className="fin-summary-row">
        <div className="fin-summary-card">
          <div className="fin-card-label">Tracked Assets</div>
          <div className="fin-card-value text-blue-500">{assets.length}</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Purchase Value</div>
          <div className="fin-card-value text-green-500">{formatCurrency(totalAssetValue)}</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Annual Depreciation</div>
          <div className="fin-card-value text-yellow-500">{formatCurrency(totalDepreciation)}</div>
        </div>
      </div>

      <div className="fin-asset-layout">
        <form className="fin-itr-card" onSubmit={saveAsset}>
          <h4>{assetForm.id ? 'Edit Asset' : 'Add New Asset'}</h4>
          <div className="fin-input-group"><span>Asset Type</span>
            <select className="fin-filter-select" value={assetForm.type} onChange={(e) => setAssetForm((prev) => ({ ...prev, type: e.target.value }))}>
              <option value="Equipment">Equipment</option>
              <option value="Land">Land</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Storage">Storage</option>
            </select>
          </div>
          <div className="fin-input-group"><span>Name / Model</span><input className="fin-filter-input" value={assetForm.name} onChange={(e) => setAssetForm((prev) => ({ ...prev, name: e.target.value }))} /></div>
          <div className="fin-input-group"><span>Purchase Value</span><input className="fin-filter-input" type="number" value={assetForm.purchaseValue} onChange={(e) => setAssetForm((prev) => ({ ...prev, purchaseValue: e.target.value }))} /></div>
          <div className="fin-input-group"><span>Salvage Value</span><input className="fin-filter-input" type="number" value={assetForm.salvageValue} onChange={(e) => setAssetForm((prev) => ({ ...prev, salvageValue: e.target.value }))} /></div>
          <div className="fin-input-group"><span>Useful Life (years)</span><input className="fin-filter-input" type="number" value={assetForm.usefulLifeYears} onChange={(e) => setAssetForm((prev) => ({ ...prev, usefulLifeYears: e.target.value }))} /></div>
          <div className="fin-input-group"><span>Purchase Date</span><input className="fin-filter-input" type="date" value={assetForm.purchaseDate} onChange={(e) => setAssetForm((prev) => ({ ...prev, purchaseDate: e.target.value }))} /></div>
          <div className="fin-actions">
            <button type="button" className="btn btn-outline" onClick={resetAssetForm}>Reset</button>
            <button type="submit" className="btn btn-primary">{assetForm.id ? 'Update Asset' : 'Add Asset'}</button>
          </div>
        </form>

        <div className="fin-itr-card">
          <h4>Maintenance Log</h4>
          <form onSubmit={addMaintenanceLog}>
            <div className="fin-input-group">
              <span>Select Asset</span>
              <select className="fin-filter-select" value={maintenanceForm.assetId} onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, assetId: e.target.value }))}>
                {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
              </select>
            </div>
            <div className="fin-input-group"><span>Date</span><input className="fin-filter-input" type="date" value={maintenanceForm.date} onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, date: e.target.value }))} /></div>
            <div className="fin-input-group"><span>Activity</span><input className="fin-filter-input" value={maintenanceForm.note} onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, note: e.target.value }))} /></div>
            <div className="fin-input-group"><span>Cost</span><input className="fin-filter-input" type="number" value={maintenanceForm.cost} onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, cost: e.target.value }))} /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>+ Add Maintenance Entry</button>
          </form>

          <div className="fin-maintenance-list">
            {(selectedAsset?.maintenanceLog || []).slice(0, 6).map((entry, index) => (
              <div key={`${entry.date}-${index}`} className="fin-compare-row">
                <span className="fin-compare-label">{entry.date} — {entry.note}</span>
                <span className="fin-compare-value">{formatCurrency(entry.cost)}</span>
              </div>
            ))}
            {(selectedAsset?.maintenanceLog || []).length === 0 && (
              <div className="fin-card-sub">No maintenance entries yet for this asset.</div>
            )}
          </div>
        </div>
      </div>

      <table className="fin-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Asset Type</th>
            <th>Name/Model</th>
            <th>Purchase Value</th>
            <th>Book Value</th>
            <th>Annual Depreciation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>{asset.type}</td>
              <td>{asset.name}</td>
              <td>{formatCurrency(asset.purchaseValue)}</td>
              <td>{formatCurrency(getBookValue(asset))}</td>
              <td>{formatCurrency(getAnnualDepreciation(asset))}</td>
              <td><span className={`fin-badge ${asset.status === 'Active' ? 'green' : 'yellow'}`}>{asset.status}</span></td>
              <td>
                <div className="fin-actions-inline">
                  <button className="btn btn-outline fin-mini-btn" onClick={() => editAsset(asset)}>Edit</button>
                  <button className="btn fin-mini-btn" onClick={() => deleteAsset(asset.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HealthScoreSection({ profile }) {
  const kccData = prefillKCCApplication(profile);
  const subsidyData = getSubsidyStatus();
  const uploadedDocs = kccData.documents.filter((doc) => doc.status === 'uploaded').length;
  const documentationScore = Math.round((uploadedDocs / Math.max(kccData.documents.length, 1)) * 100);
  const debtUtilizationScore = Math.max(20, 100 - Math.round(((kccData.eligibleAmount * 0.42) / Math.max(kccData.eligibleAmount, 1)) * 100));
  const subsidyScore = Math.round((subsidyData.filter((scheme) => scheme.status === 'credited').length / Math.max(subsidyData.length, 1)) * 100);
  const savingsDisciplineScore = Math.min(95, 55 + Math.round(Number(profile?.total_land || 2) * 4));
  const insuranceCoverageScore = 78;

  const categoryScores = [
    { key: 'Debt discipline', score: debtUtilizationScore },
    { key: 'Savings discipline', score: savingsDisciplineScore },
    { key: 'Insurance coverage', score: insuranceCoverageScore },
    { key: 'Subsidy utilization', score: subsidyScore },
    { key: 'Documentation', score: documentationScore }
  ];

  const weightedScore = Math.round(
    (debtUtilizationScore * 0.25) +
    (savingsDisciplineScore * 0.2) +
    (insuranceCoverageScore * 0.2) +
    (subsidyScore * 0.15) +
    (documentationScore * 0.2)
  );

  const score = Math.max(0, Math.min(100, weightedScore));
  const gaugeCircumference = 251.2;
  const dashOffset = gaugeCircumference - ((score / 100) * gaugeCircumference);
  const aiTips = categoryScores
    .filter((item) => item.score < 70)
    .map((item) => {
      if (item.key === 'Debt discipline') return 'Prioritize EMI and KCC interest payments before due dates to avoid higher rates.';
      if (item.key === 'Savings discipline') return 'Move at least 8-10% of monthly inflow to emergency savings.';
      if (item.key === 'Insurance coverage') return 'Expand PMFBY + equipment cover for high-value crop cycles.';
      if (item.key === 'Subsidy utilization') return 'Track pending DBT applications and complete eKYC where pending.';
      return 'Upload missing bank/passbook/land documents to improve loan readiness.';
    });

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">❤️ Financial Health Score</h3>
      <div className="fin-gauge-wrap">
        <div className="fin-gauge">
          <svg width="180" height="180" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="fin-gauge-bg" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="8"
              stroke={score >= 80 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444'}
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={dashOffset}
              className="fin-gauge-fill green"
            />
          </svg>
          <div className="fin-gauge-label">
            <div className="fin-gauge-score">{score}</div>
            <div className="fin-gauge-text">{getHealthLabel(score)}</div>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Composite score based on debt, savings, insurance, subsidy realization, and document readiness.
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Category Breakdown</h4>
        {categoryScores.map((item) => (
          <div key={item.key} className="fin-breakdown-row">
            <div className="fin-compare-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span className="fin-compare-label">{item.key}</span>
              <span className="fin-compare-value">{item.score}/100</span>
            </div>
            <div className="fin-util-bar">
              <div className={`fin-util-fill ${getToneByPercent(100 - item.score)}`} style={{ width: `${item.score}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="fin-itr-card" style={{ marginTop: '16px' }}>
        <h4>🤖 AI Improvement Tips</h4>
        {aiTips.length === 0 ? (
          <div className="fin-card-sub">Great job. Keep maintaining timely repayments and documentation hygiene.</div>
        ) : (
          <ul className="fin-tip-list">
            {aiTips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        )}
      </div>

      <div className="fin-itr-card" style={{ marginTop: '16px', borderColor: 'rgba(59,130,246,0.2)' }}>
        <h4>👥 Peer Comparison — Farmers in Guntur with similar land</h4>
        <div className="fin-card-sub" style={{ marginBottom: '14px' }}>Based on 142 farmers in Guntur district with 2-5 acre holdings</div>
        {[
          { key: 'Debt discipline', yours: debtUtilizationScore, peer: 62 },
          { key: 'Savings discipline', yours: savingsDisciplineScore, peer: 48 },
          { key: 'Insurance coverage', yours: insuranceCoverageScore, peer: 55 },
          { key: 'Subsidy utilization', yours: subsidyScore, peer: 41 },
          { key: 'Documentation', yours: documentationScore, peer: 38 }
        ].map(item => (
          <div key={item.key} style={{ marginBottom: '10px' }}>
            <div className="fin-compare-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span className="fin-compare-label">{item.key}</span>
              <span style={{ fontSize:'0.75rem' }}>
                <span style={{ color: item.yours >= item.peer ? '#34d399' : '#f87171', fontWeight:700 }}>You: {item.yours}</span>
                <span style={{ color:'var(--text-muted)', margin:'0 6px' }}>vs</span>
                <span style={{ color:'#93c5fd' }}>Avg: {item.peer}</span>
              </span>
            </div>
            <div style={{ display:'flex', gap:'4px', marginTop:'4px' }}>
              <div style={{ flex:1, height:'6px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${item.yours}%`, borderRadius:'3px', background: item.yours >= item.peer ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)' }}></div>
              </div>
              <div style={{ flex:1, height:'6px', borderRadius:'3px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${item.peer}%`, borderRadius:'3px', background:'linear-gradient(90deg,rgba(59,130,246,0.4),rgba(59,130,246,0.7))' }}></div>
              </div>
            </div>
          </div>
        ))}
        <div style={{ display:'flex', gap:'16px', marginTop:'12px', fontSize:'0.72rem' }}>
          <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:10, height:10, borderRadius:2, background:'#10b981', display:'inline-block' }}></span> Your Score</span>
          <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:10, height:10, borderRadius:2, background:'rgba(59,130,246,0.6)', display:'inline-block' }}></span> District Average</span>
        </div>
      </div>
    </div>
  );
}

function LiteracySection() {
  const [completedVideos, setCompletedVideos] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quizRewardClaimed, setQuizRewardClaimed] = useState(false);

  function markWatched(videoId) {
    setCompletedVideos((prev) => {
      if (prev.includes(videoId)) return prev;
      setCoins((coinTotal) => coinTotal + 10);
      return [...prev, videoId];
    });
  }

  function submitQuiz() {
    const correct = QUIZ_QUESTIONS.filter((question) => quizAnswers[question.id] === question.answer).length;
    const scorePercent = Math.round((correct / QUIZ_QUESTIONS.length) * 100);
    setQuizScore(scorePercent);
    setQuizSubmitted(true);
    if (!quizRewardClaimed) {
      const reward = scorePercent >= 80 ? 120 : scorePercent >= 50 ? 60 : 20;
      setCoins((coinTotal) => coinTotal + reward);
      setQuizRewardClaimed(true);
    }
  }

  const certificates = [
    { id: 'cert-1', title: 'Financial Basics Certificate', unlocked: completedVideos.length >= 3, rule: 'Watch any 3 videos' },
    { id: 'cert-2', title: 'KCC Readiness Certificate', unlocked: quizScore >= 75, rule: 'Score 75%+ in quiz' },
    { id: 'cert-3', title: 'DBT Navigator Certificate', unlocked: completedVideos.length >= 5 && quizScore >= 50, rule: '5 videos + 50% quiz score' }
  ];

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">📚 Financial Literacy</h3>
      <div className="fin-summary-row">
        <div className="fin-summary-card">
          <div className="fin-card-label">Learning Coins</div>
          <div className="fin-card-value text-yellow-500">{coins} 🪙</div>
          <div className="fin-card-sub">earned from videos + quiz</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Videos Completed</div>
          <div className="fin-card-value text-blue-500">{completedVideos.length}/{FINANCIAL_LITERACY_VIDEOS.length}</div>
          <div className="fin-card-sub">track learning streak</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-card-label">Quiz Score</div>
          <div className="fin-card-value text-green-500">{quizSubmitted ? `${quizScore}%` : 'Not attempted'}</div>
          <div className="fin-card-sub">latest assessment</div>
        </div>
      </div>

      <div className="fin-content-grid">
        {FINANCIAL_LITERACY_VIDEOS.map((video) => (
          <div key={video.id} className="fin-video-card">
            <div className="fin-video-thumb">{video.thumbnail}</div>
            <div className="fin-video-info">
              <div className="fin-video-title">{video.title}</div>
              <div className="fin-video-meta">
                <span>⏱️ {video.duration}</span>
                <span>👁️ {video.views.toLocaleString()}</span>
                <span className="fin-badge blue">{video.category}</span>
              </div>
              <button
                className={`btn ${completedVideos.includes(video.id) ? 'btn-outline' : 'btn-primary'}`}
                style={{ marginTop: '10px', width: '100%' }}
                onClick={() => markWatched(video.id)}
              >
                {completedVideos.includes(video.id) ? '✓ Watched' : '+10 Coins • Mark Watched'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fin-itr-card" style={{ marginTop: '18px' }}>
        <h4>Quick Quiz</h4>
        {QUIZ_QUESTIONS.map((question) => (
          <div key={question.id} className="fin-quiz-block">
            <div className="fin-card-sub" style={{ marginBottom: '6px', color: 'var(--text-primary)' }}>{question.question}</div>
            {question.options.map((option) => (
              <label key={option} className="fin-quiz-option">
                <input
                  type="radio"
                  name={question.id}
                  checked={quizAnswers[question.id] === option}
                  onChange={() => setQuizAnswers((prev) => ({ ...prev, [question.id]: option }))}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        ))}
        <div className="fin-actions">
          <button className="btn btn-primary" onClick={submitQuiz}>Submit Quiz</button>
          {quizSubmitted && <span className="fin-badge green">Score: {quizScore}%</span>}
        </div>
      </div>

      <div style={{ marginTop: '18px' }}>
        <h4 style={{ marginBottom: '10px' }}>Certificates</h4>
        <div className="fin-certificate-grid">
          {certificates.map((certificate) => (
            <div key={certificate.id} className={`fin-certificate-card ${certificate.unlocked ? 'unlocked' : ''}`}>
              <div className="fin-lender-name">{certificate.unlocked ? '🏅' : '🔒'} {certificate.title}</div>
              <div className="fin-card-sub">{certificate.rule}</div>
              <span className={`fin-badge ${certificate.unlocked ? 'green' : 'yellow'}`}>
                {certificate.unlocked ? 'Unlocked' : 'In progress'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
