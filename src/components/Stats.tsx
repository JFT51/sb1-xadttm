import React from 'react';
import { Users, Sun, Umbrella, Calendar } from 'lucide-react';
import { VisitorData } from '../types';

interface StatsProps {
  data: VisitorData[];
}

export function Stats({ data }: StatsProps) {
  const totalVisitors = data.reduce((sum, day) => sum + day.visitors, 0);
  const avgVisitors = Math.round(totalVisitors / data.length);
  const maxVisitors = Math.max(...data.map(day => day.visitors));
  const sunnyDays = data.filter(day => day.weather === 'Sunny').length;

  const stats = [
    {
      title: 'Total Visitors',
      value: totalVisitors.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Average Daily',
      value: avgVisitors.toLocaleString(),
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Peak Visitors',
      value: maxVisitors.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Sunny Days',
      value: sunnyDays,
      icon: Sun,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}