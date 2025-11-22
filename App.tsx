import React, { useState } from 'react';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import AgentStatusView from './components/AgentStatusView';
import ResultsDashboard from './components/ResultsDashboard';
import { runOdysseyAgents } from './services/geminiService';
import { AgentStatus, ItineraryState, UserRequest } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [logs, setLogs] = useState<string>("");
  const [itinerary, setItinerary] = useState<ItineraryState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestSubmit = async (request: UserRequest) => {
    setStatus(AgentStatus.STRATEGIST_WORKING);
    setLogs("Initializing Project Odyssey Agents...");
    setError(null);

    try {
      // NOTE: The API Key is assumed to be in process.env.API_KEY. 
      // If missing, this will fail inside the service.
      if (!process.env.API_KEY) {
         throw new Error("Missing API_KEY. Please set process.env.API_KEY in your environment.");
      }

      const result = await runOdysseyAgents(request, (newStatusStr, newLog) => {
        // Map string back to enum if necessary, or just use the helper
        const newStatus = newStatusStr as AgentStatus;
        setStatus(newStatus);
        setLogs(newLog);
      });

      setItinerary(result);
      setStatus(AgentStatus.COMPLETE);
    } catch (err: any) {
      setStatus(AgentStatus.ERROR);
      setError(err.message || "An unexpected error occurred while generating the itinerary.");
      console.error(err);
    }
  };

  const handleReset = () => {
    setStatus(AgentStatus.IDLE);
    setItinerary(null);
    setError(null);
    setLogs("");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        
        {status === AgentStatus.IDLE && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                Your Multi-Agent Travel Team
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Project Odyssey uses a Blackboard Architecture to coordinate specialized AI agents. 
                Watch the Strategist, Logistics, and Planner agents work together to build your perfect trip.
              </p>
            </div>
            <InputForm onSubmit={handleRequestSubmit} isLoading={false} />
          </div>
        )}

        {(status !== AgentStatus.IDLE && status !== AgentStatus.COMPLETE && status !== AgentStatus.ERROR) && (
          <AgentStatusView status={status} logs={logs} />
        )}

        {status === AgentStatus.ERROR && (
           <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-4">
              <AlertCircle className="text-red-600 shrink-0" size={24} />
              <div>
                 <h3 className="font-bold text-red-800">Generation Failed</h3>
                 <p className="text-red-600 mt-1">{error}</p>
                 <button 
                    onClick={handleReset}
                    className="mt-4 text-sm font-semibold text-red-700 underline hover:text-red-900"
                 >
                    Try Again
                 </button>
              </div>
           </div>
        )}

        {status === AgentStatus.COMPLETE && itinerary && (
          <ResultsDashboard itinerary={itinerary} onReset={handleReset} />
        )}

      </div>
    </Layout>
  );
};

export default App;