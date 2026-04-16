import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currencyConverter';
import excelData from '../../data/excel_full_data.json';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine, ComposedChart, Line
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Package, ShieldCheck, Percent } from 'lucide-react';

const COLORS = ['#2C5F6F', '#3d7d91', '#D4A93A', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function KpiCard({ icon: Icon, label, value, sub, color = 'var(--primary)', alert = false }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      border: `1px solid ${alert ? 'var(--error)' : 'var(--border-color)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      minHeight: '130px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: '800', color: alert ? 'var(--error)' : 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

function ChartCard({ title, children, height = 280 }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border-color)'
    }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>{title}</h3>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

export default function TechReports() {
  const { currency } = useSettings();
  const { recipes = [], ingredients = [] } = useData();
  const [targetMargin] = useState(55);

  // Parse excel recipes for profitability data
  const profitData = useMemo(() => {
    const rows = [];
    const salePrices = JSON.parse(localStorage.getItem('salePrices') || '{}');
    for (let i = 1; i <= 5; i++) {
      const sheet = excelData[`RECETA ${i}`] || excelData[`RECETA ${i} `];
      if (!sheet?.data) continue;
      const nombre = sheet.data[1]?.[1] || `Receta ${i}`;
      let totalCosto = 0, porciones = 4;
      const nombreMatch = nombre.match(/(\d+)\s*porciones/i);
      if (nombreMatch) porciones = parseInt(nombreMatch[1]);
      for (let j = 3; j < sheet.data.length; j++) {
        const row = sheet.data[j];
        if (!row) continue;
        const ing = row[1];
        if (!ing || ing === 'TOTALES' || ing === 'PESO TOTAL') {
          if (ing === 'TOTALES' || ing === 'PESO TOTAL') totalCosto = row[6] || totalCosto;
          break;
        }
        if (ing && !totalCosto) totalCosto += (row[6] || 0);
      }
      if (totalCosto === 0) continue;
      const costoPorcion = totalCosto / porciones;
      const suggested = costoPorcion / (1 - targetMargin / 100);
      const precioVenta = salePrices[`receta_${i}`] || suggested;
      const margen = precioVenta > 0 ? ((precioVenta - costoPorcion) / precioVenta) * 100 : 0;
      rows.push({
        name: nombre.length > 14 ? nombre.slice(0, 14) + '…' : nombre,
        costo: Math.round(costoPorcion),
        venta: Math.round(precioVenta),
        margen: Math.round(margen),
        ok: margen >= targetMargin
      });
    }
    return rows;
  }, [targetMargin]);

  // Ingredients by category
  const catData = useMemo(() => {
    const cats = {};
    ingredients.forEach(ing => {
      const cat = ing.category || 'Otros';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [ingredients]);

  const avgMargen = profitData.length ? Math.round(profitData.reduce((s, r) => s + r.margen, 0) / profitData.length) : 0;
  const alertas = profitData.filter(r => !r.ok).length;
  const avgCosto = profitData.length ? Math.round(profitData.reduce((s, r) => s + r.costo, 0) / profitData.length) : 0;

  return (
    <div style={{ padding: '0.25rem 0', animation: 'fadeIn 0.3s ease' }}>
      {/* Section header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          📊 Informes — Técnica
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Rentabilidad, costos y gestión de proveedores e inventario
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard icon={Percent} label="Margen Promedio" value={`${avgMargen}%`} sub={`objetivo ${targetMargin}%`} color={avgMargen >= targetMargin ? '#10b981' : '#ef4444'} />
        <KpiCard icon={DollarSign} label="Costo Prom./Porción" value={formatCurrency(avgCosto, currency)} sub="fichas técnicas Excel" color="var(--primary)" />
        <KpiCard icon={AlertTriangle} label="Recetas en Alerta" value={alertas} sub="margen por debajo del objetivo" color="#ef4444" alert={alertas > 0} />
        <KpiCard icon={Package} label="Total Ingredientes" value={ingredients.length} sub="en el inventario" color="#3d7d91" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>

        {/* Margin bar chart */}
        <ChartCard title={`📈 Margen de Ganancia % por Receta (objetivo: ${targetMargin}%)`} height={280}>
          {profitData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={profitData} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <ReferenceLine y={targetMargin} stroke="var(--accent)" strokeDasharray="6 3" label={{ value: `${targetMargin}%`, fill: 'var(--accent)', fontSize: 11 }} />
                <Bar dataKey="margen" name="Margen %" radius={[6, 6, 0, 0]}>
                  {profitData.map((entry, i) => (
                    <Cell key={i} fill={entry.ok ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="No hay datos de fichas técnicas disponibles" />}
        </ChartCard>

        {/* Cost vs Price */}
        <ChartCard title="💰 Costo vs. Precio de Venta por Receta" height={280}>
          {profitData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                <Bar dataKey="costo" name="Costo/porción" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="venta" name="Precio venta" fill="var(--accent)" radius={[6, 6, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="No hay datos de fichas técnicas disponibles" />}
        </ChartCard>

        {/* Ingredients by category */}
        <ChartCard title="🧺 Inventario por Categoría de Ingrediente" height={280}>
          {catData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="45%" outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="No hay ingredientes en el inventario" />}
        </ChartCard>

      </div>
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
      <div>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
        {text}
      </div>
    </div>
  );
}
