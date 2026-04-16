import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// === COMEDOR (Dining) ===
import RecipesList from '../Recipes/RecipesList';
import WeeklyPlanner from '../Excel/WeeklyPlanner';
import SchoolNutrition from '../Excel/SchoolNutrition';
import DiningReports from '../Reports/DiningReports';

// === TÉCNICA (Technical) ===
import PreciosMayoristas from '../Excel/PreciosMayoristas';
import FactorCorreccion from '../Excel/FactorCorreccion';
import TablaQuimica from '../Excel/TablaQuimica';
import SupplierQA from '../Excel/SupplierQA';
import Monitor from '../Excel/Monitor';
import TechReports from '../Reports/TechReports';

import {
  BookOpen, CalendarDays, GraduationCap, BarChart3,
  FileSpreadsheet, Scale, Apple, ShieldCheck, TrendingUp,
  Utensils, Settings2, PieChart
} from 'lucide-react';

const SECTIONS = {
  comedor: {
    id: 'comedor',
    label: 'COMEDOR',
    desc: 'Recetas, Menús & Planificación',
    emoji: '🍽️',
    color: '#2C5F6F',
    gradient: 'linear-gradient(135deg, #2C5F6F 0%, #3d7d91 100%)',
    tabs: [
      { id: 'recetas',  label: 'Mis Recetas',          icon: BookOpen,      component: RecipesList },
      { id: 'planner',  label: 'Planificador Semanal',  icon: CalendarDays,  component: WeeklyPlanner },
      { id: 'comedor',  label: 'Menú Escolar',          icon: GraduationCap, component: SchoolNutrition },
      { id: 'reportes', label: 'Informes & KPIs',       icon: PieChart,      component: DiningReports },
    ],
  },
  tecnica: {
    id: 'tecnica',
    label: 'TÉCNICA',
    desc: 'Fichas, Costos & Proveedores',
    emoji: '⚙️',
    color: '#D4A93A',
    gradient: 'linear-gradient(135deg, #b8912f 0%, #D4A93A 100%)',
    tabs: [
      { id: 'precios',   label: 'Lista de Precios',     icon: FileSpreadsheet, component: PreciosMayoristas },
      { id: 'factor',    label: 'Factor Corrección',    icon: Scale,           component: FactorCorreccion },
      { id: 'quimica',   label: 'Tabla Calórica',       icon: Apple,           component: TablaQuimica },
      { id: 'qa',        label: 'Auditoría QA',         icon: ShieldCheck,     component: SupplierQA },
      { id: 'monitor',   label: 'Monitor Rentabilidad', icon: TrendingUp,      component: Monitor },
      { id: 'reportes',  label: 'Informes & KPIs',      icon: PieChart,        component: TechReports },
    ],
  },
};

function SectionPill({ section, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '1.25rem 1.5rem',
        background: isActive ? section.gradient : 'var(--bg-secondary)',
        border: isActive ? 'none' : '1px solid var(--border-color)',
        borderRadius: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.18)' : 'var(--shadow-sm)',
        transform: isActive ? 'translateY(-2px)' : 'none',
        textAlign: 'left',
        minWidth: 0,
      }}
    >
      <div style={{
        fontSize: '2rem',
        lineHeight: 1,
        filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
        flexShrink: 0,
      }}>
        {section.emoji}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '1rem',
          fontWeight: '800',
          color: isActive ? 'white' : 'var(--text-primary)',
          letterSpacing: '0.08em',
          lineHeight: 1.2,
        }}>
          {section.label}
        </div>
        <div style={{
          fontSize: '0.78rem',
          color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
          marginTop: '0.2rem',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {section.desc}
        </div>
      </div>
      {isActive && (
        <div style={{
          marginLeft: 'auto',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          flexShrink: 0,
          boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
        }} />
      )}
    </button>
  );
}

function SubTab({ tab, isActive, accentColor, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.6rem 1rem',
        background: isActive ? 'var(--bg-secondary)' : 'transparent',
        border: 'none',
        borderBottom: isActive ? `3px solid ${accentColor}` : '3px solid transparent',
        color: isActive ? accentColor : 'var(--text-secondary)',
        fontWeight: isActive ? '700' : '500',
        fontSize: '0.8rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        transition: 'all 0.18s ease',
        borderRadius: '8px 8px 0 0',
        fontFamily: 'var(--font-family)',
        letterSpacing: isActive ? '0.01em' : '0',
      }}
    >
      <Icon size={14} />
      {tab.label}
    </button>
  );
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('comedor');
  const [activeTabIds, setActiveTabIds] = useState({ comedor: 'recetas', tecnica: 'precios' });

  const section = SECTIONS[activeSection];
  const activeTabId = activeTabIds[activeSection];
  const activeTab = section.tabs.find(t => t.id === activeTabId) || section.tabs[0];
  const ActiveComponent = activeTab?.component;

  const setTab = (id) => setActiveTabIds(prev => ({ ...prev, [activeSection]: id }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)', gap: 0 }}>

      {/* ── Section Selector ── */}
      <div style={{
        padding: '1.5rem 1.5rem 0',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          maxWidth: '720px',
          margin: '0 auto',
        }}>
          {Object.values(SECTIONS).map(s => (
            <SectionPill
              key={s.id}
              section={s}
              isActive={activeSection === s.id}
              onClick={() => setActiveSection(s.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Sub-tab bar ── */}
      <div style={{
        background: 'var(--bg-tertiary)',
        borderBottom: '2px solid var(--border-color)',
        padding: '0 1.5rem',
        overflowX: 'auto',
        display: 'flex',
        gap: '0.15rem',
        marginTop: '1.25rem',
        scrollbarWidth: 'none',
      }}>
        {section.tabs.map(tab => (
          <SubTab
            key={tab.id}
            tab={tab}
            isActive={activeTabId === tab.id}
            accentColor={section.color}
            onClick={() => setTab(tab.id)}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{
        flex: 1,
        background: 'var(--bg-primary)',
        padding: '2rem 1.5rem',
        overflowY: 'auto',
        animation: 'fadeIn 0.22s ease',
      }}>
        {ActiveComponent && <ActiveComponent />}
      </div>

    </div>
  );
}
