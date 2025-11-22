
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ItineraryState, UserRequest, DayPlan, Activity } from "../types";

// Initialize Gemini
// Note: In a production app, we would not create this instance globally if keys change, 
// but for this demo we assume process.env.API_KEY is fixed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas for Structured Output ---

const activitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    location: { type: Type.STRING },
    cost: { type: Type.NUMBER, description: "Cost in USD" },
    duration_hours: { type: Type.NUMBER },
    type: { type: Type.STRING, enum: ["food", "sightseeing", "transport", "rest"] },
    calories: { type: Type.NUMBER },
    description: { type: Type.STRING },
    notes: { type: Type.STRING, description: "Special notes like 'stroller friendly'" }
  },
  required: ["name", "cost", "type", "calories", "description"]
};

const dayPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day_number: { type: Type.NUMBER },
    date: { type: Type.STRING },
    location_city: { type: Type.STRING },
    lodging_details: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        cost_per_night: { type: Type.NUMBER },
        type: { type: Type.STRING }
      }
    },
    transport_details: {
      type: Type.OBJECT,
      properties: {
        method: { type: Type.STRING },
        cost: { type: Type.NUMBER },
        notes: { type: Type.STRING }
      }
    },
    activities: {
      type: Type.ARRAY,
      items: activitySchema
    },
    daily_total_cost: { type: Type.NUMBER },
    daily_calories: { type: Type.NUMBER }
  },
  // Added transport_details to required list to prevent UI crashes
  required: ["day_number", "location_city", "lodging_details", "transport_details", "activities", "daily_total_cost"]
};

const itineraryResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    trip_dates: {
      type: Type.OBJECT,
      properties: {
        start_date: { type: Type.STRING },
        end_date: { type: Type.STRING },
        total_days: { type: Type.NUMBER }
      }
    },
    route: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    days: {
      type: Type.ARRAY,
      items: dayPlanSchema
    },
    total_estimated_cost: { type: Type.NUMBER },
    audit_notes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Notes from the Auditor agent regarding budget or constraints"
    }
  }
};

// --- Agent Simulations ---

export const runOdysseyAgents = async (
  request: UserRequest,
  onProgress: (status: string, logs: string) => void
): Promise<ItineraryState> => {
  
  const modelId = "gemini-2.5-flash"; // Using Flash for speed and context window

  // 1. THE STRATEGIST AGENT
  onProgress("STRATEGIST_WORKING", "Strategist is analyzing seasonality and defining the route...");
  
  const systemInstruction = `
    You are the 'Strategist' and 'Logistics' agents of Project Odyssey.
    
    Constraint Checklist & Confidence Score:
    1. Calorie Target: ~${request.calorieTarget} per adult/day? Yes.
    2. Infants: ${request.infants} (Requires stroller friendly activities, rest stops).
    3. Budget: $${request.budget} (Strict limit).
    4. Duration: ${request.durationDays} days.
    5. Season/Dates: "${request.travelDates}".

    Goal: Create a detailed itinerary.
    
    Tasks:
    - Determine exact start/end dates based on preference: "${request.travelDates}". If only a year or 'next summer' is given, choose specific dates in that window.
    - Route: Choose cities logically to minimize travel time.
    - Accommodations: Pick specific hotels suitable for ${request.adults} adults, ${request.children} kids, ${request.infants} infants.
    - Transport: Estimate inter-city travel costs.
    - Daily Planner: Plan meals (summing to calorie target) and activities.
    - Auditor: Ensure total cost < $${request.budget}.
  `;

  const userPrompt = `
    Generate a travel itinerary for:
    Destination: ${request.destination}
    Duration: ${request.durationDays} days
    Travelers: ${request.adults} Adults, ${request.children} Children, ${request.infants} Infants.
    Budget: $${request.budget} USD.
    Calorie Target: ${request.calorieTarget} kcal/adult/day.
    Travel Dates/Season: ${request.travelDates}.

    IMPORTANT: 
    - Ensure daily calorie counts for food activities sum up to roughly ${request.calorieTarget}.
    - Mark activities as 'Stroller friendly' in notes if infants > 0.
    - If the budget is tight, choose cheaper hotels.
    - Always include transport_details for every day, even if cost is 0.
  `;

  try {
    onProgress("LOGISTICS_WORKING", "Logistics is booking accommodations and transport...");
    
    // We simulate the multi-turn agent loop by asking a powerful model to do the "Thinking" 
    // internally and output the final Blackboard state.
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: itineraryResponseSchema,
        temperature: 0.2, // Low temperature for factual consistency and math
      }
    });

    onProgress("PLANNER_WORKING", "Daily Planner is organizing meals and activities...");

    if (!response.text) {
      throw new Error("No response from Gemini.");
    }

    const rawData = JSON.parse(response.text);

    // Transform raw JSON into our internal State
    // This acts as the "Auditor" verifying the structure matches
    onProgress("AUDITOR_WORKING", "Auditor is validating budget and constraints...");

    const totalSpent = rawData.total_estimated_cost || 0;
    const auditLogs = rawData.audit_notes || [];

    if (totalSpent > request.budget) {
        auditLogs.push(`WARNING: Itinerary exceeds budget by $${totalSpent - request.budget}`);
    } else {
        auditLogs.push("Budget validation passed.");
    }

    const finalState: ItineraryState = {
      travelers: {
        adults: request.adults,
        children: request.children,
        infants: request.infants
      },
      financials: {
        total_budget: request.budget,
        amount_spent: totalSpent,
        currency: "USD"
      },
      trip_dates: rawData.trip_dates,
      route: rawData.route,
      days: rawData.days,
      audit_logs: auditLogs
    };

    return finalState;

  } catch (error) {
    console.error("Agent workflow failed:", error);
    throw error;
  }
};
