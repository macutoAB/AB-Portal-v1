import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Users, Building, Award, Crown } from 'lucide-react';
import { Gender } from '../types';

const StatCard = ({ title, value, icon, bgClass, iconColorClass }: { title: string, value: number, icon: React.ReactNode, bgClass: string, iconColorClass: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${bgClass} ${iconColorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { members, organizers, affiliates, grandChancellors } = useData();

  // Stats Logic
  const stats = {
    totalMembers: members.length,
    totalOrganizers: organizers.length,
    totalAffiliates: affiliates.length,
    totalChancellors: grandChancellors.length
  };

  // Chart Data Preparation
  const membersByBatch = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      counts[m.batchYear] = (counts[m.batchYear] || 0) + 1;
    });
    return Object.keys(counts).sort().map(year => ({
      name: year,
      members: counts[year]
    }));
  }, [members]);

  // Updated: Distribution by Gender (Fraternity/Sorority)
  const membersByGender = useMemo(() => {
    let fraternityCount = 0;
    let sororityCount = 0;

    members.forEach(m => {
      // Check against Gender enum
      if (m.gender === Gender.MALE) {
        fraternityCount++;
      } else {
        sororityCount++;
      }
    });

    return [
      { name: 'Fraternity', value: fraternityCount },
      { name: 'Sorority', value: sororityCount }
    ];
  }, [members]);

  // Blue (Fraternity) and Gold (Sorority) Color Palette
  const GENDER_COLORS = ['#1e40af', '#f59e0b']; // Blue-800, Amber-500

  return (
    <div className="space-y-6">
      <div className="mb-8 border-b pb-4 border-slate-200">
        <h1 className="text-2xl font-bold text-blue-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome to the APO Alpha Beta Chapter Portal.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Members" 
          value={stats.totalMembers} 
          icon={<Users size={24} />} 
          bgClass="bg-blue-100"
          iconColorClass="text-blue-800"
        />
        <StatCard 
          title="Organizers" 
          value={stats.totalOrganizers} 
          icon={<Building size={24} />} 
          bgClass="bg-amber-100"
          iconColorClass="text-amber-600"
        />
        <StatCard 
          title="Affiliates" 
          value={stats.totalAffiliates} 
          icon={<Award size={24} />} 
          bgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <StatCard 
          title="GC / GLC" 
          value={stats.totalChancellors} 
          icon={<Crown size={24} />} 
          bgClass="bg-amber-50"
          iconColorClass="text-amber-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Bar Chart: Members per Batch */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Members per Batch Year</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membersByBatch}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#eff6ff' }}
                />
                <Bar dataKey="members" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Fraternity / Sorority Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Fraternity / Sorority</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membersByGender}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {membersByGender.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};