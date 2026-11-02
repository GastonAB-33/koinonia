import { create } from 'zustand';
import { LexiconAnalysis } from '../types/lexicon';
import { geminiService, getGeminiApiKey, setGeminiApiKey } from '../services/ai/geminiAIService';

interface LexiconStoreState {
  isOpen: boolean;
  selectedVerseRef: string;
  selectedWord: string;
  analysis: LexiconAnalysis | null;
  isLoading: boolean;
  error: string | null;
  hasApiKey: boolean;

  openLexicon: (verseRef: string, wordOrPhrase: string) => Promise<void>;
  closeLexicon: () => void;
  saveApiKey: (key: string) => void;
  testApiKey: (key: string) => Promise<{ success: boolean; message: string }>;
  reanalyze: () => Promise<void>;
}

export const useLexiconStore = create<LexiconStoreState>((set, get) => ({
  isOpen: false,
  selectedVerseRef: '',
  selectedWord: '',
  analysis: null,
  isLoading: false,
  error: null,
  hasApiKey: Boolean(getGeminiApiKey()),

  openLexicon: async (verseRef: string, wordOrPhrase: string) => {
    set({
      isOpen: true,
      selectedVerseRef: verseRef,
      selectedWord: wordOrPhrase,
      isLoading: true,
      error: null,
      hasApiKey: Boolean(getGeminiApiKey())
    });

    try {
      const data = await geminiService.analyzeOriginalLanguage(verseRef, wordOrPhrase);
      set({ analysis: data, isLoading: false });
    } catch (err: any) {
      console.error('Error al analizar lengua original con Gemini:', err);
      set({
        isLoading: false,
        error: err?.message || 'No se pudo completar el análisis léxico de la palabra seleccionada.'
      });
    }
  },

  reanalyze: async () => {
    const { selectedVerseRef, selectedWord } = get();
    if (!selectedVerseRef || !selectedWord) return;
    set({ isLoading: true, error: null, hasApiKey: Boolean(getGeminiApiKey()) });
    try {
      const data = await geminiService.analyzeOriginalLanguage(selectedVerseRef, selectedWord);
      set({ analysis: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al reanalizar.' });
    }
  },

  closeLexicon: () => {
    set({ isOpen: false });
  },

  saveApiKey: (key: string) => {
    setGeminiApiKey(key);
    set({ hasApiKey: Boolean(key.trim()) });
  },

  testApiKey: async (key: string) => {
    return geminiService.testConnection(key);
  }
}));