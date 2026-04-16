import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { useNotifications } from '../UI/Notifications';
import { formatCurrency } from '../../utils/currencyConverter';
import excelData from '../../data/excel_full_data.json';
import { BarChart3, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Target, Star, HelpCircle, PackageX } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

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

    useEffect(() => {
        localStorage.setItem('salePrices', JSON.stringify(salePrices));
    }, [salePrices]);

    // Fixed Costs (for Break Even point)
    const [fixedCosts, setFixedCosts] = useState(() => {
        const saved = localStorage.getItem('fixedCosts');
        return saved ? parseFloat(saved) : 500000;
    });

    useEffect(() => {
        localStorage.setItem('fixedCosts', fixedCosts.toString());
    }, [fixedCosts]);

    // Sales Volumes (for BCG Matrix)
    const [salesVolumes, setSalesVolumes] = useState(() => {
        const saved = localStorage.getItem('salesVolumes');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('salesVolumes', JSON.stringify(salesVolumes));
    }, [salesVolumes]);

    // Calculate summary data from all recipes
    const monitorData = useMemo(() => {
        const recetas = [];
        let totalVolumeGlobal = 0;
        let totalMarginGlobal = 0;

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
            const suggestedPrice = costoPorPorcion / (1 - targetMargin / 100);
            const precioVenta = salePrices[`receta_${i}`] || suggestedPrice;
            const ganancia = precioVenta - costoPorPorcion;
            const volumen = salesVolumes[`receta_${i}`] || 0;
            
            // Break Even in portions (assuming this single dish has to cover ALL fixed costs - isolation model)
            const breakEvenUnits = ganancia > 0 ? Math.ceil(fixedCosts / ganancia) : Infinity;

            totalVolumeGlobal += volumen;
            totalMarginGlobal += ganancia;

            recetas.push({
                numero: i,
                nombre: nombreReceta,
                porciones,
                totalCosto,
                costoPorPorcion,
                precioVenta,
                suggestedPrice,
                ganancia,
                volumen,
                breakEvenUnits,
                totalCalorias,
                caloriasPorPorcion: totalCalorias / porciones,
                numIngredientes
            });
        }

        const recetasConDatos = recetas.filter(r => r.totalCosto > 0);
        const costoPromedio = recetasConDatos.length > 0
            ? recetasConDatos.reduce((sum, r) => sum + r.costoPorPorcion, 0) / recetasConDatos.length
            : 0;

        const avgVolume = recetasConDatos.length > 0 ? totalVolumeGlobal / recetasConDatos.length : 0;
        const avgMargin = recetasConDatos.length > 0 ? totalMarginGlobal / recetasConDatos.length : 0;

        // Apply BCG Classification
        const recetasBCG = recetasConDatos.map(r => {
            let bcgClass = '';
            let bcgColor = '';
            if (r.volumen >= avgVolume && r.ganancia >= avgMargin) { bcgClass = 'Estrella'; bcgColor = 'var(--success)'; }
            else if (r.volumen >= avgVolume && r.ganancia < avgMargin) { bcgClass = 'Vaca (Caballito)'; bcgColor = 'var(--info)'; }
            else if (r.volumen < avgVolume && r.ganancia >= avgMargin) { bcgClass = 'Incógnita'; bcgColor = 'var(--warning)'; }
            else { bcgClass = 'Perro'; bcgColor = 'var(--danger)'; }
            
            return { ...r, bcgClass, bcgColor };
        });

        return {
            recetas: recetasBCG,
            stats: {
                totalRecetas: recetasConDatos.length,
                costoPromedio,
                avgVolume,
                avgMargin
            }
        };
    }, [targetMargin, salePrices, fixedCosts, salesVolumes]);

    const handlePriceChange = (recetaNum, newPrice) => {
        setSalePrices(prev => ({ ...prev, [`receta_${recetaNum}`]: parseFloat(newPrice) || 0 }));
    };

    const handleVolumeChange = (recetaNum, newVolume) => {
        setSalesVolumes(prev => ({ ...prev, [`receta_${recetaNum}`]: parseInt(newVolume) || 0 }));
    };

    const resetToSuggested = (recetaNum) => {
        const receta = monitorData.recetas.find(r => r.numero === recetaNum);
        if (receta) {
            handlePriceChange(recetaNum, receta.suggestedPrice);
            info('Precio restablecido a sugerencia');
        }
    };

    // Custom Tooltip for BCG Grid
    const CustomBCGTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', border: `2px solid ${data.bcgColor}`, borderRadius: '8px', color: 'var(--text-primary)' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{data.nombre}</p>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Categoría: <strong style={{ color: data.bcgColor }}>{data.bcgClass}</strong></p>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Ventas: {data.volumen} porc.</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Ganancia: {formatCurrency(data.ganancia, currency)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Control Panel: Margins & Fixed Costs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={20}/> Margen de Rentabilidad Objetivo (%)
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="number"
                            className="input"
                            value={targetMargin}
                            onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 55)}
                            style={{ width: '120px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}
                            min="0"
                            max="100"
                        />
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>%</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.75rem', marginBottom: 0 }}>
                        Define el piso de rentabilidad esperado. Las celdas rojas indican platos bajo este límite.
                    </p>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={20}/> Costos Fijos Mensuales Principales
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>$</span>
                        <input
                            type="number"
                            className="input"
                            value={fixedCosts}
                            onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', maxWidth: '200px', fontSize: '1.25rem', fontWeight: 'bold' }}
                            min="0"
                        />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.75rem', marginBottom: 0 }}>
                        (Ej: Alquiler, sueldos, servicios). Se usa para calcular el <strong>Punto de Equilibrio</strong> por receta.
                    </p>
                </div>
            </div>

            {/* Recipes Analysis Table */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', marginBottom: '3rem' }}>
                <h3 style={{ padding: '1rem', margin: 0, background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} color="var(--primary)" /> Análisis Integral de KPIs
                </h3>
                <div style={{ overflow: 'x', WebkitOverflowScrolling: 'touch' }}>
                    <table className="table" style={{ marginBottom: 0, minWidth: '1100px' }}>
                        <thead>
                            <tr style={{ background: 'var(--primary)', color: 'white' }}>
                                <th style={{ color: 'white' }}>Receta</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>Costo/Porc</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>Pto. Eq. (Costo=Venta)</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>Pto. Eq. (Porciones)</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>Ventas Est./Mes</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>Precio Venta</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>Ganancia Un.</th>
                                <th style={{ color: 'white', textAlign: 'right' }}>Margen %</th>
                                <th style={{ color: 'white', textAlign: 'center' }}>BCG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monitorData.recetas.map((receta, index) => {
                                const margen = (receta.ganancia / receta.precioVenta) * 100;
                                const cumpleObjetivo = margen >= targetMargin;
                                const isCustomPrice = salePrices[`receta_${receta.numero}`] !== undefined;

                                return (
                                    <tr key={receta.numero} style={{ background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)', borderLeft: cumpleObjetivo ? '4px solid var(--success)' : '4px solid var(--error)' }}>
                                        <td style={{ fontWeight: '600', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem', fontWeight: '700' }}>{receta.numero}</span>
                                                <span style={{ fontSize: '0.875rem' }}>{receta.nombre}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>
                                            {formatCurrency(receta.costoPorPorcion, currency)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85em', color: 'var(--text-tertiary)' }}>
                                            {formatCurrency(receta.costoPorPorcion, currency)} <br/>
                                            <span style={{ fontSize: '0.75em' }}>Mínimo Venta</span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '700', color: receta.breakEvenUnits === Infinity ? 'var(--error)' : 'var(--text-primary)' }}>
                                            {receta.breakEvenUnits === Infinity ? '¡Pérdida!' : `${receta.breakEvenUnits} pts`}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>P/ cubrir C. Fíjos</div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                value={receta.volumen}
                                                onChange={(e) => handleVolumeChange(receta.numero, e.target.value)}
                                                style={{ width: '80px', textAlign: 'right', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 'bold' }}
                                                min="0"
                                            />
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                value={receta.precioVenta.toFixed(2)}
                                                onChange={(e) => handlePriceChange(receta.numero, e.target.value)}
                                                style={{ width: '100px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)', padding: '0.5rem', border: isCustomPrice ? '2px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-primary)' }}
                                                step="0.01" min="0" title={isCustomPrice ? "Precio Editado Manualmente" : "Precio Sugerido Automático"}
                                            />
                                            {isCustomPrice && (
                                                <button onClick={() => resetToSuggested(receta.numero)} style={{ display: 'block', width: '100%', fontSize: '0.7rem', marginTop: '4px', padding: '2px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}>
                                                    Sugerido
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: cumpleObjetivo ? 'var(--success)' : 'var(--error)' }}>
                                            {formatCurrency(receta.ganancia, currency)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', fontSize: '1.1em', color: cumpleObjetivo ? 'var(--success)' : 'var(--error)' }}>
                                            {(isNaN(margen) || !isFinite(margen)) ? '0.0' : margen.toFixed(1)}%
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', background: `${receta.bcgColor}15`, color: receta.bcgColor, border: `1px solid ${receta.bcgColor}`, borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', minWidth: '90px' }}>
                                                {receta.bcgClass.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Matriz BCG Visual */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20}/> Ingeniería de Menú (Matriz Kasavana-Smith / BCG)
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Cruza la rentabilidad (Margen) vs popularidad (Volumen). Modifica los "Ventas Est./Mes" en la tabla para posicionar tus platos en la matriz en tiempo real.
                </p>

                <div style={{ height: '500px', position: 'relative' }}>
                    {/* Background Labels for Quadrants */}
                    <div style={{ position: 'absolute', top: '10%', right: '10%', opacity: 0.1, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--success)' }}>
                        <Star size={64} /><h2>Estrella</h2>
                    </div>
                    <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.1, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--warning)' }}>
                        <HelpCircle size={64} /><h2>Incógnita</h2>
                    </div>
                    <div style={{ position: 'absolute', bottom: '10%', right: '10%', opacity: 0.1, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--info)' }}>
                        <DollarSign size={64} /><h2>Caballito</h2>
                    </div>
                    <div style={{ position: 'absolute', bottom: '10%', left: '10%', opacity: 0.1, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--danger)' }}>
                        <PackageX size={64} /><h2>Perro</h2>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            
                            {/* X Axis: Ventas / Popularidad */}
                            <XAxis 
                                type="number" 
                                dataKey="volumen" 
                                name="Ventas (Porciones)" 
                                unit=" u." 
                                stroke="var(--text-secondary)"
                                label={{ value: 'Popularidad (Volumen de Ventas)', position: 'insideBottom', offset: -10, fill: 'var(--text-primary)' }}
                            />
                            
                            {/* Y Axis: Rentabilidad / Ganancia */}
                            <YAxis 
                                type="number" 
                                dataKey="ganancia" 
                                name="Margen Contribución" 
                                stroke="var(--text-secondary)"
                                label={{ value: 'Rentabilidad (Ganancia Unitaria)', angle: -90, position: 'insideLeft', fill: 'var(--text-primary)' }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            
                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomBCGTooltip />} />
                            
                            {/* Divisores de Cuadrante (Promedios) */}
                            <ReferenceLine x={monitorData.stats.avgVolume} stroke="var(--text-tertiary)" strokeDasharray="5 5" label={{ value: 'Prom. Ventas', position: 'top', fill: 'var(--text-tertiary)' }} />
                            <ReferenceLine y={monitorData.stats.avgMargin} stroke="var(--text-tertiary)" strokeDasharray="5 5" label={{ value: 'Prom. Margen', position: 'right', fill: 'var(--text-tertiary)' }} />
                            
                            <Scatter name="Platos" data={monitorData.recetas}>
                                {monitorData.recetas.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.bcgColor} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Monitor;
