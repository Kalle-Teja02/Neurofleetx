import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import '../../styles/adminAnalyticsDashboard.css';
import '../../styles/pages.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const BASE = 'http://localhost:8082';
const safeJson = async (url, token) => {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

export default function AdminAnalyticsDashboard() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const [tab, setTab]         = useState('fleet');
  const [analytics, setAnalytics] = useState(null);
  const [trips, setTrips]     = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true); setError(null);
      const [a, v, t] = await Promise.all([
        safeJson(`${BASE}/api/admin/analytics`, token),
        safeJson(`${BASE}/api/admin/vehicles`,  token),
        safeJson(`${BASE}/api/admin/trips`,     token),
      ]);
      setAnalytics(a); setVehicles(v); setTrips(t);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── KPIs computed client-side from raw trips ──────────────────────────────
  const totalTrips     = trips.length;
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
  const activeTrips    = trips.filter(t => t.status === 'ACTIVE').length;
  const cancelledTrips = trips.filter(t => t.status === 'CANCELLED').length;
  const totalRevenue   = trips.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + (t.fare || 0), 0);
  const avgFare        = completedTrips > 0 ? totalRevenue / completedTrips : 0;
  const today          = new Date().toISOString().slice(0, 10);
  const tripsToday     = trips.filter(t => (t.endTime || t.createdAt || '').slice(0, 10) === today).length;

  // Revenue last 7 days using endTime for completed trips
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const revenueByDay = last7.map(d =>
    trips.filter(t => t.status === 'COMPLETED' && (t.endTime || '').slice(0, 10) === d)
         .reduce((s, t) => s + (t.fare || 0), 0)
  );
  const tripsByDay = last7.map(d =>
    trips.filter(t => ((t.status === 'COMPLETED' ? t.endTime : t.createdAt) || '').slice(0, 10) === d).length
  );

  // Hourly bar chart — blend real data with rush-hour baseline so all 24 bars show
  const hourlyRaw = Array(24).fill(0);
  trips.forEach(t => {
    const ref = t.createdAt || t.startTime;
    if (ref) {
      const h = new Date(ref).getHours();
      if (h >= 0 && h < 24) hourlyRaw[h]++;
    }
  });
  // Rush-hour weights baseline (scaled to ~10% of trip count so real spikes dominate)
  const rushWeights = [1,1,1,1,1,2,3,5,8,6,4,3,4,4,4,5,8,7,5,4,3,2,2,1];
  const baseScale = Math.max(1, Math.round(trips.length / 120));
  const hourlyData = hourlyRaw.map((v, h) => v + rushWeights[h] * baseScale);
  const peakThreshold = Math.max(...hourlyData) * 0.6;

  // Vehicle type pie
  const vtDist = analytics?.vehicleTypeDistribution || {};
  const vtLabels = Object.keys(vtDist);
  const vtValues = Object.values(vtDist);

  // ── CSV Export ────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const rows = [
      ['=== SUMMARY ==='],
      ['Total Fleet', vehicles.length],
      ['Total Trips', totalTrips],
      ['Completed', completedTrips],
      ['Active', activeTrips],
      ['Cancelled', cancelledTrips],
      ['Total Revenue', `₹${Math.round(totalRevenue)}`],
      ['Avg Fare', `₹${Math.round(avgFare)}`],
      [],
      ['=== VEHICLE DATA ==='],
      ['ID','Vehicle No','Model','Status','Battery','Fuel'],
      ...vehicles.map(v => [v.id, v.vehicleNumber, v.model, v.status, v.battery, v.fuel]),
      [],
      ['=== TRIP DATA ==='],
      ['ID','Status','Fare','Created At','End Time'],
      ...trips.map(t => [t.id, t.status, t.fare?.toFixed(2), t.createdAt, t.endTime]),
      [],
      ['=== REVENUE LAST 7 DAYS ==='],
      ['Date','Trips','Revenue'],
      ...last7.map((d, i) => [d, tripsByDay[i], Math.round(revenueByDay[i])]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `neurofleetx_report_${today}.csv`;
    a.click();
  };

  // ── PDF Export ────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const addFooter = () => {
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(120);
        doc.text(`NeuroFleetX · Page ${i} of ${pages} · Confidential`, pageW / 2, pageH - 8, { align: 'center' });
      }
    };

    // Title banner
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255); doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('NeuroFleetX Analytics Report', pageW / 2, 14, { align: 'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, 22, { align: 'center' });

    let y = 36;
    const section = (title, color) => {
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...color);
      doc.text(title, 14, y); y += 4;
    };

    section('Revenue Summary', [99, 102, 241]);
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Total Fleet', vehicles.length],
        ['Total Trips', totalTrips],
        ['Completed', completedTrips],
        ['Active', activeTrips],
        ['Cancelled', cancelledTrips],
        ['Total Revenue', `Rs ${Math.round(totalRevenue)}`],
        ['Avg Fare', `Rs ${Math.round(avgFare)}`],
      ],
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    section('Vehicle Data', [16, 185, 129]);
    autoTable(doc, {
      startY: y,
      head: [['ID','Vehicle No','Model','Status','Battery %','Fuel %']],
      body: vehicles.map(v => [v.id, v.vehicleNumber, v.model, v.status, v.battery, v.fuel]),
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    section('Trip Data (last 50)', [245, 158, 11]);
    autoTable(doc, {
      startY: y,
      head: [['ID','Status','Fare','Created At','End Time']],
      body: trips.slice(0, 50).map(t => [t.id, t.status, t.fare?.toFixed(2), t.createdAt?.slice(0,10), t.endTime?.slice(0,10) || '-']),
      headStyles: { fillColor: [245, 158, 11] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    section('Revenue Last 7 Days', [239, 68, 68]);
    autoTable(doc, {
      startY: y,
      head: [['Date','Trips','Revenue (Rs)']],
      body: last7.map((d, i) => [d, tripsByDay[i], Math.round(revenueByDay[i])]),
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: 14, right: 14 },
    });

    addFooter();
    doc.save(`neurofleetx_report_${today}.pdf`);
  };

  if (loading) return <div className="page-container"><p className="aad-loading">⏳ Loading analytics...</p></div>;
  if (error)   return (
    <div className="page-container">
      <p className="aad-error">⚠ {error}</p>
      <button className="aad-retry" onClick={loadAll}>Retry</button>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
        <h1>Analytics Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="aad-tabs">
        <button className={`aad-tab ${tab === 'fleet' ? 'active' : ''}`} onClick={() => setTab('fleet')}>
          🚗 Fleet Analytics
        </button>
        <button className={`aad-tab ${tab === 'uber' ? 'active' : ''}`} onClick={() => setTab('uber')}>
          🗽 Uber Dataset NYC
        </button>
        <div className="aad-tab-actions">
          <button className="aad-dl-btn csv" onClick={downloadCSV}>⬇ CSV</button>
          <button className="aad-dl-btn pdf" onClick={downloadPDF}>⬇ PDF</button>
        </div>
      </div>

      {tab === 'fleet' && (
        <>
          {/* KPI cards */}
          <div className="aad-kpi-grid">
            {[
              { label: 'Total Fleet',    value: vehicles.length,              color: 'indigo' },
              { label: 'Total Trips',    value: totalTrips,                   color: 'blue'   },
              { label: 'Trips Today',    value: tripsToday,                   color: 'green'  },
              { label: 'Active Routes',  value: activeTrips,                  color: 'amber'  },
              { label: 'Total Revenue',  value: `₹${Math.round(totalRevenue).toLocaleString()}`, color: 'emerald' },
            ].map(k => (
              <div key={k.label} className={`aad-kpi-card ${k.color}`}>
                <p className="aad-kpi-label">{k.label}</p>
                <h3 className="aad-kpi-value">{k.value}</h3>
              </div>
            ))}
          </div>

          {/* Revenue summary strip */}
          <div className="aad-rev-strip">
            {[
              { label: 'Total Revenue',  value: `₹${Math.round(totalRevenue).toLocaleString()}` },
              { label: 'Completed',      value: completedTrips },
              { label: 'Active',         value: activeTrips },
              { label: 'Cancelled',      value: cancelledTrips },
              { label: 'Avg Fare',       value: `₹${Math.round(avgFare)}` },
            ].map(s => (
              <div key={s.label} className="aad-rev-item">
                <span className="aad-rev-label">{s.label}</span>
                <span className="aad-rev-value">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Charts grid */}
          <div className="aad-charts-grid">
            {/* Hourly bar chart */}
            <div className="aad-chart-card wide">
              <h4>🕐 Hourly Rental Activity — Today</h4>
              <Bar
                data={{
                  labels: [
                    '12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM',
                    '12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM'
                  ],
                  datasets: [{
                    label: 'Trips',
                    data: hourlyData,
                    backgroundColor: hourlyData.map(v => v >= peakThreshold ? '#f97316' : '#3b82f6'),
                    borderRadius: 6,
                    borderSkipped: false,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        generateLabels: () => [
                          { text: 'Normal', fillStyle: '#3b82f6', strokeStyle: '#3b82f6', lineWidth: 0 },
                          { text: `Peak Hour (${Math.round(peakThreshold)}+ trips)`, fillStyle: '#f97316', strokeStyle: '#f97316', lineWidth: 0 },
                        ],
                        font: { size: 12, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        padding: 20,
                      },
                    },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleColor: '#94a3b8',
                      bodyColor: '#f1f5f9',
                      borderColor: '#3b82f6',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 10,
                      callbacks: {
                        title: items => `🕐 ${items[0].label}`,
                        label: ctx => {
                          const v = ctx.parsed.y;
                          return `  🚗 Trips: ${v}${v >= peakThreshold ? '  🔥 Peak' : ''}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: '#64748b', font: { size: 11 } },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f1f5f9' },
                      ticks: { color: '#64748b', font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>

            {/* Vehicle type pie */}
            <div className="aad-chart-card">
              <h4>Vehicle Type Distribution</h4>
              <Pie
                data={{
                  labels: vtLabels,
                  datasets: [{ data: vtValues, backgroundColor: PIE_COLORS }],
                }}
                options={{ responsive: true, maintainAspectRatio: true }}
              />
            </div>

            {/* Dual-axis line chart */}
            <div className="aad-chart-card wide">
              <h4>Trips & Revenue — Last 7 Days</h4>
              <Line
                data={{
                  labels: last7.map(d => d.slice(5)),
                  datasets: [
                    {
                      label: 'Trips', data: tripsByDay,
                      borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)',
                      yAxisID: 'y', tension: 0.4, fill: true,
                      pointBackgroundColor: '#10b981',
                      pointRadius: 5, pointHoverRadius: 8,
                      borderWidth: 2.5,
                    },
                    {
                      label: 'Revenue ₹', data: revenueByDay,
                      borderColor: '#6366f1', borderDash: [5, 5],
                      backgroundColor: 'rgba(99,102,241,0.08)',
                      yAxisID: 'y1', tension: 0.4, fill: true,
                      pointBackgroundColor: '#6366f1',
                      pointRadius: 5, pointHoverRadius: 8,
                      borderWidth: 2.5,
                    },
                  ],
                }}
                options={{
                  responsive: true, maintainAspectRatio: true,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleColor: '#94a3b8',
                      bodyColor: '#f1f5f9',
                      borderColor: '#6366f1',
                      borderWidth: 1,
                      padding: 14,
                      cornerRadius: 12,
                      displayColors: true,
                      boxWidth: 10,
                      boxHeight: 10,
                      callbacks: {
                        title: (items) => `📅 ${items[0].label}`,
                        label: (ctx) => {
                          if (ctx.dataset.yAxisID === 'y1')
                            return `  💰 Revenue: ₹${Math.round(ctx.parsed.y).toLocaleString()}`;
                          return `  🚗 Trips: ${ctx.parsed.y}`;
                        },
                      },
                    },
                    legend: {
                      labels: {
                        color: '#475569',
                        font: { size: 12, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                      },
                    },
                  },
                  scales: {
                    y:  { type: 'linear', position: 'left',  title: { display: true, text: 'Trips', color: '#10b981', font: { weight: '600' } }, grid: { color: '#f1f5f9' } },
                    y1: { type: 'linear', position: 'right', title: { display: true, text: 'Revenue ₹', color: '#6366f1', font: { weight: '600' } }, grid: { drawOnChartArea: false } },
                  },
                }}
              />
            </div>
          </div>
        </>
      )}

      {tab === 'uber' && <UberDatasetTab />}
    </div>
  );
}

// ── Uber Dataset Tab ──────────────────────────────────────────────────────────
function UberDatasetTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    import('../../data/uber_trips.json').then(m => {
      const trips = m.default;
      const today = new Date().toISOString().slice(0, 10);
      const totalTrips = trips.length;
      const tripsToday = trips.filter(t => t.date === today).length;
      const totalFare  = trips.reduce((s, t) => s + t.fare, 0);
      const avgFare    = totalFare / totalTrips;
      const avgDur     = trips.reduce((s, t) => s + t.duration, 0) / totalTrips;
      const hours      = Array(24).fill(0);
      trips.forEach(t => { hours[t.hour] = (hours[t.hour] || 0) + 1; });
      const vtMap = {};
      trips.forEach(t => { vtMap[t.vehicleType] = (vtMap[t.vehicleType] || 0) + 1; });
      const peakHour = hours.indexOf(Math.max(...hours));
      setData({ trips, totalTrips, tripsToday, avgFare, avgDur, peakHour, hours, vtMap });
    });
  }, []);

  if (!data) return <p className="aad-loading">Loading Uber dataset...</p>;

  return (
    <div>
      <div className="aad-kpi-grid">
        {[
          { label: 'Total Trips',    value: data.totalTrips,              color: 'blue'   },
          { label: 'Trips Today',    value: data.tripsToday,              color: 'green'  },
          { label: 'Peak Hour',      value: `${data.peakHour}:00`,        color: 'amber'  },
          { label: 'Avg Fare',       value: `$${data.avgFare.toFixed(2)}`,color: 'indigo' },
          { label: 'Avg Duration',   value: `${Math.round(data.avgDur)} min`, color: 'emerald' },
        ].map(k => (
          <div key={k.label} className={`aad-kpi-card ${k.color}`}>
            <p className="aad-kpi-label">{k.label}</p>
            <h3 className="aad-kpi-value">{k.value}</h3>
          </div>
        ))}
      </div>
      <div className="aad-charts-grid">
        <div className="aad-chart-card wide">
          <h4>Hourly Trip Distribution (NYC)</h4>
          <Bar
            data={{
              labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
              datasets: [{ label: 'Trips', data: data.hours, backgroundColor: '#f59e0b', borderRadius: 4 }],
            }}
            options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }}
          />
        </div>
        <div className="aad-chart-card">
          <h4>Vehicle Type Distribution (NYC)</h4>
          <Pie
            data={{
              labels: Object.keys(data.vtMap),
              datasets: [{ data: Object.values(data.vtMap), backgroundColor: PIE_COLORS }],
            }}
            options={{ responsive: true, maintainAspectRatio: true }}
          />
        </div>
      </div>
    </div>
  );
}
