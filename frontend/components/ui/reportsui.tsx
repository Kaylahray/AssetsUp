import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Wrench,
  MapPin,
  ChevronDown,
  Info
} from 'lucide-react';

// Mock data for demonstrations
const assetDistributionData = [
  { x: 0, y: 0, intensity: 45, location: 'Factory A', assets: 12 },
  { x: 1, y: 0, intensity: 30, location: 'Factory B', assets: 8 },
  { x: 2, y: 0, intensity: 60, location: 'Factory C', assets: 15 },
  { x: 0, y: 1, intensity: 25, location: 'Warehouse D', assets: 6 },
  { x: 1, y: 1, intensity: 80, location: 'Plant E', assets: 20 },
  { x: 2, y: 1, intensity: 35, location: 'Facility F', assets: 9 },
  { x: 0, y: 2, intensity: 55, location: 'Center G', assets: 14 },
  { x: 1, y: 2, intensity: 40, location: 'Hub H', assets: 10 },
  { x: 2, y: 2, intensity: 70, location: 'Site I', assets: 18 }
];

const downtimePerformanceData = [
  { month: 'Jan', downtime: 12, performance: 88, efficiency: 85 },
  { month: 'Feb', downtime: 8, performance: 92, efficiency: 89 },
  { month: 'Mar', downtime: 15, performance: 85, efficiency: 82 },
  { month: 'Apr', downtime: 6, performance: 95, efficiency: 92 },
  { month: 'May', downtime: 10, performance: 90, efficiency: 87 },
  { month: 'Jun', downtime: 4, performance: 96, efficiency: 94 }
];

const depreciationData = [
  { asset: 'Machine A', currentValue: 85000, originalValue: 100000, category: 'Manufacturing' },
  { asset: 'Vehicle B', currentValue: 12000, originalValue: 25000, category: 'Transportation' },
  { asset: 'Equipment C', currentValue: 45000, originalValue: 60000, category: 'Processing' },
  { asset: 'System D', currentValue: 30000, originalValue: 40000, category: 'IT Infrastructure' },
  { asset: 'Tool E', currentValue: 8000, originalValue: 15000, category: 'Manufacturing' }
];

const expenseMaintenanceData = [
  { month: 'Jan', expenses: 25000, maintenance: 15000, preventive: 8000 },
  { month: 'Feb', expenses: 18000, maintenance: 12000, preventive: 6000 },
  { month: 'Mar', expenses: 32000, maintenance: 22000, preventive: 10000 },
  { month: 'Apr', expenses: 15000, maintenance: 8000, preventive: 7000 },
  { month: 'May', expenses: 28000, maintenance: 18000, preventive: 10000 },
  { month: 'Jun', expenses: 20000, maintenance: 14000, preventive: 6000 }
];

interface ReportFilters {
  dateRange: string;
  assetType: string;
  location: string;
}

