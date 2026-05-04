import React, { useState, useMemo } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const INCOME_DATA = [
  { month:'Jan', paddy:45000, cotton:0, chilli:12000, other:5000 },
  { month:'Feb', paddy:38000, cotton:0, chilli:18000, other:8000 },
  { month:'Mar', paddy:52000, cotton:15000, chilli:22000, other:6000 },
  { month:'Apr', paddy:48000, cotton:28000, chilli:8000, other:4000 },
  { month:'May', paddy:0, cotton:35000, chilli:0, other:12000 },
  { month:'Jun', paddy:0, cotton:42000, chilli:0, other:9000 },
  { month:'Jul', paddy:15000, cotton:38000, chilli:5000, other:7000 },
  { month:'Aug', paddy:22000, cotton:25000, chilli:14000, other:6000 },
  { month:'Sep', paddy:35000, cotton:18000, chilli:20000, other:8000 },
  { month:'Oct', paddy:55000, cotton:12000, chilli:25000, other:10000 },
  { month:'Nov', paddy:62000, cotton:8000, chilli:30000, other:7000 },
  { month:'Dec', paddy:58000, cotton:5000, chilli:15000, other:9000 },
];

const EXPENSE_DATA = [
  { month:'Jan', seeds:5000, fertilizer:8000, labour:12000, equipment:3000, transport:4000, other:2000 },
  { month:'Feb', seeds:3000, fertilizer:10000, labour:15000, equipment:2000, transport:3000, other:2500 },
  { month:'Mar', seeds:8000, fertilizer:12000, labour:18000, equipment:5000, transport:5000, other:3000 },
  { month:'Apr', seeds:2000, fertilizer:9000, labour:14000, equipment:4000, transport:4500, other:2000 },
  { month:'May', seeds:6000, fertilizer:7000, labour:10000, equipment:8000, transport:3500, other:2500 },
  { month:'Jun', seeds:4000, fertilizer:11000, labour:16000, equipment:3000, transport:4000, other:3000 },
  { month:'Jul', seeds:3000, fertilizer:8000, labour:12000, equipment:2500, transport:3000, other:2000 },
  { month:'Aug', seeds:5000, fertilizer:9000, labour:13000, equipment:3500, transport:3500, other:2500 },
  { month:'Sep', seeds:2000, fertilizer:10000, labour:15000, equipment:4000, transport:4000, other:3000 },
  { month:'Oct', seeds:7000, fertilizer:12000, labour:18000, equipment:6000, transport:5000, other:3500 },
  { month:'Nov', seeds:4000, fertilizer:8000, labour:14000, equipment:3000, transport:4500, other:2500 },
  { month:'Dec', seeds:3000, fertilizer:7000, labour:11000, equipment:2500, transport:3000, other:2000 },
];

const CROP_PL = [
  { crop:'Paddy', icon:'🌾', income:430000, expense:185000, area:'5 acres', season:'Kharif+Rabi', yield:'22 Q/acre' },
  { crop:'Cotton', icon:'🌿', income:226000, expense:142000, area:'3 acres', season:'Kharif', yield:'8 Q/acre' },
  { crop:'Chilli', icon:'🌶️', income:169000, expense:98000, area:'2 acres', season:'Rabi', yield:'15 Q/acre' },
  { crop:'Groundnut', icon:'🥜', income:85000, expense:62000, area:'2 acres', season:'Kharif', yield:'12 Q/acre' },
];

const rs = {
  tag: (bg,c) => ({ fontSize:'0.65rem',padding:'2px 8px',borderRadius:999,background:bg,color:c,fontWeight:600 }),
};

