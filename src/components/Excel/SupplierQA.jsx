import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertCircle, Thermometer, Box, Truck, FileText, Scale } from 'lucide-react';

export default function SupplierQA() {
    const { t } = useTranslation();
    const [receptions, setReceptions] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({
        provider: '',
        date: new Date().toISOString().split('T')[0],
        category: 'lacteos', // lacteos, carnes, secos, frutas
        expectedWeight: '',
        actualWeight: '',
        temperature: '',
        packagingPrimary: true,
        packagingSecondary: true,
        visualQuality: 5,
        verdict: 'aprobado',
        observations: ''
    });

    const calculateVariance = (expected, actual) => {
        if (!expected || !actual) return 0;
        return ((actual - expected) / expected) * 100;
    };

    const handleSave = (e) => {
        e.preventDefault();
        const newReception = {
            ...formData,
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            variance: calculateVariance(Number(formData.expectedWeight), Number(formData.actualWeight))
        };
        setReceptions([newReception, ...receptions]);
        
        // Reset specific fields but keep provider and date
        setFormData(prev => ({
            ...prev,
            expectedWeight: '',
            actualWeight: '',
            temperature: '',
            packagingPrimary: true,
            packagingSecondary: true,
            visualQuality: 5,
            verdict: 'aprobado',
            observations: ''
        }));
    };

    const renderPrintableReport = () => {
        window.print();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0' }}>
                        <Truck size={28} style={{ color: 'var(--primary)' }} />
                        Auditoría de Recepción (BPM / HACCP)
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        Control de calidad cruzado para proveedores de comedores London Supply
                    </p>
                </div>
                <button 
                    onClick={renderPrintableReport}
                    className="btn btn-secondary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FileText size={18} />
                    Exportar Reporte PDF
                </button>
            </div>

            {/* Main Form */}
            <div className="card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Proveedor</label>
                            <input 
                                type="text" 
                                required
                                value={formData.provider}
                                onChange={e => setFormData({...formData, provider: e.target.value})}
                                placeholder="Ej: Lácteos Misiones S.A."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Categoría de Producto</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            >
                                <option value="lacteos">Lácteos y Quesos</option>
                                <option value="carnes">Carnes y Proteínas</option>
                                <option value="frutas">Frutas y Verduras</option>
                                <option value="secos">Almacén (Secos)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Fecha de Recepción</label>
                            <input 
                                type="date" 
                                required
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} 
                            />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

                    <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Métricas de Calidad</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Control de Pesos */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                <Scale size={20} />
                                <strong style={{color: 'var(--text-primary)'}}>Control de Peso</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Remito (KG)</label>
                                    <input 
                                        type="number" step="0.01" required
                                        value={formData.expectedWeight}
                                        onChange={e => setFormData({...formData, expectedWeight: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)'}} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Báscula Real (KG)</label>
                                    <input 
                                        type="number" step="0.01" required
                                        value={formData.actualWeight}
                                        onChange={e => setFormData({...formData, actualWeight: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)'}} 
                                    />
                                </div>
                            </div>
                            {formData.expectedWeight && formData.actualWeight && (
                                <div style={{ 
                                    marginTop: '0.5rem', 
                                    fontSize: '0.8rem', 
                                    color: Math.abs(calculateVariance(formData.expectedWeight, formData.actualWeight)) > 2 ? 'var(--danger)' : 'var(--success)' 
                                }}>
                                    Desvío: {calculateVariance(formData.expectedWeight, formData.actualWeight).toFixed(2)}%
                                </div>
                            )}
                        </div>

                        {/* Control de Temperatura */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--info)' }}>
                                <Thermometer size={20} />
                                <strong style={{color: 'var(--text-primary)'}}>Cadena de Frío</strong>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Temperatura Recepción (°C)</label>
                                <input 
                                    type="number" step="0.1"
                                    value={formData.temperature}
                                    onChange={e => setFormData({...formData, temperature: e.target.value})}
                                    placeholder="Ej: 4.5"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)'}} 
                                />
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Norma: Lácteos &lt; 5°C | Carnes frescas &lt; 3°C
                            </div>
                        </div>

                        {/* Control de Empaques */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--warning)' }}>
                                <Box size={20} />
                                <strong style={{color: 'var(--text-primary)'}}>Indemnidad de Empaque</strong>
                            </div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                                <input 
                                    type="checkbox" 
                                    checked={formData.packagingPrimary}
                                    onChange={e => setFormData({...formData, packagingPrimary: e.target.checked})}
                                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: '0.9rem' }}>Empaque Primario Intacto</span>
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={formData.packagingSecondary}
                                    onChange={e => setFormData({...formData, packagingSecondary: e.target.checked})}
                                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: '0.9rem' }}>Empaque Secundario (Cajas) Intacto</span>
                            </label>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Dictamen Final (Scoring)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {[
                                    { id: 'aprobado', label: 'Aprobado Lote Completo', color: 'var(--success)', icon: CheckCircle },
                                    { id: 'observado', label: 'Aprobado con Observaciones', color: 'var(--warning)', icon: AlertCircle },
                                    { id: 'rechazado', label: 'Rechazado (Devolución)', color: 'var(--danger)', icon: XCircle }
                                ].map(v => (
                                    <label key={v.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                                        background: formData.verdict === v.id ? `${v.color}15` : 'var(--bg-secondary)',
                                        border: `1px solid ${formData.verdict === v.id ? v.color : 'var(--border-color)'}`,
                                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                                    }}>
                                        <input 
                                            type="radio" name="verdict" value={v.id}
                                            checked={formData.verdict === v.id}
                                            onChange={e => setFormData({...formData, verdict: e.target.value})}
                                            style={{ display: 'none' }}
                                        />
                                        <v.icon size={20} style={{ color: v.color }} />
                                        <span style={{ fontWeight: formData.verdict === v.id ? '600' : '400', color: formData.verdict === v.id ? v.color : 'var(--text-primary)' }}>
                                            {v.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Observaciones (Motivos de rechazo, detalles visuales)</label>
                            <textarea 
                                value={formData.observations}
                                onChange={e => setFormData({...formData, observations: e.target.value})}
                                rows="4"
                                placeholder="Indicar si hubo merma, cajas golpeadas, pérdida de frío o deudas del proveedor..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', resize: 'vertical' }}
                            ></textarea>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                                    <CheckCircle size={18} />
                                    Guardar Auditoría
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Print Section / History */}
            {receptions.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        Historial de Recepciones (Log de Auditoría)
                    </h3>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Fecha/ID</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Proveedor</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Cat. / Temp.</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Pesos (Desvío)</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Dictamen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receptions.map(rec => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ fontWeight: '600' }}>{rec.date}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{rec.id}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{rec.provider}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ textTransform: 'capitalize' }}>{rec.category}</div>
                                            {rec.temperature && <div style={{ fontSize: '0.8rem', color: 'var(--info)' }}>{rec.temperature}°C</div>}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            Espe: {rec.expectedWeight}kg | Real: {rec.actualWeight}kg
                                            {rec.variance !== 0 && (
                                                <div style={{ fontSize: '0.75rem', color: Math.abs(rec.variance) > 2 ? 'var(--danger)' : 'var(--warning)' }}>
                                                    ({rec.variance > 0 ? '+' : ''}{rec.variance.toFixed(1)}%)
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                background: rec.verdict === 'aprobado' ? 'var(--success)' : rec.verdict === 'rechazado' ? 'var(--danger)' : 'var(--warning)',
                                                color: '#fff'
                                            }}>
                                                {rec.verdict.toUpperCase()}
                                            </span>
                                            {rec.observations && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {rec.observations}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
