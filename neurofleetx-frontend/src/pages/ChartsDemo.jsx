import KPISummaryCards from '../components/KPISummaryCards';
import VehicleWearChart from '../components/VehicleWearChart';
import MaintenanceStatusPie from '../components/MaintenanceStatusPie';
import '../styles/chartsDemo.css';

export default function ChartsDemo() {
  return (
    <div className="charts-demo-container">
      <div className="demo-header">
        <h1>📊 Charts & Analytics Dashboard</h1>
        <p>Member 2 - Vehicle Health Monitoring</p>
      </div>

      <div className="demo-content">
        <KPISummaryCards />
        
        <div className="charts-row">
          <div className="chart-wrapper">
            <VehicleWearChart />
          </div>
          <div className="chart-wrapper">
            <MaintenanceStatusPie />
          </div>
        </div>
      </div>
    </div>
  );
}
