import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertCircle, Thermometer, Box, Truck, FileText, Scale, Plus, Trash2, PieChart as ChartIcon, ClipboardList, ShieldCheck, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const supplierMetrics = [
    { subject: 'Calidad Visual', A: 95, B: 88, fullMark: 100 },
    { subject: 'Ajuste Remito', A: 90, B: 95, fullMark: 100 },
    { subject: 'Velocidad', A: 85, B: 80, fullMark: 100 },
    { subject: 'Inocuidad', A: 98, B: 90, fullMark: 100 },
    { subject: 'Indemnidad', A: 90, B: 98, fullMark: 100 },
    { subject: 'Transporte', A: 88, B: 85, fullMark: 100 },
    { subject: 'Certificaciones', A: 100, B: 100, fullMark: 100 },
];

const rejectionData = [
    { name: 'Ene', tasa: 4.2 },
    { name: 'Feb', tasa: 3.8 },
    { name: 'Mar', tasa: 2.1 },
    { name: 'Abr', tasa: 1.5 },
];

const topSuppliers = [
    { name: 'Lácteos Misiones', score: 94 },
    { name: 'EcoGranjas Sur', score: 91 },
    { name: 'Distribuidora Ruiz', score: 88 },
    { name: 'Frigorífico Amanecer', score: 82 },
];

