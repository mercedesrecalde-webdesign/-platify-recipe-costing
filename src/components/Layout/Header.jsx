import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon, Languages, Settings } from 'lucide-react';

function Header() {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const { currency, unitSystem, updateCurrency, updateUnitSystem } = useSettings();
    const [showSettings, setShowSettings] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                        src="/platify-logo.png"
                        alt="PLATIFY Logo"
                        style={{
                            height: '110px',
                            width: 'auto',
                            filter: theme === 'dark' ? 'invert(1)' : 'none',
                            mixBlendMode: theme === 'dark' ? 'screen' : 'normal',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Language Selector */}
                    <select
                        className="input"
                        value={i18n.language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem' }}
                    >
                        <option value="es">🇪🇸 ES</option>
                        <option value="en">🇬🇧 EN</option>
                        <option value="fr">🇫🇷 FR</option>
                        <option value="it">🇮🇹 IT</option>
                        <option value="pt">🇧🇷 PT</option>
                    </select>

                    {/* Currency Selector */}
                    <select
                        className="input"
                        value={currency}
                        onChange={(e) => updateCurrency(e.target.value)}
                        style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem' }}
                    >
                        <option value="ARS">$ ARS</option>
                        <option value="USD">US$ USD</option>
                        <option value="EUR">€ EUR</option>
                        <option value="BRL">R$ BRL</option>
                    </select>

                    {/* Unit System Toggle */}
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                        title={unitSystem === 'metric' ? 'Métrico' : 'Imperial'}
                    >
                        {unitSystem === 'metric' ? 'kg/g' : 'lb/oz'}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={toggleTheme}
                        style={{ padding: '0.5rem' }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
