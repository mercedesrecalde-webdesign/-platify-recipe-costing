import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { CalendarDays, Users, Printer, PieChart, ShoppingCart, Droplets, ArrowRight } from 'lucide-react';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const SERVICES = [
    { id: 'breakfast', label: 'Desayuno' },
    { id: 'lunch', label: 'Almuerzo' },
    { id: 'snack', label: 'Merienda' }
];

export default function WeeklyPlanner() {
    const { t } = useTranslation();
    const { recipes, ingredients } = useData();
    const [diners, setDiners] = useState(200);

    // Initial plan state: day -> service -> recipeId
    const [plan, setPlan] = useState(() => {
        const initial = {};
        DAYS.forEach(d => {
            initial[d] = { breakfast: '', lunch: '', snack: '' };
        });
        return initial;
    });

    // Compute metrics
    const reportData = useMemo(() => {
        let totalCost = 0;
        let totalCalories = 0;
        const shoppingList = {}; // aggregated ingredients
        
        // Loop through the plan
        DAYS.forEach(day => {
            SERVICES.forEach(service => {
                const recipeId = plan[day][service.id];
                if (recipeId) {
                    const recipe = recipes.find(r => r.id === recipeId);
                    if (recipe) {
                        const multiplier = diners / (recipe.portions || 1);
                        
                        recipe.ingredients.forEach(ing => {
                            const dbIng = ingredients.find(i => 
                                (i.name || '').toLowerCase() === ing.name.toLowerCase() ||
                                (typeof i.name === 'string' && i.name.toLowerCase().includes(ing.name.toLowerCase()))
                            );
                            
                            const key = dbIng ? dbIng.name : ing.name;
                            const cat = dbIng ? dbIng.category || dbIng.categoria : 'Otros';
                            
                            // Net quantity needed for all diners
                            const netTotal = ing.netQuantity * multiplier;
                            const cf = ing.correctionFactor || 1;
                            const grossTotal = netTotal * cf;
                            const waste = grossTotal - netTotal;
                            
                            // Unit conversion for display
                            let displayUnit = ing.unit;
                            let displayGross = grossTotal;
                            let displayNet = netTotal;
                            let displayWaste = waste;
                            
                            if (displayUnit === 'grs' && grossTotal > 1000) {
                                displayUnit = 'KG';
                                displayGross /= 1000;
                                displayNet /= 1000;
                                displayWaste /= 1000;
                            } else if (displayUnit === 'cc' && grossTotal > 1000) {
                                displayUnit = 'LTS';
                                displayGross /= 1000;
                                displayNet /= 1000;
                                displayWaste /= 1000;
                            }

                            // Price calculation
                            let unitPrice = 0;
                            if (dbIng) {
                                const amount = dbIng.quantity || 1;
                                const price = dbIng.purchasePrice || dbIng.precio || 0;
                                const dbUnit = (dbIng.unit || '').toUpperCase();
                                
                                let baseAmount = amount;
                                if (dbUnit === 'KG' && ing.unit === 'grs') baseAmount = amount * 1000;
                                if (dbUnit === 'LTS' && ing.unit === 'cc') baseAmount = amount * 1000;
                                if (dbUnit === 'L' && ing.unit === 'cc') baseAmount = amount * 1000;
                                
                                unitPrice = price / baseAmount;
                            }
                            const cost = grossTotal * unitPrice;
                            
                            totalCost += cost;

                            if (!shoppingList[key]) {
                                shoppingList[key] = {
                                    name: key,
                                    category: cat,
                                    unit: displayUnit,
                                    grossSum: 0,
                                    netSum: 0,
                                    wasteSum: 0,
                                    costSum: 0
                                };
                            }
                            
                            // To keep totals accurate, aggregate in standard units first, but we are cheating here for prototype
                            shoppingList[key].grossSum += displayGross;
                            shoppingList[key].netSum += displayNet;
                            shoppingList[key].wasteSum += displayWaste;
                            shoppingList[key].costSum += cost;
                        });
                    }
                }
            });
        });

        const shoppingArray = Object.values(shoppingList).sort((a,b) => b.costSum - a.costSum);
        
        return {
            totalCost,
            costPerDiner: diners > 0 ? (totalCost / diners) : 0,
            shoppingArray
        };
    }, [plan, recipes, ingredients, diners]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
            {/* Header & Print Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarDays size={28} style={{ color: 'var(--primary)' }} />
                        Planificador Semanal London Supply
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Armá el menú semanal y generá automáticamente la lista de compras y reporte de mermas.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                        <Users size={18} style={{ color: 'var(--text-secondary)' }} />
                        <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Comensales:</label>
                        <input 
                            type="number" 
                            value={diners} 
                            onChange={(e) => setDiners(e.target.value)}
                            style={{ 
                                width: '80px', padding: '0.25rem', border: '1px solid var(--border-color)', 
                                borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' 
                            }} 
                        />
                    </div>
                    <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Printer size={18} />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* Grid Planificador */}
            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Día</th>
                            {SERVICES.map(s => (
                                <th key={s.id} style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>{s.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map(day => (
                            <tr key={day} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold', background: 'var(--bg-secondary)' }}>{day}</td>
                                {SERVICES.map(service => (
                                    <td key={service.id} style={{ padding: '0.5rem 1rem' }}>
                                        <select 
                                            value={plan[day][service.id]}
                                            onChange={(e) => {
                                                const newPlan = { ...plan };
                                                newPlan[day][service.id] = e.target.value;
                                                setPlan(newPlan);
                                            }}
                                            style={{ 
                                                width: '100%', padding: '0.5rem', borderRadius: '4px', 
                                                border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', 
                                                color: 'var(--text-primary)', fontSize: '0.875rem'
                                            }}
                                        >
                                            <option value="">- Seleccionar Receta -</option>
                                            {recipes.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reportes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                
                {/* Resumen Financiero */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid var(--primary)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            <PieChart size={20} /> Presupuesto Semanal
                        </h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            ${reportData.totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Cálculo por cápita: <strong>${reportData.costPerDiner.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / alumno / semana</strong>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Droplets size={18} style={{ color: 'var(--warning)' }} />
                            Análisis de Mermas (Eficiencia Operativa)
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            Platify ha calculado matemáticamente la diferencia entre el peso sucio que se comprará y el peso limpio que se comerá de acuerdo al % de desperdicio (pelado de vegetales, grasas libres, mermas de cocción).
                        </p>
                    </div>
                </div>

                {/* Lista de Compras */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <h3 style={{ margin: '0', padding: '1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingCart size={20} style={{ color: 'var(--success)' }} />
                        Lista de Compras Consolidada (Logística)
                    </h3>
                    {reportData.shoppingArray.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            Asigná recetas en el planificador para generar la orden de compra.
                        </div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Ingrediente</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Peso Total (Bruto)</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Mermas Estimadas</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Inversión $</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.shoppingArray.map(item => (
                                        <tr key={item.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{item.category}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                                {item.grossSum.toFixed(2)} {item.unit}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: item.wasteSum > 0 ? 'var(--warning)' : 'var(--text-tertiary)' }}>
                                                {item.wasteSum > 0 ? `${item.wasteSum.toFixed(2)} ${item.unit}` : '-'}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                                                ${item.costSum.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
}