function BarChart({ data, maxVal, barColor, label }) {
  return (
    <div style={{ display:'flex',alignItems:'flex-end',gap:6,height:180,padding:'0 4px' }}>
      {data.map((d,i) => {
        const h = (d.value / maxVal) * 160;
        return (
          <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
            <div style={{ fontSize:'0.58rem',color:'var(--text-muted)',fontWeight:600 }}>₹{(d.value/1000).toFixed(0)}k</div>
            <div style={{ width:'100%',maxWidth:28,height:h,borderRadius:'6px 6px 2px 2px',background:barColor,transition:'height .5s ease',animation:`barGrow .5s ease ${i*0.04}s both`,position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(255,255,255,0.15),transparent)' }} />
            </div>
            <div style={{ fontSize:'0.58rem',color:'var(--text-muted)' }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function downloadPDF(range, cropData) {
  const content = `
%PDF-1.4 RythuSphere P&L Report
=== RythuSphere — Profit & Loss Report ===
Period: ${range}
Generated: ${new Date().toLocaleDateString('en-IN')}

--- Summary ---
Total Income: ₹${cropData.reduce((s,c) => s+c.income,0).toLocaleString('en-IN')}
Total Expenses: ₹${cropData.reduce((s,c) => s+c.expense,0).toLocaleString('en-IN')}
Net Profit: ₹${cropData.reduce((s,c) => s+(c.income-c.expense),0).toLocaleString('en-IN')}

--- Crop-wise Breakdown ---
${cropData.map(c => `${c.crop}: Income ₹${c.income.toLocaleString('en-IN')} | Expense ₹${c.expense.toLocaleString('en-IN')} | Profit ₹${(c.income-c.expense).toLocaleString('en-IN')}`).join('\n')}

Powered by RythuSphere 🌾
  `;
  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `RythuSphere_PL_Report_${range.replace(/\s/g,'_')}.pdf`; a.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(range, incomeData, expenseData, cropData) {
  let csv = 'RythuSphere - P&L Report\n';
  csv += `Period: ${range}\n\n`;
  csv += 'Month,Paddy Income,Cotton Income,Chilli Income,Other Income,Total Income,Seeds,Fertilizer,Labour,Equipment,Transport,Other Expense,Total Expense,Net Profit\n';
  incomeData.forEach((inc,i) => {
    const exp = expenseData[i];
    const ti = inc.paddy+inc.cotton+inc.chilli+inc.other;
    const te = exp.seeds+exp.fertilizer+exp.labour+exp.equipment+exp.transport+exp.other;
    csv += `${inc.month},${inc.paddy},${inc.cotton},${inc.chilli},${inc.other},${ti},${exp.seeds},${exp.fertilizer},${exp.labour},${exp.equipment},${exp.transport},${exp.other},${te},${ti-te}\n`;
  });
  csv += '\nCrop-wise Summary\nCrop,Income,Expense,Profit,Area,Season,Yield\n';
  cropData.forEach(c => { csv += `${c.crop},${c.income},${c.expense},${c.income-c.expense},${c.area},${c.season},${c.yield}\n`; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `RythuSphere_PL_Report_${range.replace(/\s/g,'_')}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [range, setRange] = useState('Last 3 months');
  const [dlOpen, setDlOpen] = useState(false);

  const rangeMonths = useMemo(() => {
    if (range === 'Last 3 months') return 3;
    if (range === 'Last 6 months') return 6;
    return 12;
  }, [range]);

  const filteredIncome = INCOME_DATA.slice(-rangeMonths);
  const filteredExpense = EXPENSE_DATA.slice(-rangeMonths);

  const totalIncome = filteredIncome.reduce((s,m) => s+m.paddy+m.cotton+m.chilli+m.other, 0);
  const totalExpense = filteredExpense.reduce((s,m) => s+m.seeds+m.fertilizer+m.labour+m.equipment+m.transport+m.other, 0);
  const netProfit = totalIncome - totalExpense;

  const incomeChartData = filteredIncome.map(m => ({ label:m.month, value:m.paddy+m.cotton+m.chilli+m.other }));
  const expenseChartData = filteredExpense.map(m => ({ label:m.month, value:m.seeds+m.fertilizer+m.labour+m.equipment+m.transport+m.other }));
  const maxChart = Math.max(...incomeChartData.map(d=>d.value), ...expenseChartData.map(d=>d.value));

  return (
    <div className="animated">
      <style>{`@keyframes barGrow{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}`}</style>
      <div className="section-header">
        <div>
          <div className="section-title">📊 Reports & Analytics</div>
          <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginTop:2 }}>Profit & Loss • Crop Analysis • Financial Reports</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:12,marginBottom:16,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',justifyContent:'space-between' }}>
        <div style={{ display:'flex',gap:6 }}>
          {['Last 3 months','Last 6 months','Full Year'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding:'7px 14px',borderRadius:999,fontSize:'0.73rem',fontWeight:600,cursor:'pointer',border:'1px solid',borderColor:range===r?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.1)',background:range===r?'rgba(59,130,246,0.15)':'transparent',color:range===r?'#60a5fa':'var(--text-secondary)',transition:'all .15s' }}>{r}</button>
          ))}
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={() => setDlOpen(!dlOpen)} style={{ padding:'8px 18px',borderRadius:10,background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',border:'none',fontWeight:700,fontSize:'0.8rem',cursor:'pointer' }}>⬇️ Download Report</button>
          {dlOpen && (
            <div style={{ position:'absolute',top:42,right:0,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 10px 30px rgba(0,0,0,0.4)',overflow:'hidden',zIndex:100,minWidth:180 }}>
              <div style={{ padding:'10px 16px',cursor:'pointer',fontSize:'0.82rem',color:'var(--text-primary)',borderBottom:'1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                onClick={() => { downloadPDF(range, CROP_PL); setDlOpen(false); }}>📄 Download PDF</div>
              <div style={{ padding:'10px 16px',cursor:'pointer',fontSize:'0.82rem',color:'var(--text-primary)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                onClick={() => { downloadExcel(range, filteredIncome, filteredExpense, CROP_PL); setDlOpen(false); }}>📊 Download Excel (CSV)</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="card" style={{ padding:20,marginBottom:16 }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14 }}>
          <div style={{ textAlign:'center',padding:18,borderRadius:14,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:6 }}>💰 Total Income</div>
            <div style={{ fontSize:'1.6rem',fontWeight:800,color:'#34d399' }}>₹{(totalIncome/1000).toFixed(0)}K</div>
            <div style={{ fontSize:'0.68rem',color:'#6ee7b7',marginTop:4 }}>↑ 12% vs prev period</div>
          </div>
          <div style={{ textAlign:'center',padding:18,borderRadius:14,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:6 }}>💳 Total Expenses</div>
            <div style={{ fontSize:'1.6rem',fontWeight:800,color:'#f87171' }}>₹{(totalExpense/1000).toFixed(0)}K</div>
            <div style={{ fontSize:'0.68rem',color:'#fca5a5',marginTop:4 }}>↑ 5% vs prev period</div>
          </div>
          <div style={{ textAlign:'center',padding:18,borderRadius:14,background:netProfit>0?'rgba(59,130,246,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${netProfit>0?'rgba(59,130,246,0.15)':'rgba(239,68,68,0.15)'}` }}>
            <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:6 }}>📈 Net Profit</div>
            <div style={{ fontSize:'1.6rem',fontWeight:800,color:netProfit>0?'#60a5fa':'#f87171' }}>₹{(netProfit/1000).toFixed(0)}K</div>
            <div style={{ fontSize:'0.68rem',color:netProfit>0?'#93c5fd':'#fca5a5',marginTop:4 }}>Margin: {(netProfit/totalIncome*100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Income vs Expense Chart */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16 }}>
        <div className="card" style={{ padding:18 }}>
          <div style={{ fontSize:'0.85rem',fontWeight:700,color:'var(--text-primary)',marginBottom:14 }}>💰 Income Trend</div>
          <BarChart data={incomeChartData} maxVal={maxChart} barColor="linear-gradient(180deg,#10b981,#059669)" label="Income" />
        </div>
        <div className="card" style={{ padding:18 }}>
          <div style={{ fontSize:'0.85rem',fontWeight:700,color:'var(--text-primary)',marginBottom:14 }}>💳 Expense Trend</div>
          <BarChart data={expenseChartData} maxVal={maxChart} barColor="linear-gradient(180deg,#ef4444,#dc2626)" label="Expense" />
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="card" style={{ padding:18,marginBottom:16 }}>
        <div style={{ fontSize:'0.85rem',fontWeight:700,color:'var(--text-primary)',marginBottom:14 }}>📅 Monthly Breakdown</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.78rem' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Month','Income','Expense','Profit','Margin'].map(h => (
                  <th key={h} style={{ padding:'8px 12px',textAlign:'left',color:'var(--text-muted)',fontWeight:600,fontSize:'0.7rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredIncome.map((inc,i) => {
                const exp = filteredExpense[i];
                const ti = inc.paddy+inc.cotton+inc.chilli+inc.other;
                const te = exp.seeds+exp.fertilizer+exp.labour+exp.equipment+exp.transport+exp.other;
                const pr = ti-te;
                return (
                  <tr key={inc.month} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'10px 12px',fontWeight:600,color:'var(--text-primary)' }}>{inc.month}</td>
                    <td style={{ padding:'10px 12px',color:'#34d399' }}>₹{ti.toLocaleString()}</td>
                    <td style={{ padding:'10px 12px',color:'#f87171' }}>₹{te.toLocaleString()}</td>
                    <td style={{ padding:'10px 12px',color:pr>0?'#60a5fa':'#f87171',fontWeight:700 }}>₹{pr.toLocaleString()}</td>
                    <td style={{ padding:'10px 12px' }}><span style={rs.tag(pr>0?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)',pr>0?'#6ee7b7':'#fca5a5')}>{(pr/ti*100).toFixed(1)}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop-wise P&L */}
      <div className="card" style={{ padding:18 }}>
        <div style={{ fontSize:'0.85rem',fontWeight:700,color:'var(--text-primary)',marginBottom:14 }}>🌾 Crop-wise P&L Analysis</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14 }}>
          {CROP_PL.map(c => {
            const profit = c.income - c.expense;
            const margin = (profit/c.income*100).toFixed(1);
            return (
              <div key={c.crop} style={{ padding:16,borderRadius:14,background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',transition:'all .2s' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                  <div style={{ fontSize:'1rem',fontWeight:700,color:'var(--text-primary)' }}>{c.icon} {c.crop}</div>
                  <span style={rs.tag('rgba(139,92,246,0.12)','#c4b5fd')}>{c.season}</span>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10 }}>
                  <div><div style={{ fontSize:'0.62rem',color:'var(--text-muted)' }}>Income</div><div style={{ fontWeight:700,color:'#34d399',fontSize:'0.88rem' }}>₹{(c.income/1000).toFixed(0)}K</div></div>
                  <div><div style={{ fontSize:'0.62rem',color:'var(--text-muted)' }}>Expense</div><div style={{ fontWeight:700,color:'#f87171',fontSize:'0.88rem' }}>₹{(c.expense/1000).toFixed(0)}K</div></div>
                </div>
                <div style={{ height:6,borderRadius:4,background:'rgba(255,255,255,0.06)',overflow:'hidden',marginBottom:8 }}>
                  <div style={{ height:'100%',width:`${margin}%`,borderRadius:4,background:'linear-gradient(90deg,#10b981,#3b82f6)' }} />
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.72rem' }}>
                  <span style={{ color:'#60a5fa',fontWeight:700 }}>Profit: ₹{(profit/1000).toFixed(0)}K</span>
                  <span style={{ color:'var(--text-muted)' }}>{margin}% margin</span>
                </div>
                <div style={{ display:'flex',gap:6,marginTop:8 }}>
                  <span style={rs.tag('rgba(59,130,246,0.1)','#93c5fd')}>{c.area}</span>
                  <span style={rs.tag('rgba(245,158,11,0.1)','#fbbf24')}>{c.yield}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
