import { Type } from "@google/genai";

export interface EventDetails {
  id: string;
  name: string;
  sport: 'football' | 'tennis' | 'f1' | 'other';
  venue: string;
  city: string;
  date: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Recommendation {
  id: string;
  type: 'ticket' | 'hotel' | 'transport' | 'parking' | 'restaurant' | 'bar';
  title: string;
  description: string;
  price?: string;
  rating?: number;
  distance?: string;
  url: string;
  tags?: string[];
  aiScore?: number;
  aiReasoning?: string;
}

export interface ItineraryItem {
  time: string;
  activity: string;
  location: string;
  note?: string;
}

export interface EventExperience {
  event: EventDetails;
  recommendations: Recommendation[];
  itinerary: ItineraryItem[];
  summary: string;
}
