// Service for interacting with kanjiapi.dev
export interface KanjiAPIResponse {
  kanji: string;
  grade: number;
  stroke_count: number;
  meanings: string[];
  kun_readings: string[];
  on_readings: string[];
  name_readings: string[];
  jlpt: number | null;
  unicode: string;
  heisig_en: string;
}

class KanjiAPIService {
  private baseUrl = 'https://kanjiapi.dev/v1';

  async getKanjiByGrade(grade: number): Promise<KanjiAPIResponse[]> {
    try {
      console.log(`Fetching kanji for grade ${grade} from API...`);
      const response = await fetch(`${this.baseUrl}/kanji/grade-${grade}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch kanji for grade ${grade}: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`Successfully fetched ${data.length} kanji for grade ${grade}`);
      
      // Debug: Log first few items to see structure
      if (data.length > 0) {
        console.log('Sample API response:', data.slice(0, 3));
      }
      
      return data;
    } catch (error) {
      console.error('KanjiAPI Error:', error);
      throw error;
    }
  }

  async getKanjiDetails(kanji: string): Promise<KanjiAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/kanji/${encodeURIComponent(kanji)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for kanji: ${kanji}`);
      }
      return await response.json();
    } catch (error) {
      console.error('KanjiAPI Error:', error);
      throw error;
    }
  }

  async getAllGrades(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/kanji/grades`);
      if (!response.ok) {
        throw new Error('Failed to fetch available grades');
      }
      return await response.json();
    } catch (error) {
      console.error('KanjiAPI Error:', error);
      throw error;
    }
  }
}

export const kanjiAPI = new KanjiAPIService();