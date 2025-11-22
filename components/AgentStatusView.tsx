import React from 'react';
import { Brain, Truck, Calendar, ShieldCheck, Loader2, Check } from 'lucide-react';
import { AgentStatus } from '../types';

interface AgentStatusViewProps {
  status: AgentStatus;
  logs: string;
}

const AgentStatusView: React.FC<AgentStatusViewProps> = ({ status, logs }) => {
  const steps = [
    { id: AgentStatus.STRATEGIST_WORKING, label: 'Strategist', icon: Brain, desc: 'Route Planning' },
    { id: AgentStatus.LOGISTICS_WORKING, label: 'Logistics', icon: Truck, desc: 'Booking & Transport' },
    { id: AgentStatus.PLANNER_WORKING, label: 'Daily Planner', icon: Calendar, desc: 'Activities & Meals' },
    { id: AgentStatus.AUDITOR_WORKING, label: 'Auditor', icon: ShieldCheck, desc: 'Budget Validation' },
  ];

  const getCurrentStepIndex = () => {
    const order = [
      AgentStatus.STRATEGIST_WORKING,
      AgentStatus.LOGISTICS_WORKING,
      AgentStatus.PLANNER_WORKING,
      AgentStatus.AUDITOR_WORKING,
      AgentStatus.COMPLETE
    ];
    return order.indexOf(status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-8 my-8">
      <h3 className="text-xl font-bold text-slate-800 mb-8 text-center">Blackboard Architecture Status</h3>
      
      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        <div 
            className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
            style={{ width: `${Math.min((currentStepIndex / (steps.length - 1)) * 100, 100)}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center bg-white px-2">
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500
                ${isCompleted ? 'bg-brand-500 border-brand-500 text-white' : 
                  isCurrent ? 'bg-white border-brand-500 text-brand-600 shadow-[0_0_0_4px_rgba(14,165,233,0.2)]' : 
                  'bg-slate-50 border-slate-200 text-slate-400'}
              `}>
                {isCompleted ? <Check size={24} strokeWidth={3} /> : 
                 isCurrent ? <Loader2 size={24} className="animate-spin" /> : 
                 <Icon size={24} />}
              </div>
              <div className="mt-4 text-center">
                <p className={`font-bold text-sm ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-slate-900 rounded-lg p-4 font-mono text-sm text-brand-400 min-h-[80px] flex items-center">
        <span className="mr-2 text-slate-500">{">"}</span>
        <span className="animate-pulse">{logs}</span>
      </div>
    </div>
  );
};

export default AgentStatusView;