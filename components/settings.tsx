import React, { createContext, useContext, useEffect, useState } from "react";

interface Settings {
  openAiKey?: string;
  showPrompt: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  openAiKey: undefined,
  showPrompt: false,
} as const;

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const storedSettings = localStorage.getItem("settings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const next = { ...settings, ...newSettings } as const;
    setSettings(next);
    localStorage.setItem("settings", JSON.stringify(next));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
