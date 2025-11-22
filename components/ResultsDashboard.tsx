
import React, { useState } from 'react';
import { ItineraryState, DayPlan, Activity } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MapPin, Clock, DollarSign, Flame, Info, AlertTriangle } from 'lucide-react';

interface ResultsDashboardProps {
  itinerary: ItineraryState;
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ itinerary, onReset }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'financials'>('timeline');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Data for Charts
  const budgetData = [
    { name: 'Spent', value: itinerary.financials.amount_spent },
    { name: 'Remaining', value: Math.max(0, itinerary.financials.total_budget - itinerary.financials.amount_spent) }
  ];
  
  const categoryData = itinerary.days.reduce((acc, day) => {
    acc.lodging += day.lodging_details?.cost_per_night || 0;
    acc.transport += day.transport_details?.cost || 0;
    day.activities.forEach(act => {
        if(act.type === 'food') acc.food += act.cost || 0;
        else acc.activities += act.cost || 0;
    });
    return acc;
  }, { lodging: 0, transport: 0, food: 0, activities: 0 });

  const detailedCostData = [
    { name: 'Lodging', value: categoryData.lodging },
    { name: 'Transport', value: categoryData.transport },
    { name: 'Food', value: categoryData.food },
    { name: 'Activities', value: categoryData.activities },
  ];

  const COLORS = ['#0ea5e9', '#e2e8f0', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Estimated Cost</p>
          <p className={`text-2xl font-bold ${itinerary.financials.amount_spent > itinerary.financials.total_budget ? 'text-red-500' : 'text-emerald-600'}`}>
            ${itinerary.financials.amount_spent.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">Budget: ${itinerary.financials.total_budget.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Route</p>
          <p className="text-lg font-bold text-slate-800 truncate" title={itinerary.route?.join(' → ')}>
             {itinerary.route && itinerary.route.length > 2 ? `${itinerary.route[0]} + ${itinerary.route.length - 1} more` : itinerary.route?.join(' & ')}
          </p>
          <p className="text-xs text-slate-400">{itinerary.trip_dates.total_days} Days • {itinerary.trip_dates.start_date}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
           <p className="text-sm text-slate-500">Auditor Report</p>
           {itinerary.audit_logs.map((log, idx) => (
             <div key={idx} className="flex items-start mt-1">
                {log.includes("WARNING") ? <AlertTriangle size={16} className="text-red-500 mr-2 mt-0.5"/> : <Info size={16} className="text-blue-500 mr-2 mt-0.5"/>}
                <p className="text-sm text-slate-700">{log}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button 
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'timeline' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Detailed Itinerary
        </button>
        <button 
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'financials' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Financial Analysis
        </button>
      </div>

      {/* Timeline Content */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
            {itinerary.days.map((day) => (
                <div key={day.day_number} className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${expandedDay === day.day_number ? 'border-brand-200 shadow-md' : 'border-slate-200 hover:border-brand-200'}`}>
                    <button 
                        onClick={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
                        className="w-full flex items-center justify-between p-6 text-left"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-sm font-bold ${expandedDay === day.day_number ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <span>Day</span>
                                <span>{day.day_number}</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{day.location_city}</h4>
                                <p className="text-sm text-slate-500">{day.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-slate-600">
                            <div className="flex items-center"><DollarSign size={16} className="mr-1 text-slate-400"/> ${day.daily_total_cost}</div>
                            <div className="flex items-center"><Flame size={16} className="mr-1 text-slate-400"/> {day.daily_calories} kcal</div>
                        </div>
                    </button>
                    
                    {expandedDay === day.day_number && (
                        <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
                            {/* Logistics Block */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
                                {day.lodging_details && (
                                  <div className="bg-white p-4 rounded-lg border border-slate-100">
                                      <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">Accommodation</p>
                                      <p className="font-medium text-slate-900">{day.lodging_details.name}</p>
                                      <p className="text-sm text-slate-500 flex justify-between mt-1">
                                          <span>{day.lodging_details.type}</span>
                                          <span>${day.lodging_details.cost_per_night}/night</span>
                                      </p>
                                  </div>
                                )}
                                {day.transport_details && (
                                  <div className="bg-white p-4 rounded-lg border border-slate-100">
                                      <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">Transport</p>
                                      <p className="font-medium text-slate-900">{day.transport_details.method}</p>
                                      <p className="text-sm text-slate-500 mt-1">{day.transport_details.notes}</p>
                                  </div>
                                )}
                            </div>

                            {/* Activity Timeline */}
                            <div className="relative space-y-6 pl-4 ml-2 border-l-2 border-slate-200">
                                {day.activities.map((activity, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        {/* Dot */}
                                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                                            activity.type === 'food' ? 'bg-orange-400' : 
                                            activity.type === 'sightseeing' ? 'bg-brand-500' :
                                            'bg-slate-400'
                                        }`}></div>
                                        
                                        <div className="bg-white p-4 rounded-lg border border-slate-100 hover:shadow-sm transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-bold text-slate-900">{activity.name}</h5>
                                                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                                                        <span className="flex items-center"><Clock size={12} className="mr-1"/> {activity.duration_hours}h</span>
                                                        <span className="flex items-center"><MapPin size={12} className="mr-1"/> {activity.location}</span>
                                                        {activity.type === 'food' && (
                                                            <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                                                <Flame size={12} className="mr-1"/> {activity.calories} kcal
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-slate-900">${activity.cost}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2">{activity.description}</p>
                                            {activity.notes && (
                                                <p className="text-xs text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">
                                                    {activity.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}

      {/* Financials Content */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <div>
               <h4 className="text-lg font-bold text-slate-900 mb-4">Budget Usage</h4>
               <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                               data={budgetData}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                           >
                               <Cell key="cell-0" fill="#0ea5e9" />
                               <Cell key="cell-1" fill="#e2e8f0" />
                           </Pie>
                           <Tooltip formatter={(value: number) => `$${value}`} />
                       </PieChart>
                   </ResponsiveContainer>
               </div>
               <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex items-center"><div className="w-3 h-3 bg-brand-500 rounded-full mr-2"></div> Spent</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-slate-200 rounded-full mr-2"></div> Remaining</div>
               </div>
           </div>

           <div>
               <h4 className="text-lg font-bold text-slate-900 mb-4">Category Breakdown</h4>
               <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={detailedCostData} layout="vertical" margin={{ left: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                           <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                           <YAxis dataKey="name" type="category" width={80} />
                           <Tooltip formatter={(value: number) => `$${value}`} />
                           <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </div>
        </div>
      )}

      <div className="flex justify-center pt-8">
          <button 
            onClick={onReset}
            className="px-8 py-3 bg-white border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Plan Another Trip
          </button>
      </div>

    </div>
  );
};

export default ResultsDashboard;
