import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import nutritionalData from '../../data/nutritionalInfo.json';

function TablaQuimica() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    // Use the extracted nutritional data directly
    const alimentos = useMemo(() => {
        return nutritionalData.map(item => ({
            categoria: item.category,
            subcategoria: item.subcategory,
            nombre: item.name,
            calorias: item.calories,
            hc: item.carbs,
            proteinas: item.protein,
            lipidos: item.fat
        }));
    }, []);

    const filteredAlimentos = alimentos.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.categoria && item.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{t('chemical.title')}</h2>
                <input
                    type="text"
                    className="input"
                    placeholder={t('chemical.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {t('chemical.showing')} {filteredAlimentos.length} {t('chemical.of')} {alimentos.length} {t('chemical.foods')} | {t('chemical.valuesPer100g')}
                </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                        <tr style={{ background: 'var(--primary)', color: 'white' }}>
                            <th style={{ color: 'white' }}>{t('chemical.category')}</th>
                            <th style={{ color: 'white' }}>{t('chemical.subcategory')}</th>
                            <th style={{ color: 'white' }}>{t('chemical.food')}</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>{t('chemical.calories')}<br />(kcal/100g)</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>{t('chemical.carbs')}<br />(g)</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>{t('chemical.protein')}<br />(g)</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>{t('chemical.fat')}<br />(g)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlimentos.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    {t('chemical.noResults')}
                                </td>
                            </tr>
                        ) : (
                            filteredAlimentos.map((item, index) => (
                                <tr key={index} style={{ background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)' }}>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.categoria}</td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.subcategoria}</td>
                                    <td style={{ fontWeight: '500' }}>{item.nombre}</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>
                                        {typeof item.calorias === 'number' ? item.calorias.toFixed(0) : item.calorias}
                                    </td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                        {typeof item.hc === 'number' ? item.hc.toFixed(1) : item.hc}
                                    </td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                        {typeof item.proteinas === 'number' ? item.proteinas.toFixed(1) : item.proteinas}
                                    </td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                        {typeof item.lipidos === 'number' ? item.lipidos.toFixed(1) : item.lipidos}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TablaQuimica;
