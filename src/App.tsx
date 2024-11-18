import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LayoutDashboard } from 'lucide-react';
import { VisitorData } from './types';
import { DashboardCard } from './components/DashboardCard';
import { Stats } from './components/Stats';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

function App() {
  const [data, setData] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/JFTHIBAUT/Xki/main/xdatax.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const parsedData = results.data
              .filter((row: any) => row.visitors && row.temperature) // Filter out invalid rows
              .map((row: any) => ({
                ...row,
                visitors: parseInt(row.visitors) || 0,
                temperature: parseFloat(row.temperature) || 0,
                is_holiday: row.is_holiday === 'True',
                is_weekend: row.is_weekend === 'True',
              }));
            setData(parsedData);
            setLoading(false);
          },
        });
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const seasonalData = data.reduce((acc: any, curr) => {
    if (!acc[curr.season]) {
      acc[curr.season] = { name: curr.season, visitors: 0, count: 0 };
    }
    acc[curr.season].visitors += curr.visitors;
    acc[curr.season].count += 1;
    return acc;
  }, {});

  const seasonalAverages = Object.values(seasonalData)
    .map((season: any) => ({
      name: season.name,
      average: Math.round(season.visitors / season.count),
    }))
    .filter(item => !isNaN(item.average)); // Filter out any NaN values

  const weatherData = data.reduce((acc: any, curr) => {
    if (!acc[curr.weather]) {
      acc[curr.weather] = { name: curr.weather, value: 0 };
    }
    acc[curr.weather].value += curr.visitors;
    return acc;
  }, {});

  const weatherDataArray = Object.values(weatherData)
    .filter((item: any) => item.value > 0) // Filter out zero or invalid values
    .map((item: any) => ({
      ...item,
      value: parseInt(item.value) || 0,
    }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Restaurant Analytics Dashboard</h1>
        </div>

        <Stats data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Visitor Trends">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [parseInt(value).toLocaleString(), 'Visitors']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          <DashboardCard title="Average Visitors by Season">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [parseInt(value).toLocaleString(), 'Average Visitors']}
                  />
                  <Bar dataKey="average" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          <DashboardCard title="Weather Impact on Visitors">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weatherDataArray}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {weatherDataArray.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [parseInt(value).toLocaleString(), 'Visitors']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          <DashboardCard title="Temperature vs Visitors">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ value: 'Visitors', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'visitors') return [parseInt(value).toLocaleString(), 'Visitors'];
                      return [value, 'Temperature (°C)'];
                    }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#3B82F6"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#F59E0B"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

export default App;