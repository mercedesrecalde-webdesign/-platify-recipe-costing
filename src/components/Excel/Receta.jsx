import React, { useState, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/currencyConverter';
import excelData from '../../data/excel_full_data.json';

function Receta({ recetaNum = 1 }) {
    const { currency } = useSettings();
    const { getCorrectionFactor, ingredients } = useData();
    // Try multiple variations of the sheet name (with and without spaces)
    const sheet = excelData[`RECETA ${recetaNum}`] ||
        excelData[`RECETA ${recetaNum} `] ||
        null;

    // Parse recipe data
    const recetaData = useMemo(() => {
        if (!sheet || !sheet.data) return null;

        // Get recipe name from row 2, column B
        const nombreReceta = sheet.data[1]?.[1] || `RECETA ${recetaNum}`;

        const ingredientes = [];
        let totalCostoReceta = 0;
        let totalCalorias = 0;
        let porciones = 4; // Default

        // Extract portions if available (usually in the title)
        const nombreMatch = nombreReceta.match(/(\d+)\s*porciones/i);
        if (nombreMatch) {
            porciones = parseInt(nombreMatch[1]);
        }

        // Start from row 4 (index 3) - after headers
        for (let i = 3; i < sheet.data.length; i++) {
            const row = sheet.data[i];
            if (!row) continue;

            const ingrediente = row[1]; // Column B
            const neto = row[2]; // Column C - NETO
            const um = row[3]; // Column D - U.M.
            const fc = row[4]; // Column E - FC (Factor Corrección)
            const bruto = row[5]; // Column F - BRUTO
            const costoTotal = row[6]; // Column G - Costo total
            const costoPorcion = row[7]; // Column H - COSTO / PORCION
            const valorCalorico = row[8]; // Column I - valor calórico total
            const caloriasPorcion = row[9]; // Column J - valor calorico por porcion

            // Skip summary rows and totals rows
            if (!ingrediente ||
                ingrediente === 'TOTALES' ||
                ingrediente === 'PESO TOTAL' ||
                ingrediente === 'Ingredientes' ||
                typeof ingrediente !== 'string') {
                if (ingrediente === 'TOTALES' || ingrediente === 'PESO TOTAL') {
                    // This is the totals row
                    totalCostoReceta = (typeof costoTotal === 'number' ? costoTotal : 0);
                    totalCalorias = (typeof valorCalorico === 'number' ? valorCalorico : 0);
                }
                break;
            }

            if (ingrediente && neto && typeof neto === 'number') {
                try {
                    const dbIng = ingredients.find(i => 
                        (i.name || '').toLowerCase() === ingrediente.toLowerCase() ||
                        (typeof i.name === 'string' && i.name.toLowerCase().includes(ingrediente.toLowerCase()))
                    );

                    const liveFc = getCorrectionFactor(ingrediente) || 1;
                    const brutoCalculado = neto * liveFc;

                    let costoTotalCalculado = 0;
                    if (dbIng) {
                        const amount = dbIng.quantity || 1;
                        const price = dbIng.purchase_price || dbIng.purchasePrice || 0;
                        const dbUnit = (dbIng.unit || '').toUpperCase();
                        let baseAmount = amount;
                        if (dbUnit === 'KG' && (um === 'grs' || um === 'g')) baseAmount = amount * 1000;
                        if (dbUnit === 'LTS' && (um === 'cc' || um === 'ml')) baseAmount = amount * 1000;
                        if (dbUnit === 'L' && (um === 'cc' || um === 'ml')) baseAmount = amount * 1000;
                        costoTotalCalculado = (brutoCalculado / baseAmount) * price;
                    } else {
                        costoTotalCalculado = (typeof costoTotal === 'number' ? costoTotal : 0);
                    }

                    ingredientes.push({
                        nombre: ingrediente,
                        neto: neto,
                        um: um || 'grs',
                        fc: liveFc,
                        bruto: brutoCalculado,
                        costoTotal: costoTotalCalculado,
                        costoPorcion: costoTotalCalculado / porciones,
                        valorCalorico: (typeof valorCalorico === 'number' ? valorCalorico : 0),
                        caloriasPorcion: (typeof caloriasPorcion === 'number' ? caloriasPorcion : 0)
                    });
                } catch (error) {
                    console.warn(`Error processing ingredient: ${ingrediente}`, error);
                }
            }
        }

        // Calculate totals if not present
        if (totalCostoReceta === 0) {
            totalCostoReceta = ingredientes.reduce((sum, ing) => sum + (ing.costoTotal || 0), 0);
        }
        if (totalCalorias === 0) {
            totalCalorias = ingredientes.reduce((sum, ing) => sum + (ing.valorCalorico || 0), 0);
        }

        return {
            nombre: nombreReceta,
            porciones,
            ingredientes,
            totalCosto: totalCostoReceta,
            costoPorPorcion: totalCostoReceta / porciones,
            totalCalorias: totalCalorias,
            caloriasPorPorcion: totalCalorias / porciones
        };
    }, [sheet, recetaNum, ingredients, getCorrectionFactor]);

    if (!recetaData) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <p>No hay datos disponibles para esta receta</p>
            </div>
        );
    }

    return (
        <div>
            {/* Recipe Header */}
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{recetaData.nombre}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Porciones</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>{recetaData.porciones}</div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costo Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                            {formatCurrency(recetaData.totalCosto, currency)}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costo por Porción</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)' }}>
                            {formatCurrency(recetaData.costoPorPorcion, currency)}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calorías/Porción</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {recetaData.caloriasPorPorcion.toFixed(0)} kcal
                        </div>
                    </div>
                </div>
            </div>

            {/* Ingredients Table */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                        <tr style={{ background: 'var(--primary)', color: 'white' }}>
                            <th style={{ color: 'white' }}>INGREDIENTES</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>NETO</th>
                            <th style={{ color: 'white' }}>U.M.</th>
                            <th style={{ color: 'white', textAlign: 'center' }}>FC</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>BRUTO</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>COSTO TOTAL</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>COSTO/PORCIÓN</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>CALORÍAS TOTAL</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>CALORÍAS/PORCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recetaData.ingredientes.map((ing, index) => (
                            <tr key={index} style={{ background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)' }}>
                                <td style={{ fontWeight: '500' }}>{ing.nombre}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{ing.neto.toFixed(2)}</td>
                                <td>{ing.um}</td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--warning)' }}>
                                    {ing.fc.toFixed(2)}
                                </td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{ing.bruto.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>
                                    {formatCurrency(ing.costoTotal, currency)}
                                </td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                    {formatCurrency(ing.costoPorcion, currency)}
                                </td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                    {ing.valorCalorico.toFixed(0)}
                                </td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                    {ing.caloriasPorcion.toFixed(0)}
                                </td>
                            </tr>
                        ))}
                        {/* Totals Row */}
                        <tr style={{ background: 'var(--primary-light)', fontWeight: '700', fontSize: '1.1em' }}>
                            <td colSpan="5" style={{ textAlign: 'right' }}>TOTALES</td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--primary)' }}>
                                {formatCurrency(recetaData.totalCosto, currency)}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--primary)' }}>
                                {formatCurrency(recetaData.costoPorPorcion, currency)}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--primary)' }}>
                                {recetaData.totalCalorias.toFixed(0)}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--primary)' }}>
                                {recetaData.caloriasPorPorcion.toFixed(0)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Receta;
