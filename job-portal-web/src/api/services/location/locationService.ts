//TODO: Please note that this will be moved to backend. Just a demo
const LOCATION_API_URL = "https://api.locationiq.com/v1/autocomplete";
const API_KEY = "pk.949762bf06b6cd667c5fcea602b28e6a";

interface LocationSuggestion {
  display_name: string;
  place_id?: string;
  lat?: string;
  lon?: string;
}

export const locationService = {
  getLocationSuggestions: async (query: string): Promise<string[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(
        `${LOCATION_API_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error(`Location API responded with status ${response.status}`);
      }
      
      const data: LocationSuggestion[] = await response.json();
      return data.map((item: LocationSuggestion) => item.display_name).slice(0, 5);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      throw error;
    }
  }
};