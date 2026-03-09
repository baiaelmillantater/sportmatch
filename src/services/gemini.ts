import { GoogleGenAI, Type } from "@google/genai";
import { EventExperience, EventDetails, Recommendation } from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function searchEvent(query: string): Promise<EventExperience> {
  const model = "gemini-3.1-pro-preview"; 

  const prompt = `
    Sei MatchAdvisor AI, un concierge sportivo premium per l'Italia.
    L'utente sta cercando: "${query}"
    
    1. Identifica l'evento sportivo specifico (Serie A, Tennis, F1, ecc.).
    2. Trova la venue esatta e la città in Italia.
    3. Usa Google Search grounding per trovare:
       - Fonti ufficiali o affidabili per i biglietti.
       - Hotel con le migliori recensioni a pochi passi o a breve distanza dalla venue.
       - Le migliori opzioni di trasporto (stazioni ferroviarie, linee di autobus) per raggiungere la venue.
       - I parcheggi più comodi vicino alla venue.
       - Ristoranti altamente qualificati adatti per un pasto pre-partita.
       - Fan bar popolari o pub sportivi nelle vicinanze.
    
    4. Classifica e filtra i risultati in base a:
       - Prossimità alla venue.
       - Qualità/Recensioni.
       - Utilità per un tifoso (es. "uscita facile" per i parcheggi, "servizio veloce" per i ristoranti).
    
    5. Genera un itinerario di esempio per il giorno dell'evento.
    6. Fornisci un riepilogo conciso del motivo per cui questa configurazione è ottimale.

    Restituisci i dati in formato JSON corrispondente all'interfaccia EventExperience. TUTTI i testi generati (nomi, descrizioni, riepiloghi, note dell'itinerario) DEVONO essere in ITALIANO.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          event: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              sport: { type: Type.STRING, enum: ['football', 'tennis', 'f1', 'other'] },
              venue: { type: Type.STRING },
              city: { type: Type.STRING },
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                }
              }
            },
            required: ['name', 'venue', 'city', 'sport']
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['ticket', 'hotel', 'transport', 'parking', 'restaurant', 'bar'] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                distance: { type: Type.STRING },
                url: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                aiScore: { type: Type.NUMBER },
                aiReasoning: { type: Type.STRING }
              }
            }
          },
          itinerary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                activity: { type: Type.STRING },
                location: { type: Type.STRING },
                note: { type: Type.STRING }
              }
            }
          },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Nessuna risposta dall'AI");
    return JSON.parse(text) as EventExperience;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("L'AI non è riuscita a generare l'esperienza. Riprova con una ricerca più specifica.");
  }
}

export async function getTrendingEvents(): Promise<EventDetails[]> {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    Identifica i 3-4 eventi sportivi più importanti e attesi in Italia che si svolgono in questi giorni (Marzo 2026) o nel prossimo weekend.
    Concentrati su Serie A, Tennis (ATP/WTA), Formula 1 o grandi eventi internazionali che coinvolgono atleti italiani.
    
    Restituisci i dati in formato JSON come un array di oggetti EventDetails.
    Ogni oggetto deve avere: id, name, sport, venue, city, date, description.
    TUTTI i testi devono essere in ITALIANO.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            sport: { type: Type.STRING, enum: ['football', 'tennis', 'f1', 'other'] },
            venue: { type: Type.STRING },
            city: { type: Type.STRING },
            date: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['id', 'name', 'sport', 'venue', 'city', 'date']
        }
      }
    }
  });

  try {
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as EventDetails[];
  } catch (e) {
    console.error("Failed to fetch trending events", e);
    return [];
  }
}

export async function chatWithConcierge(message: string, context: EventExperience): Promise<string> {
  const model = "gemini-3.1-pro-preview";
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `Sei il Concierge AI di MatchAdvisor. Stai aiutando un utente a perfezionare il suo viaggio sportivo per ${context.event.name} presso ${context.event.venue}. 
      Usa il contesto attuale: ${JSON.stringify(context)}. 
      Sii utile, preciso e concentrati sulla vicinanza e la comodità per il tifoso. 
      Se l'utente chiede modifiche (es. "hotel più economico", "parcheggio più vicino"), fornisci nuovi suggerimenti specifici usando Google Search grounding.
      TUTTE le tue risposte devono essere in ITALIANO.`,
      tools: [{ googleSearch: {} }]
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "Mi dispiace, non ho capito la richiesta.";
}