const OperationalReportsDashboard: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'last-6-months',
    assetType: 'all',
    location: 'all'
  });
  const [hoveredCell, setHoveredCell] = useState<any>(null);

  const reportTypes = [
    { id: 'overview', label: 'Overview Dashboard', icon: Activity },
    { id: 'asset-distribution', label: 'Asset Distribution', icon: MapPin },
    { id: 'downtime-performance', label: 'Downtime vs Performance', icon: TrendingUp },
    { id: 'depreciation', label: 'Asset Depreciation', icon: TrendingDown },
    { id: 'expense-maintenance', label: 'Expense vs Maintenance', icon: DollarSign }
  ];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 70) return 'bg-red-500';
    if (intensity >= 50) return 'bg-orange-500';
    if (intensity >= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const HeatmapCell: React.FC<{ data: any; onHover: (data: any) => void; onLeave: () => void }> = ({ 
    data, 
    onHover, 
    onLeave 
  }) => (
    <div
      className={`w-20 h-16 ${getIntensityColor(data.intensity)} opacity-80 hover:opacity-100 
                  border border-white cursor-pointer transition-all duration-200 
                  flex items-center justify-center text-white text-xs font-medium
                  hover:scale-105 hover:z-10 relative`}
      onMouseEnter={() => onHover(data)}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      aria-label={`${data.location}: ${data.assets} assets, ${data.intensity}% intensity`}
    >
      {data.assets}
    </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Assets</p>
            <p className="text-2xl font-bold text-gray-900">127</p>
          </div>
          <Activity className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-xs text-green-600 mt-2">+5% from last month</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Avg Downtime</p>
            <p className="text-2xl font-bold text-gray-900">9.2hrs</p>
          </div>
          <TrendingDown className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-xs text-red-600 mt-2">+2% from last month</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Performance</p>
            <p className="text-2xl font-bold text-gray-900">91%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-xs text-green-600 mt-2">+3% from last month</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Maintenance Cost</p>
            <p className="text-2xl font-bold text-gray-900">$14.8K</p>
          </div>
          <DollarSign className="w-8 h-8 text-orange-600" />
        </div>
        <p className="text-xs text-orange-600 mt-2">-8% from last month</p>
      </div>
    </div>
  );

  const renderAssetDistribution = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Asset Distribution Heatmap</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low (0-29)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium (30-49)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>High (50-69)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Critical (70+)</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
          {assetDistributionData.map((cell, index) => (
            <HeatmapCell
              key={index}
              data={cell}
              onHover={setHoveredCell}
              onLeave={() => setHoveredCell(null)}
            />
          ))}
        </div>
        
        {hoveredCell && (
          <div className="absolute top-0 right-0 bg-gray-900 text-white p-3 rounded-lg shadow-lg z-20">
            <p className="font-medium">{hoveredCell.location}</p>
            <p className="text-sm">Assets: {hoveredCell.assets}</p>
            <p className="text-sm">Intensity: {hoveredCell.intensity}%</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDowntimePerformance = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Downtime vs Performance Correlation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={downtimePerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="right" dataKey="downtime" fill="#ef4444" name="Downtime (hours)" />
            <Line yAxisId="left" type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={2} name="Performance (%)" />
            <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} name="Efficiency (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderDepreciation = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Depreciation Analysis</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Asset</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">Original Value</th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">Current Value</th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">Depreciation</th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">Rate</th>
            </tr>
          </thead>
          <tbody>
            {depreciationData.map((asset, index) => {
              const depreciation = asset.originalValue - asset.currentValue;
              const rate = ((depreciation / asset.originalValue) * 100).toFixed(1);
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{asset.asset}</td>
                  <td className="py-3 px-4 text-gray-600">{asset.category}</td>
                  <td className="py-3 px-4 text-right text-gray-900">${asset.originalValue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-900">${asset.currentValue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">${depreciation.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">{rate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExpenseMaintenance = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense vs Maintenance Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={expenseMaintenanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
          <Legend />
          <Bar dataKey="expenses" fill="#ef4444" name="Total Expenses" />
          <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance Cost" />
          <Bar dataKey="preventive" fill="#10b981" name="Preventive Maintenance" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverview();
      case 'asset-distribution':
        return renderAssetDistribution();
      case 'downtime-performance':
        return renderDowntimePerformance();
      case 'depreciation':
        return renderDepreciation();
      case 'expense-maintenance':
        return renderExpenseMaintenance();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Operational Reports</h2>
            
            {/* Report Selection */}
            <nav className="space-y-2 mb-6">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedReport === report.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    aria-current={selectedReport === report.id ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{report.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="last-6-months">Last 6 Months</option>
                  <option value="last-year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Asset Type</label>
                <select
                  value={filters.assetType}
                  onChange={(e) => setFilters({ ...filters, assetType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Assets</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="transportation">Transportation</option>
                  <option value="it-infrastructure">IT Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  <option value="factory-a">Factory A</option>
                  <option value="factory-b">Factory B</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              {reportTypes.find(r => r.id === selectedReport)?.label || 'Overview Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Filter className="w-4 h-4" />
                <span>Advanced Filters</span>
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalReportsDashboard;