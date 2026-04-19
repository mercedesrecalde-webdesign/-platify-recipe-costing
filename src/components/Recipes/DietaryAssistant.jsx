import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, ChefHat, Coffee, UtensilsCrossed, Cookie, Moon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useNotifications } from '../UI/Notifications';
import { generateRecipeFromTemplate } from '../../data/recipeTemplates';
import { calculateRecipeMacros } from '../../data/dietaryData';

export default function DietaryAssistant({ isOpen, onClose, onGenerateRecipe, ingredients }) {
    const { t } = useTranslation();
    const { correctionFactors, nutritionalInfo, getCorrectionFactor } = useData();
    const { success, error: showError } = useNotifications();

    const [selectedDiet, setSelectedDiet] = useState('keto');
    const [selectedMeal, setSelectedMeal] = useState('lunch');
    const [isGenerating, setIsGenerating] = useState(false);

    const dietOptions = [
        { id: 'keto', name: t('dietAssistant.keto'), icon: '🥑', description: t('dietAssistant.ketoDesc') },
        { id: 'diabetic', name: t('dietAssistant.diabetic'), icon: '🍬', description: t('dietAssistant.diabeticDesc') },
        { id: 'gluten-free', name: t('dietAssistant.glutenFree'), icon: '🌾', description: t('dietAssistant.glutenFreeDesc') },
        { id: 'lactose-free', name: t('dietAssistant.lactoseFree'), icon: '🥛', description: t('dietAssistant.lactoseFreeDesc') },
        { id: 'egg-free', name: t('dietAssistant.eggFree'), icon: '🥚', description: t('dietAssistant.eggFreeDesc') },
        { id: 'nut-free', name: t('dietAssistant.nutFree'), icon: '🥜', description: t('dietAssistant.nutFreeDesc') },
        { id: 'vegetarian', name: t('dietAssistant.vegetarian'), icon: '🌱', description: t('dietAssistant.vegetarianDesc') },
        { id: 'vegan', name: t('dietAssistant.vegan'), icon: '🌿', description: t('dietAssistant.veganDesc') }
    ];

    const mealTimes = [
        { id: 'breakfast', name: t('dietAssistant.breakfast'), icon: Coffee, color: '#F59E0B' },
        { id: 'lunch', name: t('dietAssistant.lunch'), icon: UtensilsCrossed, color: '#10B981' },
        { id: 'snack', name: t('dietAssistant.snack'), icon: Cookie, color: '#8B5CF6' },
        { id: 'dinner', name: t('dietAssistant.dinner'), icon: Moon, color: '#3B82F6' }
    ];

    const handleGenerate = () => {
        setIsGenerating(true);

        // Simulate AI thinking
        setTimeout(() => {
            const result = generateRecipeFromTemplate(selectedDiet, selectedMeal, ingredients);

            if (result.error) {
                showError(result.error + ". " + result.missing.join(', '));
                setIsGenerating(false);
                return;
            }

            // Calculate costs and nutrition
            const recipeMacros = calculateRecipeMacros(result.ingredients);
            const totalCost = result.ingredients.reduce((sum, ing) => {
                const fc = getCorrectionFactor(ing.name) || 1;
                const bruto = ing.quantity * fc;
                const purchaseQty = ing.purchaseQuantity || 1;
                const cost = (bruto / purchaseQty) * (ing.purchasePrice || 0);
                return sum + cost;
            }, 0);

            const costPerPortion = totalCost / result.portions;

            // Suggested sale price (100% markup as default)
            const suggestedPrice = costPerPortion * 2;

            // Build complete recipe data
            const recipeData = {
                name: result.name,
                portions: result.portions,
                procedure: result.procedure,
                haccpNotes: result.haccpNotes,
                ingredients: result.ingredients.map(ing => {
                    const fc = getCorrectionFactor(ing.name) || 1;
                    const neto = ing.quantity;
                    const bruto = neto * fc;
                    const purchaseQty = ing.purchaseQuantity || 1;
                    const costoTotal = (bruto / purchaseQty) * (ing.purchasePrice || 0);
                    
                    const itemCalories = (neto / 100) * (recipeMacros.calories / result.ingredients.reduce((sum, i) => sum + i.quantity, 0) * 100);

                    return {
                        id: `recipe_ing_${Date.now()}_${Math.random()}`,
                        ingredientId: ing.ingredientId,
                        name: ing.name,
                        neto: neto,
                        unit: ing.unit,
                        fc: fc,
                        bruto: bruto,
                        costoTotal: costoTotal,
                        costoPorcion: costoTotal / result.portions,
                        calories: itemCalories,
                        caloriasPorcion: itemCalories / result.portions
                    };
                }),
                dietType: selectedDiet,
                mealTime: selectedMeal,
                generatedByAI: true,
                // Add recipe-level totals for display in list view
                totalCosto: totalCost,
                costoPorPorcion: costPerPortion,
                totalCalorias: recipeMacros.calories,
                caloriasPorPorcion: recipeMacros.calories / result.portions
            };

            // Show success message
            success(`✨ "${result.name}" — $${costPerPortion.toFixed(2)}/porción`);

            onGenerateRecipe(recipeData);
            setIsGenerating(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                animation: 'scaleIn 0.3s ease-out'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex'
                        }}>
                            <Sparkles size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>
                                {t('dietAssistant.title')}
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                {t('dietAssistant.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        color: 'var(--text-secondary)',
                        transition: 'background 0.2s'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Diet Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '1rem',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)'
                    }}>
                        🎯 {t('dietAssistant.dietType')}
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {dietOptions.map(diet => (
                            <div
                                key={diet.id}
                                onClick={() => setSelectedDiet(diet.id)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: `2px solid ${selectedDiet === diet.id ? 'var(--primary)' : 'var(--border-color)'}`,
                                    background: selectedDiet === diet.id ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{diet.icon}</div>
                                <div style={{
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.25rem'
                                }}>
                                    {diet.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    {diet.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meal Time Selection */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '1rem',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)'
                    }}>
                        🕐 {t('dietAssistant.mealTime')}
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.75rem'
                    }}>
                        {mealTimes.map(meal => {
                            const Icon = meal.icon;
                            return (
                                <div
                                    key={meal.id}
                                    onClick={() => setSelectedMeal(meal.id)}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: '12px',
                                        border: `2px solid ${selectedMeal === meal.id ? meal.color : 'var(--border-color)'}`,
                                        background: selectedMeal === meal.id ? `${meal.color}15` : 'var(--bg-tertiary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <Icon size={24} color={selectedMeal === meal.id ? meal.color : 'var(--text-tertiary)'} />
                                    <span style={{
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        color: selectedMeal === meal.id ? meal.color : 'var(--text-primary)'
                                    }}>
                                        {meal.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{
                        width: '100%',
                        padding: '1.25rem',
                        background: isGenerating
                            ? 'var(--bg-tertiary)'
                            : 'linear-gradient(135deg, var(--primary), var(--accent))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        boxShadow: isGenerating ? 'none' : '0 8px 20px rgba(212, 169, 58, 0.4)',
                        transition: 'all 0.3s',
                        animation: isGenerating ? 'pulse 1.5s infinite' : 'none'
                    }}
                >
                    <ChefHat size={24} />
                    {isGenerating ? t('dietAssistant.generating') : `✨ ${t('dietAssistant.generate')}`}
                </button>

                {/* Info */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    textAlign: 'center'
                }}>
                    💡 {t('dietAssistant.info')}
                </div>
            </div>
        </div>
    );
}
