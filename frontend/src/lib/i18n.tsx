"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'te';

type Translations = {
  [key: string]: { en: string; te: string };
};

const translations: Translations = {
  dashboard: { en: 'Dashboard', te: 'డ్యాష్‌బోర్డ్' },
  explore: { en: 'Explore', te: 'అన్వేషించండి' },
  planTrip: { en: 'Plan Trip', te: 'ప్రయాణాన్ని ప్లాన్ చేయండి' },
  compare: { en: 'Compare', te: 'తులనించండి' },
  myTrips: { en: 'My Trips', te: 'నా ప్రయాణాలు' },
  bookings: { en: 'Bookings', te: 'బుకింగ్స్' },
  groupTrips: { en: 'Group Trips', te: 'గ్రూప్ ట్రిప్స్' },
  map: { en: 'Map', te: 'మ్యాప్' },
  aiAssistant: { en: 'AI Assistant', te: 'AI సహాయకుడు' },
  omiVoice: { en: 'Omi Voice & Meetings', te: 'ఓమీ వాయిస్ & మీటింగ్స్' },
  travelIntelligence: { en: 'Travel Intelligence', te: 'ప్రయాణ ఇంటెలిజెన్స్' },
  tripMonitor: { en: 'Trip Monitor', te: 'ట్రిప్ మానిటర్' },
  aiReplan: { en: 'AI Replan', te: 'AI రీ-ప్లాన్' },
  expenses: { en: 'Expenses', te: 'ఖర్చులు' },
  coins: { en: 'Coins', te: 'కాయిన్స్' },
  packing: { en: 'Smart Packing', te: 'స్మార్ట్ ప్యాకింగ్' },
  documents: { en: 'Documents', te: 'డాక్యుమెంట్స్' },
  safety: { en: 'Safety', te: 'సేఫ్టీ' },
  community: { en: 'Community', te: 'కమ్యూనిటీ' },
  notifications: { en: 'Notifications', te: 'నోటిఫికేషన్లు' },
  profile: { en: 'Profile', te: 'ప్రొఫైల్' },
  settings: { en: 'Settings', te: 'సెట్టింగ్స్' },
};

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const t = (key: string) => {
    const entry = translations[key];
    if (!entry) return key; // fallback to key if missing
    return entry[language] || key;
  };
  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
