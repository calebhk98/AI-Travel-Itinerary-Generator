
import React, { useState } from 'react';
import { Users, Calendar, DollarSign, MapPin } from 'lucide-react';
import { UserRequest } from '../types';

interface InputFormProps {
  onSubmit: (req: UserRequest) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  // Use strings for numeric fields to allow empty input without "0" sticking
  const [destination, setDestination] = useState('Japan');
  const [travelDates, setTravelDates] = useState('');
  const [durationDays, setDurationDays] = useState<string>('10');
  const [budget, setBudget] = useState<string>('9000');
  
  const [adults, setAdults] = useState<string>('2');
  const [children, setChildren] = useState<string>('0');
  const [infants, setInfants] = useState<string>('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      destination,
      travelDates: travelDates || "Next Year", // Default if left empty
      durationDays: Number(durationDays) || 1,
      budget: Number(budget) || 1000,
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      infants: Number(infants) || 0,
      calorieTarget: 2000 // Hardcoded for health reasons
    });
  };

  const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string or digits only
    if (val === '' || /^\d+$/.test(val)) {
      setter(val);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Plan Your Odyssey</h2>
        <p className="text-brand-100">Configure your agents to build the perfect itinerary.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <MapPin size={16} className="mr-2 text-brand-500" /> Destination
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="e.g. Japan, Italy"
            />
          </div>

          {/* Travel Dates */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Calendar size={16} className="mr-2 text-brand-500" /> When?
            </label>
            <input
              type="text"
              required
              value={travelDates}
              onChange={(e) => setTravelDates(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="e.g. Next Summer, 2 years from now, Oct 2025"
            />
            <p className="text-xs text-slate-500">Be specific (Month Year) or general (Next Year).</p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Calendar size={16} className="mr-2 text-brand-500" /> Duration (Days)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={durationDays}
              onChange={handleNumberChange(setDurationDays)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <DollarSign size={16} className="mr-2 text-brand-500" /> Budget (USD)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={budget}
              onChange={handleNumberChange(setBudget)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
            {/* Travelers */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Users size={16} className="mr-2 text-brand-500" /> Travelers
              </label>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                    <span className="text-xs text-slate-500 block mb-1">Adults</span>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={adults} 
                      onChange={handleNumberChange(setAdults)} 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
                    />
                 </div>
                 <div>
                    <span className="text-xs text-slate-500 block mb-1">Kids</span>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={children} 
                      onChange={handleNumberChange(setChildren)} 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
                    />
                 </div>
                 <div>
                    <span className="text-xs text-slate-500 block mb-1">Infants</span>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={infants} 
                      onChange={handleNumberChange(setInfants)} 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
                    />
                 </div>
              </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]
            ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/25'}`}
        >
          {isLoading ? 'Agents Working...' : 'Launch Project Odyssey'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
