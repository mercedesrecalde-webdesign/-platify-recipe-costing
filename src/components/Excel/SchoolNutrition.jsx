import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currencyConverter';
import { calculateRecipeMacros } from '../../data/dietaryData';
import {
    ageGroups,
    serviceTypes,
    modelRecipes,
    calculateCaloricTarget,
    evaluateAdequacy,
    evaluateMacros
} from '../../data/schoolNutritionData';
import { GraduationCap, AlertTriangle, TrendingUp, Utensils, Info } from 'lucide-react';
import excelData from '../../data/excel_full_data.json';

export default function SchoolNutrition() {
    const { t } = useTranslation();
    const { recipes, ingredients, nutritionalInfo } = useData();
    const { currency } = useSettings();

    const [selectedAgeGroup, setSelectedAgeGroup] = useState('primary_lower');
    const [selectedService, setSelectedService] = useState('lunch');
    const [selectedRecipeId, setSelectedRecipeId] = useState('');

    // Get all available recipes (custom + excel)
    const allRecipes = useMemo(() => {
        const customRecipes = recipes.map(r => ({
            id: r.id,
            name: r.name || r.nombre,
            portions: r.portions || r.porciones || 4,
            caloriasPorPorcion: r.caloriasPorPorcion || r.totalCalorias / (r.portions || 4) || 0,
            costoPorPorcion: r.costoPorPorcion || 0,
            ingredients: r.ingredients || [],
            source: 'custom'
        }));

        // Parse Excel recipes
        const excelRecipes = [];
        for (let i = 1; i <= 5; i++) {
            const sheetName = `RECETA ${i}`;
            const sheet = excelData[sheetName] || excelData[`${sheetName} `];
            if (!sheet || !sheet.data) continue;

            const nombre = sheet.data[1]?.[1] || `RECETA ${i}`;
            let porciones = 4;
            let totalCalorias = 0;
            let totalCosto = 0;

            const match = nombre.match(/(\d+)\s*porciones/i);
            if (match) porciones = parseInt(match[1]);

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
                    if (!totalCosto) totalCosto += (row[6] || 0);
                    if (!totalCalorias) totalCalorias += (row[8] || 0);
                }
            }

            excelRecipes.push({
                id: `excel-${i}`,
                name: nombre,
                portions: porciones,
                caloriasPorPorcion: totalCalorias / porciones,
                costoPorPorcion: totalCosto / porciones,
                ingredients: [],
                source: 'excel'
            });
        }

        return [...excelRecipes, ...customRecipes];
    }, [recipes]);

    // Calculate target
    const target = useMemo(() =>
        calculateCaloricTarget(selectedAgeGroup, selectedService),
        [selectedAgeGroup, selectedService]
    );

    // Get selected recipe and evaluate
    const evaluation = useMemo(() => {
        if (!selectedRecipeId || !target) return null;

        const recipe = allRecipes.find(r => r.id === selectedRecipeId);
        if (!recipe) return null;

        const recipeCalories = recipe.caloriasPorPorcion || 0;
        const adequacy = evaluateAdequacy(recipeCalories, target.targetCalories);

        // Calculate macros if the recipe has ingredients
        let macros = null;
        let macroEval = null;
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            macros = calculateRecipeMacros(recipe.ingredients);
            const macrosPerPortion = {
                protein: macros.protein / recipe.portions,
                carbs: macros.carbs / recipe.portions,
                fat: macros.fat / recipe.portions
            };
            macroEval = evaluateMacros(macrosPerPortion, target.macroTargets);
        }

        return {
            recipe,
            recipeCalories,
            adequacy,
            macros,
            macroEval,
            costoPorPorcion: recipe.costoPorPorcion
        };
    }, [selectedRecipeId, target, allRecipes]);

    const statusColors = {
        adequate: '#10B981',
        adjustable: '#F59E0B',
        inadequate: '#EF4444'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2C5F6F 50%, #3d8b6e 100%)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    right: '80px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    pointerEvents: 'none'
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <GraduationCap size={32} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                            {t('school.title')}
                        </h2>
                        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                            {t('school.subtitle')} — Misiones, Argentina
                        </p>
                    </div>
                </div>
            </div>

            {/* Selectors Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {/* Age Group Selector */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '1rem',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)'
                    }}>
                        🎯 {t('school.ageGroup')}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {ageGroups.map(ag => (
                            <button
                                key={ag.id}
                                onClick={() => setSelectedAgeGroup(ag.id)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${selectedAgeGroup === ag.id ? ag.color : 'var(--border-color)'}`,
                                    background: selectedAgeGroup === ag.id ? `${ag.color}15` : 'var(--bg-tertiary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>{ag.icon}</span>
                                    <span style={{
                                        fontWeight: selectedAgeGroup === ag.id ? '600' : '400',
                                        fontSize: '0.85rem'
                                    }}>
                                        {t(ag.label)}
                                    </span>
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: ag.color,
                                    fontWeight: '700',
                                    background: `${ag.color}20`,
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px'
                                }}>
                                    {ag.dailyVCT} kcal
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Service Type + Recipe Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Service Type */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        border: '1px solid var(--border-color)'
                    }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '1rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)'
                        }}>
                            🕐 {t('school.serviceType')}
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {serviceTypes.map(st => (
                                <button
                                    key={st.id}
                                    onClick={() => setSelectedService(st.id)}
                                    style={{
                                        flex: 1,
                                        padding: '1rem 0.5rem',
                                        borderRadius: '10px',
                                        border: `2px solid ${selectedService === st.id ? st.color : 'var(--border-color)'}`,
                                        background: selectedService === st.id ? `${st.color}15` : 'var(--bg-tertiary)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{st.icon}</div>
                                    <div style={{
                                        fontWeight: selectedService === st.id ? '600' : '400',
                                        fontSize: '0.8rem'
                                    }}>
                                        {t(st.label)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: st.color,
                                        fontWeight: '600',
                                        marginTop: '0.25rem'
                                    }}>
                                        {st.coveragePercent}% VCT
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Summary Card */}
                    {target && (
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-tertiary) 100%)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <TrendingUp size={18} color="var(--primary)" />
                                <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                    {t('school.caloricTarget')}
                                </span>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('school.dailyVCT')}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {target.dailyVCT} <span style={{ fontSize: '0.75rem', fontWeight: '400' }}>kcal</span>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                        {t('school.coverage')} ({target.coveragePercent}%)
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                        {target.targetCalories} <span style={{ fontSize: '0.75rem', fontWeight: '400' }}>kcal</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recipe Selector */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        border: '1px solid var(--border-color)'
                    }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.75rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)'
                        }}>
                            <Utensils size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            {t('school.selectRecipe')}
                        </label>
                        {allRecipes.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                                {t('school.noRecipes')}
                            </p>
                        ) : (
                            <select
                                className="input"
                                value={selectedRecipeId}
                                onChange={(e) => setSelectedRecipeId(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">{t('school.selectRecipe')}...</option>
                                {allRecipes.map(recipe => (
                                    <option key={recipe.id} value={recipe.id}>
                                        {recipe.name} — {(recipe.caloriasPorPorcion || 0).toFixed(0)} kcal/{t('school.perPortion')}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* Evaluation Results */}
            {evaluation && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {/* Caloric Adequacy Card */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: `2px solid ${evaluation.adequacy.color}`,
                        boxShadow: `0 4px 20px ${evaluation.adequacy.color}20`
                    }}>
                        <h3 style={{
                            margin: '0 0 1.5rem 0',
                            fontSize: '1rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {evaluation.adequacy.emoji} {t('school.adequacy')}
                        </h3>

                        {/* Circular Progress */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                position: 'relative',
                                width: '160px',
                                height: '160px',
                                margin: '0 auto'
                            }}>
                                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="var(--border-color)"
                                        strokeWidth="2.5"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={evaluation.adequacy.color}
                                        strokeWidth="2.5"
                                        strokeDasharray={`${Math.min(evaluation.adequacy.percentage, 150)}, 100`}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                                    />
                                </svg>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: '800',
                                        color: evaluation.adequacy.color,
                                        lineHeight: 1
                                    }}>
                                        {evaluation.adequacy.percentage}%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                                        {t(`school.${evaluation.adequacy.status}`)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calorie Comparison */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '0.75rem',
                                background: evaluation.adequacy.bgColor,
                                borderRadius: '8px'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                    {t('school.recipeCalories')}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: evaluation.adequacy.color }}>
                                    {evaluation.recipeCalories.toFixed(0)}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>kcal</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', color: 'var(--text-tertiary)' }}>vs</div>
                            <div style={{
                                textAlign: 'center',
                                padding: '0.75rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                    {t('school.targetCalories')}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                    {target.targetCalories}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>kcal</div>
                            </div>
                        </div>

                        {/* Cost info */}
                        {evaluation.costoPorPorcion > 0 && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                    {t('recipes.costPerPortion')}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                                    {formatCurrency(evaluation.costoPorPorcion, currency)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visual Bar Comparison */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h3 style={{
                            margin: '0 0 1.5rem 0',
                            fontSize: '1rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            📊 {t('school.summary')}
                        </h3>

                        {/* Visual calorie bar */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                color: 'var(--text-tertiary)',
                                marginBottom: '0.5rem'
                            }}>
                                <span>{t('school.caloricContribution')}</span>
                                <span>{evaluation.recipeCalories.toFixed(0)} / {target.targetCalories} kcal</span>
                            </div>
                            <div style={{
                                height: '24px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(evaluation.adequacy.percentage, 100)}%`,
                                    background: `linear-gradient(90deg, ${evaluation.adequacy.color}, ${evaluation.adequacy.color}cc)`,
                                    borderRadius: '12px',
                                    transition: 'width 0.5s ease-out',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {evaluation.adequacy.percentage > 15 && (
                                        <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: '700' }}>
                                            {evaluation.adequacy.percentage}%
                                        </span>
                                    )}
                                </div>
                                {/* Target marker line */}
                                <div style={{
                                    position: 'absolute',
                                    left: '100%',
                                    top: 0,
                                    bottom: 0,
                                    width: '2px',
                                    background: 'var(--primary)',
                                    transform: `translateX(-${Math.max(0, 100 - Math.min(evaluation.adequacy.percentage, 100))}%)`
                                }} />
                            </div>
                        </div>

                        {/* Macronutrient bars */}
                        {evaluation.macroEval ? (
                            <div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '1rem'
                                }}>
                                    {t('school.macros')}
                                </div>
                                {['protein', 'carbs', 'fat'].map(macro => {
                                    const data = evaluation.macroEval[macro];
                                    const macroColor = statusColors[data.status];
                                    const pct = data.max > 0 ? Math.min((data.value / data.max) * 100, 150) : 0;

                                    return (
                                        <div key={macro} style={{ marginBottom: '1rem' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '0.75rem',
                                                marginBottom: '0.35rem'
                                            }}>
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                                                    {t(`school.${macro}Label`)}
                                                </span>
                                                <span style={{ color: macroColor, fontWeight: '600' }}>
                                                    {data.value.toFixed(1)}g
                                                    <span style={{ color: 'var(--text-tertiary)', fontWeight: '400' }}>
                                                        {' '}/ {data.min}-{data.max}g
                                                    </span>
                                                </span>
                                            </div>
                                            <div style={{
                                                height: '10px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '5px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.min(pct, 100)}%`,
                                                    background: `linear-gradient(90deg, ${macroColor}, ${macroColor}bb)`,
                                                    borderRadius: '5px',
                                                    transition: 'width 0.5s ease-out'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                padding: '1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                color: 'var(--text-tertiary)',
                                textAlign: 'center'
                            }}>
                                <Info size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                {t('school.macros')} — {t('recipesList.customBadge')}
                            </div>
                        )}

                        {/* Age group reference table */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                📋 {t('school.dailyVCT')}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {ageGroups.map(ag => (
                                    <div
                                        key={ag.id}
                                        style={{
                                            padding: '0.35rem 0.6rem',
                                            borderRadius: '6px',
                                            background: selectedAgeGroup === ag.id ? `${ag.color}20` : 'var(--bg-secondary)',
                                            border: `1px solid ${selectedAgeGroup === ag.id ? ag.color : 'var(--border-color)'}`,
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <span>{ag.icon}</span>
                                        <span style={{ color: 'var(--text-tertiary)' }}>{ag.ageRange}a:</span>
                                        <span style={{ fontWeight: '600', color: ag.color }}>{ag.dailyVCT}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Model Recipe Card */}
            {target && (() => {
                const modelGroup = modelRecipes[selectedAgeGroup];
                const modelRecipe = modelGroup ? modelGroup[selectedService] : null;
                if (!modelRecipe) return null;

                const modelName = t(modelRecipe.nameKey);
                const modelDesc = t(modelRecipe.descKey);

                return (
                    <div style={{
                        marginTop: '1.5rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.08)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <h3 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1rem',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            🍽️ {t('school.modelRecipeTitle')}
                        </h3>
                        <p style={{
                            margin: '0 0 1.25rem 0',
                            fontSize: '0.8rem',
                            color: 'var(--text-tertiary)'
                        }}>
                            {t('school.modelRecipeDesc')}
                        </p>

                        {/* Model Recipe Info */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            marginBottom: '1.25rem'
                        }}>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                                {modelName}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                                {modelDesc}
                            </div>

                            {/* Macro bars for model */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                <div style={{
                                    textAlign: 'center',
                                    padding: '0.75rem 0.5rem',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                                        {modelRecipe.calories}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>kcal</div>
                                </div>
                                <div style={{
                                    textAlign: 'center',
                                    padding: '0.75rem 0.5rem',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#EF4444' }}>
                                        {modelRecipe.protein}g
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('school.proteinLabel')}</div>
                                </div>
                                <div style={{
                                    textAlign: 'center',
                                    padding: '0.75rem 0.5rem',
                                    background: 'rgba(245, 158, 11, 0.08)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F59E0B' }}>
                                        {modelRecipe.carbs}g
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('school.carbsLabel')}</div>
                                </div>
                                <div style={{
                                    textAlign: 'center',
                                    padding: '0.75rem 0.5rem',
                                    background: 'rgba(16, 185, 129, 0.08)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>
                                        {modelRecipe.fat}g
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('school.fatLabel')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Comparison with user's recipe if selected */}
                        {evaluation && (
                            <div style={{
                                background: 'var(--bg-tertiary)',
                                borderRadius: '10px',
                                padding: '1rem'
                            }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    📊 {t('school.vsYourRecipe')}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '0.75rem',
                                        background: 'rgba(99, 102, 241, 0.08)',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                            {t('school.modelLabel')}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                                            {modelRecipe.calories}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>kcal</div>
                                    </div>
                                    <div style={{
                                        fontSize: '1.25rem',
                                        color: 'var(--text-tertiary)',
                                        fontWeight: '300'
                                    }}>vs</div>
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '0.75rem',
                                        background: evaluation.adequacy.bgColor,
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                            {t('school.yourLabel')}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: evaluation.adequacy.color }}>
                                            {evaluation.recipeCalories.toFixed(0)}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>kcal</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Disclaimer */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
            }}>
                <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5
                }}>
                    {t('school.disclaimer')}
                </p>
            </div>
        </div>
    );
}
