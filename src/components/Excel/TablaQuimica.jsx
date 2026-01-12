import React, { useState, useMemo } from 'react';
import nutritionalData from '../../data/nutritionalInfo.json';

function TablaQuimica() {
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
                <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>TABLA QUÍMICA DE ALIMENTOS</h2>
                <input
                    type="text"
                    className="input"
                    placeholder="Buscar alimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Mostrando {filteredAlimentos.length} de {alimentos.length} alimentos | Valores por 100g
                </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                        <tr style={{ background: 'var(--primary)', color: 'white' }}>
                            <th style={{ color: 'white' }}>CATEGORÍA</th>
                            <th style={{ color: 'white' }}>SUBCATEGORÍA</th>
                            <th style={{ color: 'white' }}>ALIMENTO</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>CALORÍAS<br />(kcal/100g)</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>H.C.<br />(g)</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>PROTEÍNAS<br />(g)</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>LÍPIDOS<br />(g)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlimentos.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No se encontraron resultados
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
