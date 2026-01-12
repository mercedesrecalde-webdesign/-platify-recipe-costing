import React from 'react';
import correctionFactorsData from '../../data/correctionFactors.json';

function FactorCorreccion() {
    // Group correction factors by category

    const categorias = {
        vegetales: correctionFactorsData.filter(f => f.category === 'vegetables').map(f => ({
            nombre: f.name,
            fc: f.correctionFactor,
            merma: f.wastePercentage
        })),
        frutas: correctionFactorsData.filter(f => f.category === 'fruits').map(f => ({
            nombre: f.name,
            fc: f.correctionFactor,
            merma: f.wastePercentage
        })),
        carnes: correctionFactorsData.filter(f => f.category === 'meat').map(f => ({
            nombre: f.name,
            fc: f.correctionFactor,
            merma: f.wastePercentage
        })),
        otros: correctionFactorsData.filter(f => f.category === 'other').map(f => ({
            nombre: f.name,
            fc: f.correctionFactor,
            merma: f.wastePercentage
        }))
    };

    const renderTable = (titulo, items, color) => (
        <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{
                background: color,
                color: 'white',
                padding: '0.75rem',
                margin: 0,
                fontSize: '1rem',
                fontWeight: '700',
                textAlign: 'center'
            }}>
                {titulo}
            </h3>
            <table className="table" style={{ marginBottom: 0, fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                        <th style={{ fontSize: '0.75rem' }}>NOMBRE</th>
                        <th style={{ fontSize: '0.75rem', textAlign: 'center' }}>FC</th>
                        <th style={{ fontSize: '0.75rem', textAlign: 'center' }}>MERMA</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Sin datos</td></tr>
                    ) : (
                        items.map((item, index) => (
                            <tr key={index} style={{ background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)' }}>
                                <td>{item.nombre}</td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: '600' }}>
                                    {typeof item.fc === 'number' ? item.fc.toFixed(2) : item.fc}
                                </td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                    {item.merma === '–' ? '–' : (typeof item.merma === 'number' ? (item.merma * 100).toFixed(0) + '%' : item.merma)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>FACTOR DE CORRECCIÓN Y MERMA</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Factores de corrección aplicables según el tipo de alimento para calcular pérdidas por limpieza, cocción y preparación
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
            }}>
                {renderTable('VEGETALES Y HORTALIZAS', categorias.vegetales, '#10b981')}
                {renderTable('FRUTAS', categorias.frutas, '#f59e0b')}
                {renderTable('CARNES', categorias.carnes, '#ef4444')}
                {renderTable('OTROS', categorias.otros, '#6366f1')}
            </div>
        </div>
    );
}

export default FactorCorreccion;