export default function SupplierQA() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'dashboard'
    const [receptions, setReceptions] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({
        provider: '',
        date: new Date().toISOString().split('T')[0],
        category: 'lacteos',
        items: [{ id: Date.now(), name: '', expected: '', actual: '' }],
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

    const handleItemChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), name: '', expected: '', actual: '' }]
        }));
    };

    const removeItem = (id) => {
        if (formData.items.length === 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const totalExpected = formData.items.reduce((sum, item) => sum + Number(item.expected || 0), 0);
        const totalActual = formData.items.reduce((sum, item) => sum + Number(item.actual || 0), 0);
        
        const newReception = {
            ...formData,
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            totalExpected,
            totalActual,
            variance: calculateVariance(totalExpected, totalActual)
        };
        setReceptions([newReception, ...receptions]);
        
        setFormData({
            ...formData,
            items: [{ id: Date.now(), name: '', expected: '', actual: '' }],
            temperature: '',
            packagingPrimary: true,
            packagingSecondary: true,
            visualQuality: 5,
            verdict: 'aprobado',
            observations: ''
        });
    };

    const renderPrintableReport = () => window.print();

    const totalExpected = formData.items.reduce((sum, item) => sum + Number(item.expected || 0), 0);
    const totalActual = formData.items.reduce((sum, item) => sum + Number(item.actual || 0), 0);
    const currentVariance = calculateVariance(totalExpected, totalActual);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', animation: 'fadeIn 0.3s ease' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0' }}>
                        <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
                        Gestión y Evaluación de Proveedores
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        Auditorías HACCP y Análisis Gerencial de Trazabilidad
                    </p>
                </div>
                {activeTab === 'dashboard' && (
                    <button 
                        onClick={renderPrintableReport}
                        className="btn btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FileText size={18} />
                        Exportar Informe Ejecutivo
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('audit')}
                    style={{
                        padding: '0.5rem 1rem', background: 'transparent', border: 'none',
                        color: activeTab === 'audit' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'audit' ? 'bold' : 'normal',
                        borderBottom: activeTab === 'audit' ? '3px solid var(--primary)' : '3px solid transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transform: 'translateY(11px)'
                    }}
                >
                    <ClipboardList size={18} /> Cargar Nueva Auditoría
                </button>
                <button
                    onClick={() => setActiveTab('dashboard')}
                    style={{
                        padding: '0.5rem 1rem', background: 'transparent', border: 'none',
                        color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
                        borderBottom: activeTab === 'dashboard' ? '3px solid var(--primary)' : '3px solid transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transform: 'translateY(11px)'
                    }}
                >
                    <ChartIcon size={18} /> Análisis Gerencial
                </button>
            </div>

            {/* Content Switcher */}
            {activeTab === 'audit' ? (
                <>
                    <div className="card" style={{ padding: '2rem' }}>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Proveedor (Escribí o Seleccioná)</label>
                                    <input 
                                        list="proveedores-list" type="text" required
                                        value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})}
                                        placeholder="Escribí un nombre o seleccioná..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} 
                                    />
                                    <datalist id="proveedores-list">
                                        <option value="Lácteos Misiones S.A." />
                                        <option value="EcoGranjas del Sur" />
                                        <option value="Frigorífico El Amanecer" />
                                        <option value="Distribuidora Mayorista Ruiz" />
                                    </datalist>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Categoría Principal</label>
                                    <select 
                                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
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
                                        type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} 
                                    />
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
                            
                            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Detalle del Remito (Cotejo de Pesos)</h3>
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '1rem', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                    <div>Producto detallado</div><div>Peso Remito (KG)</div><div>Peso Báscula (KG)</div><div></div>
                                </div>
                                {formData.items.map(item => (
                                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <input type="text" required placeholder="Ej: Pollo entero" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)'}} />
                                        <input type="number" step="0.01" required value={item.expected} onChange={e => handleItemChange(item.id, 'expected', e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)'}} />
                                        <input type="number" step="0.01" required value={item.actual} onChange={e => handleItemChange(item.id, 'actual', e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)'}} />
                                        <button type="button" onClick={() => removeItem(item.id)} disabled={formData.items.length === 1} style={{ background: 'transparent', border: 'none', color: formData.items.length === 1 ? 'var(--text-tertiary)' : 'var(--danger)', cursor: formData.items.length === 1 ? 'default' : 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                        <Plus size={16} /> Añadir Ítem
                                    </button>
                                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
                                        <div>Total Remito: <strong>{totalExpected.toFixed(2)} KG</strong></div>
                                        <div>Total Báscula: <strong>{totalActual.toFixed(2)} KG</strong></div>
                                        <div style={{ color: Math.abs(currentVariance) > 2 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>Desvío Total: {currentVariance.toFixed(2)}%</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--info)' }}>
                                        <Thermometer size={20} /><strong style={{color: 'var(--text-primary)'}}>Cadena de Frío</strong>
                                    </div>
                                    <input type="number" step="0.1" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} placeholder="Ej: 4.5" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)'}} />
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Norma: Lácteos &lt; 5°C | Carnes frescas &lt; 3°C</div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--warning)' }}>
                                        <Box size={20} /><strong style={{color: 'var(--text-primary)'}}>Indemnidad de Empaque</strong>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}><input type="checkbox" checked={formData.packagingPrimary} onChange={e => setFormData({...formData, packagingPrimary: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}/><span>Empaque Primario Intacto</span></label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="checkbox" checked={formData.packagingSecondary} onChange={e => setFormData({...formData, packagingSecondary: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}/><span>Empaque Cajas Intacto</span></label>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Dictamen Final</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {[
                                            { id: 'aprobado', label: 'Aprobado Lote', color: 'var(--success)', icon: CheckCircle },
                                            { id: 'observado', label: 'Con Observaciones', color: 'var(--warning)', icon: AlertCircle },
                                            { id: 'rechazado', label: 'Rechazado (Devolución)', color: 'var(--danger)', icon: XCircle }
                                        ].map(v => (
                                            <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: formData.verdict === v.id ? `${v.color}15` : 'var(--bg-secondary)', border: `1px solid ${formData.verdict === v.id ? v.color : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                                                <input type="radio" name="verdict" value={v.id} checked={formData.verdict === v.id} onChange={e => setFormData({...formData, verdict: e.target.value})} style={{ display: 'none' }}/>
                                                <v.icon size={20} style={{ color: v.color }} />
                                                <span style={{ fontWeight: formData.verdict === v.id ? '600' : '400', color: formData.verdict === v.id ? v.color : 'var(--text-primary)' }}>{v.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Observaciones</label>
                                    <textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} rows="4" placeholder="Indicar motivos de rechazo..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}><CheckCircle size={18} /> Guardar Auditoría</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {receptions.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Historial Reciente</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Fecha / Proveedor</th>
                                        <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Desvío Pesos</th>
                                        <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>Dictamen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receptions.map(rec => (
                                        <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.75rem' }}><strong>{rec.date}</strong><br/>{rec.provider}</td>
                                            <td style={{ padding: '0.75rem' }}>Total: {rec.totalActual.toFixed(2)}kg <span style={{color: Math.abs(rec.variance) > 2 ? 'var(--danger)' : 'var(--success)'}}>({rec.variance > 0 ? '+' : ''}{rec.variance.toFixed(2)}%)</span></td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: rec.verdict === 'aprobado' ? 'var(--success)' : rec.verdict === 'rechazado' ? 'var(--danger)' : 'var(--warning)', color: '#fff' }}>{rec.verdict.toUpperCase()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {/* KPI CARDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                <Activity size={20} /> Nivel de Servicio (SLA)
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>93.4%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Promedio General Histórico</div>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                <AlertCircle size={20} /> Tasa de Rechazos
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>1.5%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>↓ 0.6% vs mes anterior</div>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                <Truck size={20} /> Proveedores Evaluados
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>14</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Con auditorías activas</div>
                        </div>
                    </div>

                    {/* Gráficas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        {/* Radar Chart */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Evaluación Global por Métricas Críticas</h3>
                            <div style={{ height: '350px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={supplierMetrics}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                        <Radar name="Lácteos Misiones" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                                        <Radar name="EcoGranjas" dataKey="B" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.5} />
                                        <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '0.8rem' }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Proveedores & Tasa de rechazos */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: '100%' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Top Proveedores (Scoring)</h3>
                                <div style={{ height: '160px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topSuppliers} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={120} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} formatter={(val) => `${val}/100`} />
                                            <Bar dataKey="score" fill="var(--primary)" barSize={20} radius={[0, 5, 5, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: '100%' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Tasa de Rechazos Histórica (%)</h3>
                                <div style={{ height: '140px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={rejectionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                            <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} formatter={(val) => `${val}%`} />
                                            <Bar dataKey="tasa" fill="var(--accent)" barSize={30} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
