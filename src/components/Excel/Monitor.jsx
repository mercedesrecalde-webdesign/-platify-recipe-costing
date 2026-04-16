import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { useNotifications } from '../UI/Notifications';
import { formatCurrency } from '../../utils/currencyConverter';
import excelData from '../../data/excel_full_data.json';
import { BarChart3, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Save } from 'lucide-react';

function Monitor() {
    const { t } = useTranslation();
    const { currency } = useSettings();
    const { success, info } = useNotifications();

    // Target profit margin (persisted)
    const [targetMargin, setTargetMargin] = useState(() => {
        const saved = localStorage.getItem('targetMargin');
        return saved ? parseFloat(saved) : 55;
    });

    useEffect(() => {
        localStorage.setItem('targetMargin', targetMargin.toString());
    }, [targetMargin]);

    // Sale prices storage (editable)
    const [salePrices, setSalePrices] = useState(() => {
        const saved = localStorage.getItem('salePrices');
        return saved ? JSON.parse(saved) : {};
    });

    // Save sale prices to localStorage
    useEffect(() => {
        localStorage.setItem('salePrices', JSON.stringify(salePrices));
    }, [salePrices]);

    // Calculate summary data from all recipes
    const monitorData = useMemo(() => {
        const recetas = [];

        // Process each recipe (1-5)
        for (let i = 1; i <= 5; i++) {
            const sheetName = `RECETA ${i}`;
            const sheet = excelData[sheetName] || excelData[`RECETA ${i} `];

            if (!sheet || !sheet.data) continue;

            const nombreReceta = sheet.data[1]?.[1] || `RECETA ${i}`;
            let porciones = 4;
            let totalCosto = 0;
            let totalCalorias = 0;
            let numIngredientes = 0;

            const nombreMatch = nombreReceta.match(/(\d+)\s*porciones/i);
            if (nombreMatch) {
                porciones = parseInt(nombreMatch[1]);
            }

            for (let j = 3; j < sheet.data.length; j++) {
                const row = sheet.data[j];
                if (!row) continue;

                const ingrediente = row[1];
                if (!ingrediente || ingrediente === 'TOTALES' || ingrediente === 'PESO TOTAL') {
                    if (ingrediente === 'TOTALES' || ingrediente === 'PESO TOTAL') {
                        totalCosto = row[6] || totalCosto;
                        totalCalorias = row[8] || totalCalorias;
                    }
                    break;
                }

                if (ingrediente) {
                    numIngredientes++;
                    if (!totalCosto) totalCosto += (row[6] || 0);
                    if (!totalCalorias) totalCalorias += (row[8] || 0);
                }
            }

            const costoPorPorcion = totalCosto / porciones;

            // Default suggested sale price (cost * 3 or based on target margin)
            const suggestedPrice = costoPorPorcion / (1 - targetMargin / 100);

            // Use saved price or suggested price
            const precioVenta = salePrices[`receta_${i}`] || suggestedPrice;

            recetas.push({
                numero: i,
                nombre: nombreReceta,
                porciones,
                totalCosto,
                costoPorPorcion,
                precioVenta,
                suggestedPrice,
                totalCalorias,
                caloriasPorPorcion: totalCalorias / porciones,
                numIngredientes
            });
        }

        // Calculate overall statistics
        const recetasConDatos = recetas.filter(r => r.totalCosto > 0);
        const costoPromedio = recetasConDatos.length > 0
            ? recetasConDatos.reduce((sum, r) => sum + r.costoPorPorcion, 0) / recetasConDatos.length
            : 0;

        const recetaMasCostosa = recetasConDatos.reduce((max, r) =>
            r.costoPorPorcion > max.costoPorPorcion ? r : max, recetasConDatos[0] || { costoPorPorcion: 0 });

        const recetaMasEconomica = recetasConDatos.reduce((min, r) =>
            r.costoPorPorcion < min.costoPorPorcion && r.costoPorPorcion > 0 ? r : min, recetasConDatos[0] || { costoPorPorcion: 0 });

        return {
            recetas,
            stats: {
                totalRecetas: recetasConDatos.length,
                costoPromedio,
                recetaMasCostosa,
                recetaMasEconomica
            }
        };
    }, [targetMargin, salePrices]);

    const calculateProfitMargin = (precioVenta, costo) => {
        if (!precioVenta || precioVenta === 0) return 0;
        return ((precioVenta - costo) / precioVenta) * 100;
    };

    const calculateProfit = (precioVenta, costo) => {
        return precioVenta - costo;
    };

    const handlePriceChange = (recetaNum, newPrice) => {
        setSalePrices(prev => ({
            ...prev,
            [`receta_${recetaNum}`]: parseFloat(newPrice) || 0
        }));
    };

    const resetToSuggested = (recetaNum) => {
        const receta = monitorData.recetas.find(r => r.numero === recetaNum);
        if (receta) {
            handlePriceChange(recetaNum, receta.suggestedPrice);
            info(t('monitorView.priceRestored'));
        }
    };

    return (
        <div>
            {/* Header with target margin */}
            <div style={{ marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{t('monitorView.title')}</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontSize: '1rem', fontWeight: '600' }}>
                        {t('monitorView.targetMargin')}:
                    </label>
                    <input
                        type="number"
                        className="input"
                        value={targetMargin}
                        onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 55)}
                        style={{ width: '100px', textAlign: 'center' }}
                        min="0"
                        max="100"
                    />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>%</span>
                    <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        💡 {t('monitorView.belowWarning')} <span style={{ color: 'var(--error)', fontWeight: '600' }}>{t('monitorView.red')}</span>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('monitorView.totalRecipes')}</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{monitorData.stats.totalRecetas}</div>
                        </div>
                        <BarChart3 size={40} style={{ opacity: 0.5 }} />
                    </div>
                </div>

                <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>{t('monitorView.avgCostPortion')}</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                {formatCurrency(monitorData.stats.costoPromedio, currency)}
                            </div>
                        </div>
                        <DollarSign size={40} style={{ color: 'var(--success)', opacity: 0.3 }} />
                    </div>
                </div>

                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>{t('monitorView.targetMarginLabel')}</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                {targetMargin}%
                            </div>
                        </div>
                        <TrendingUp size={40} style={{ color: 'var(--primary)', opacity: 0.3 }} />
                    </div>
                </div>
            </div>

            {/* Recipes Analysis Table */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ padding: '1rem', margin: 0, background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)' }}>
                    {t('monitorView.profitAnalysis')}
                </h3>
                <div style={{ overflow: 'auto' }}>
                    <table className="table" style={{ marginBottom: 0, minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'var(--primary)', color: 'white' }}>
                                <th style={{ color: 'white' }}>{t('monitorView.recipe')}</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>{t('monitorView.costPortion')}</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>{t('monitorView.salePrice')}</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>{t('monitorView.profit')}</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>{t('monitorView.marginPercent')}</th>
                                <th style={{ color: 'white', textAlign: 'center' }}>{t('monitorView.status')}</th>
                                <th style={{ color: 'white', textAlign: 'center', width: '100px' }}>{t('monitorView.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monitorData.recetas
                                .filter(r => r.totalCosto > 0)
                                .map((receta, index) => {
                                    const margen = calculateProfitMargin(receta.precioVenta, receta.costoPorPorcion);
                                    const ganancia = calculateProfit(receta.precioVenta, receta.costoPorPorcion);
                                    const cumpleObjetivo = margen >= targetMargin;
                                    const isCustomPrice = salePrices[`receta_${receta.numero}`] !== undefined;

                                    return (
                                        <tr
                                            key={receta.numero}
                                            style={{
                                                background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                                                borderLeft: cumpleObjetivo ? '4px solid var(--success)' : '4px solid var(--error)'
                                            }}
                                        >
                                            <td style={{ fontWeight: '600', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        textAlign: 'center',
                                                        lineHeight: '24px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        {receta.numero}
                                                    </span>
                                                    <span style={{ fontSize: '0.875rem' }}>{receta.nombre}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>
                                                {formatCurrency(receta.costoPorPorcion, currency)}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <input
                                                    type="number"
                                                    value={receta.precioVenta.toFixed(2)}
                                                    onChange={(e) => handlePriceChange(receta.numero, e.target.value)}
                                                    style={{
                                                        width: '120px',
                                                        textAlign: 'right',
                                                        fontFamily: 'monospace',
                                                        fontWeight: '700',
                                                        fontSize: '1em',
                                                        color: 'var(--primary)',
                                                        padding: '0.5rem',
                                                        border: isCustomPrice ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                        borderRadius: '4px',
                                                        background: 'var(--bg-primary)'
                                                    }}
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: cumpleObjetivo ? 'var(--success)' : 'var(--error)' }}>
                                                {formatCurrency(ganancia, currency)}
                                            </td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', fontSize: '1.2em', color: cumpleObjetivo ? 'var(--success)' : 'var(--error)' }}>
                                                {margen.toFixed(1)}%
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {cumpleObjetivo ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                                                        <CheckCircle size={20} />
                                                        <span style={{ fontWeight: '600' }}>{t('monitorView.ok')}</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--error)' }}>
                                                        <AlertTriangle size={20} />
                                                        <span style={{ fontWeight: '600' }}>{t('monitorView.low')}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {isCustomPrice && (
                                                    <button
                                                        onClick={() => resetToSuggested(receta.numero)}
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.375rem 0.625rem',
                                                            background: 'var(--primary)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        title={t('monitorView.restorePrice')}
                                                    >
                                                        {t('monitorView.reset')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alert Summary */}
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} color="var(--success)" />
                        {t('monitorView.adequateMargin')}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                        {monitorData.recetas.filter(r => r.totalCosto > 0 && calculateProfitMargin(r.precioVenta, r.costoPorPorcion) >= targetMargin).length}
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={16} color="var(--error)" />
                        {t('monitorView.lowMargin')}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--error)' }}>
                        {monitorData.recetas.filter(r => r.totalCosto > 0 && calculateProfitMargin(r.precioVenta, r.costoPorPorcion) < targetMargin).length}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Monitor;
