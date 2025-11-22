
// Blackboard Shared State Definitions

export enum AgentStatus {
  IDLE = "IDLE",
  STRATEGIST_WORKING = "STRATEGIST_WORKING",
  LOGISTICS_WORKING = "LOGISTICS_WORKING",
  PLANNER_WORKING = "PLANNER_WORKING",
  AUDITOR_WORKING = "AUDITOR_WORKING",
  COMPLETE = "COMPLETE",
  ERROR = "ERROR"
}

export interface TravelerProfile {
  adults: number;
  children: number;
  infants: number;
  preferences?: string;
}

export interface Financials {
  total_budget: number;
  amount_spent: number;
  currency: string;
}

export interface Activity {
  name: string;
  location: string;
  cost: number;
  duration_hours: number;
  type: "food" | "sightseeing" | "transport" | "rest";
  calories: number;
  description: string;
  notes?: string; // e.g., "Stroller friendly"
}

export interface DayPlan {
  day_number: number;
  date: string;
  location_city: string;
  lodging_details: {
    name: string;
    cost_per_night: number;
    type: string;
  };
  transport_details: {
    method: string;
    cost: number;
    notes: string;
  };
  activities: Activity[];
  daily_total_cost: number;
  daily_calories: number;
}

export interface ItineraryState {
  travelers: TravelerProfile;
  financials: Financials;
  trip_dates: {
    start_date: string;
    end_date: string;
    total_days: number;
  };
  route: string[];
  days: DayPlan[];
  audit_logs: string[]; // Scratchpad for Auditor Agent
}

export interface UserRequest {
  destination: string;
  durationDays: number;
  travelDates: string; // Renamed from month to support "Next Year", "October 2025", etc.
  budget: number;
  adults: number;
  children: number;
  infants: number;
  calorieTarget: number;
}
