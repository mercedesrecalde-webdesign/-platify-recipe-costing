import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import PreciosMayoristas from '../Excel/PreciosMayoristas';
import FactorCorreccion from '../Excel/FactorCorreccion';
import TablaQuimica from '../Excel/TablaQuimica';
import Monitor from '../Excel/Monitor';
import RecipesList from '../Recipes/RecipesList';
import SchoolNutrition from '../Excel/SchoolNutrition';
import { FileSpreadsheet, Scale, Apple, BarChart3, BookOpen, GraduationCap } from 'lucide-react';

function ExcelWorkbook() {
    const { t, i18n } = useTranslation();
    const [activeSheet, setActiveSheet] = useState('precios');

    const sheets = [
        { id: 'precios', nameKey: 'tabs.prices', icon: FileSpreadsheet, component: PreciosMayoristas },
        { id: 'misrecetas', nameKey: 'tabs.recipes', icon: BookOpen, component: RecipesList },
        { id: 'factor', nameKey: 'tabs.correction', icon: Scale, component: FactorCorreccion },
        { id: 'nutricion', nameKey: 'tabs.chemistry', icon: Apple, component: TablaQuimica },
        { id: 'comedor', nameKey: 'tabs.school', icon: GraduationCap, component: SchoolNutrition },
        { id: 'monitor', nameKey: 'tabs.monitor', icon: BarChart3, component: Monitor }
    ];

    const ActiveComponent = sheets.find(s => s.id === activeSheet)?.component;
    const activeRecetaNum = sheets.find(s => s.id === activeSheet)?.recetaNum;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Excel-style sheet tabs */}
            <div style={{
                display: 'flex',
                background: 'var(--bg-tertiary)',
                borderBottom: '2px solid var(--border-color)',
                overflowX: 'auto',
                padding: '0.5rem 1rem',
                gap: '0.25rem'
            }}>
                {sheets.map((sheet) => {
                    const Icon = sheet.icon;
                    return (
                        <button
                            key={sheet.id}
                            onClick={() => setActiveSheet(sheet.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeSheet === sheet.id ? 'var(--bg-secondary)' : 'transparent',
                                border: activeSheet === sheet.id ? '1px solid var(--border-color)' : '1px solid transparent',
                                borderBottom: activeSheet === sheet.id ? '2px solid var(--primary)' : 'none',
                                color: activeSheet === sheet.id ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: activeSheet === sheet.id ? '600' : '400',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.2s',
                                fontFamily: 'inherit'
                            }}
                        >
                            <Icon size={14} />
                            {t(sheet.nameKey)}
                        </button>
                    );
                })}
            </div>

            {/* Sheet content */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                background: 'var(--bg-primary)',
                padding: '1rem'
            }}>
                {ActiveComponent && (
                    <ActiveComponent recetaNum={activeRecetaNum} />
                )}
            </div>
        </div>
    );
}

export default ExcelWorkbook;

