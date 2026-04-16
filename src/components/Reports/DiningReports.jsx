import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currencyConverter';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BookOpen, CalendarDays, Flame, Leaf, TrendingUp, Users } from 'lucide-react';

const COLORS = ['#2C5F6F', '#3d7d91', '#D4A93A', '#10b981', '#f59e0b', '#ef4444'];

const CALORIC_TARGETS = {
  lunch: { preschool: 375, primary_lower: 487, primary_upper: 562, secondary_lower: 687, secondary_upper: 787 }
};

function KpiCard({ icon: Icon, label, value, sub, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border-color)',
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
        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
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

export default function DiningReports() {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const { recipes = [], ingredients = [] } = useData();

  const stats = useMemo(() => {
    const active = recipes.filter(r => r.ingredients?.length > 0);
    const totalKcal = active.reduce((s, r) => s + (r.caloriesPerPortion || 0), 0);
    const avgKcal = active.length ? Math.round(totalKcal / active.length) : 0;
    const avgCost = active.length
      ? active.reduce((s, r) => s + (r.costPerPortion || 0), 0) / active.length
      : 0;

    return { total: recipes.length, active: active.length, avgKcal, avgCost };
  }, [recipes]);

  // Calories per recipe vs target
  const caloriesData = useMemo(() => {
    return recipes
      .filter(r => r.ingredients?.length > 0)
      .map(r => ({
        name: r.name?.length > 14 ? r.name.slice(0, 14) + '…' : (r.name || 'Receta'),
        kcal: Math.round(r.caloriesPerPortion || 0),
        meta: CALORIC_TARGETS.lunch.primary_upper
      }));
  }, [recipes]);

  // Macros radar: average across recipes
  const macroData = useMemo(() => {
    const active = recipes.filter(r => r.ingredients?.length > 0);
    if (!active.length) return [
      { nutrient: 'Proteínas', value: 0 },
      { nutrient: 'Carbohidratos', value: 0 },
      { nutrient: 'Grasas', value: 0 },
    ];
    const avgP = active.reduce((s, r) => s + (r.proteinPerPortion || 0), 0) / active.length;
    const avgC = active.reduce((s, r) => s + (r.carbsPerPortion || 0), 0) / active.length;
    const avgF = active.reduce((s, r) => s + (r.fatPerPortion || 0), 0) / active.length;
    return [
      { nutrient: 'Proteínas', value: Math.round(avgP) },
      { nutrient: 'Carbohidratos', value: Math.round(avgC) },
      { nutrient: 'Grasas', value: Math.round(avgF) },
    ];
  }, [recipes]);

  // Pie: recipes by diet/tag category — fallback on ingredient categories
  const categoryData = useMemo(() => {
    const cats = {};
    recipes.forEach(r => {
      const cat = r.category || r.dietType || 'General';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [recipes]);

  const hasPie = categoryData.length > 0;
  const hasCalories = caloriesData.length > 0;

  return (
    <div style={{ padding: '0.25rem 0', animation: 'fadeIn 0.3s ease' }}>
      {/* Section header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          📊 Informes — Comedor
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          KPIs y análisis nutricional de tu planificación de menú
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard icon={BookOpen} label="Total de Recetas" value={stats.total} sub="en el sistema" color="var(--primary)" />
        <KpiCard icon={TrendingUp} label="Recetas con Ingredientes" value={stats.active} sub="listas para servir" color="#10b981" />
        <KpiCard icon={Flame} label="Kcal Promedio/Porción" value={stats.avgKcal} sub="promedio de la carta" color="#f59e0b" />
        <KpiCard icon={Users} label="Costo Prom./Porción" value={formatCurrency(stats.avgCost, currency)} sub="costeo promedio" color="#3d7d91" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>

        {/* Calories bar chart */}
        <ChartCard title="🔥 Calorías por Porción vs. Meta Escolar (Primaria Mayor)" height={280}>
          {hasCalories ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesData} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Bar dataKey="kcal" name="Kcal receta" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="meta" name="Meta kcal" fill="var(--accent)" radius={[6, 6, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Agregá recetas con ingredientes para ver el análisis calórico" />}
        </ChartCard>

        {/* Macros radar */}
        <ChartCard title="🧬 Perfil de Macronutrientes (promedio, g/porción)" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={macroData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="nutrient" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Radar name="Macros" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category pie */}
        <ChartCard title="🥗 Distribución de Recetas por Categoría" height={280}>
          {hasPie ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="45%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="No hay datos de categorías disponibles" />}
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
