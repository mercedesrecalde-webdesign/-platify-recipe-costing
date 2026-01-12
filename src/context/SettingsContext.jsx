import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_RATES } from '../utils/currencyConverter';

const SettingsContext = createContext();

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : {
            currency: 'ARS',
            unitSystem: 'metric', // metric or imperial
            exchangeRates: DEFAULT_RATES
        };
    });

    useEffect(() => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }, [settings]);

    const updateCurrency = (currency) => {
        setSettings(prev => ({ ...prev, currency }));
    };

    const updateUnitSystem = (unitSystem) => {
        setSettings(prev => ({ ...prev, unitSystem }));
    };

    const updateExchangeRates = (rates) => {
        setSettings(prev => ({ ...prev, exchangeRates: { ...prev.exchangeRates, ...rates } }));
    };

    return (
        <SettingsContext.Provider value={{
            ...settings,
            updateCurrency,
            updateUnitSystem,
            updateExchangeRates
        }}>
            {children}
        </SettingsContext.Provider>
    );
}
