import React, { useState } from 'react';
import { X, Sparkles, ChefHat, Coffee, UtensilsCrossed, Cookie, Moon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useNotifications } from '../UI/Notifications';
import { generateRecipeFromTemplate } from '../../data/recipeTemplates';
import { calculateRecipeMacros } from '../../data/dietaryData';

const dietOptions = [
    { id: 'keto', name: 'Keto', icon: '🥑', description: 'Bajo en carbohidratos' },
    { id: 'diabetic', name: 'Diabético', icon: '🍬', description: 'Control de azúcar' },
    { id: 'gluten-free', name: 'Sin Gluten', icon: '🌾', description: 'Celíaco friendly' },
    { id: 'lactose-free', name: 'Sin Lactosa', icon: '🥛', description: 'Sin lácteos' },
    { id: 'egg-free', name: 'Sin Huevos', icon: '🥚', description: 'Sin huevo' },
    { id: 'nut-free', name: 'Sin Frutos Secos', icon: '🥜', description: 'Sin nueces' },
    { id: 'vegetarian', name: 'Vegetariano', icon: '🌱', description: 'Sin carne' },
    { id: 'vegan', name: 'Vegano', icon: '🌿', description: 'Sin productos animales' }
];

const mealTimes = [
    { id: 'breakfast', name: 'Desayuno', icon: Coffee, color: '#F59E0B' },
    { id: 'lunch', name: 'Almuerzo', icon: UtensilsCrossed, color: '#10B981' },
    { id: 'snack', name: 'Merienda', icon: Cookie, color: '#8B5CF6' },
    { id: 'dinner', name: 'Cena', icon: Moon, color: '#3B82F6' }
];

export default function DietaryAssistant({ isOpen, onClose, onGenerateRecipe, ingredients }) {
    const { correctionFactors, nutritionalInfo } = useData();
    const { success, error: showError } = useNotifications();

    const [selectedDiet, setSelectedDiet] = useState('keto');
    const [selectedMeal, setSelectedMeal] = useState('lunch');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);

        // Simulate AI thinking
        setTimeout(() => {
            const result = generateRecipeFromTemplate(selectedDiet, selectedMeal, ingredients);

            if (result.error) {
                showError(result.error + ". Ingredientes faltantes: " + result.missing.join(', '));
                setIsGenerating(false);
                return;
            }

            // Calculate costs and nutrition
            const recipeMacros = calculateRecipeMacros(result.ingredients);
            const totalCost = result.ingredients.reduce((sum, ing) => {
                const cost = (ing.quantity / 1000) * ing.unitPrice;
                return sum + cost;
            }, 0);

            const costPerPortion = totalCost / result.portions;

            // Suggested sale price (100% markup as default)
            const suggestedPrice = costPerPortion * 2;

            // Build complete recipe data
            const recipeData = {
                name: result.name,
                portions: result.portions,
                ingredients: result.ingredients.map(ing => ({
                    id: `recipe_ing_${Date.now()}_${Math.random()}`,
                    ingredientId: ing.ingredientId,
                    name: ing.name,
                    neto: ing.quantity,
                    unit: ing.unit,
                    fc: 1, // Default correction factor
                    bruto: ing.quantity,
                    costoTotal: (ing.quantity / 1000) * ing.unitPrice,
                    costoPorcion: ((ing.quantity / 1000) * ing.unitPrice) / result.portions,
                    calories: (ing.quantity / 100) * (recipeMacros.calories / result.ingredients.reduce((sum, i) => sum + i.quantity, 0) * 100),
                    caloriasPorcion: 0
                })),
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
            success(`¡Receta "${result.name}" generada! Costo: $${costPerPortion.toFixed(2)}/porción, Precio sugerido: $${suggestedPrice.toFixed(2)}`);

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
                                Asistente Inteligente
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                Genera recetas automáticamente
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
                        🎯 Tipo de Dieta
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
                        🕐 Momento del Día
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
                    {isGenerating ? 'Generando receta mágica...' : '✨ Generar Receta Inteligente'}
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
                    💡 El asistente seleccionará ingredientes de tu inventario y calculará costos + nutrición automáticamente
                </div>
            </div>
        </div>
    );
}
