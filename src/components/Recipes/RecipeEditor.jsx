import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Plus, Trash2, Calculator } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currencyConverter';

export default function RecipeEditor({
    recipe = null,
    isOpen,
    onClose,
    onSave
}) {
    const { t } = useTranslation();
    const { ingredients, correctionFactors, nutritionalInfo } = useData();
    const { currency } = useSettings();

    const [formData, setFormData] = useState({
        name: '',
        portions: 4,
        ingredients: []
    });

    const [errors, setErrors] = useState({});
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [netQuantity, setNetQuantity] = useState('');

    // Sync formData with recipe prop
    useEffect(() => {
        if (recipe) {
            // Normalize ingredients from both AI and manual recipes
            const normalizedIngredients = (recipe.ingredients || []).map(ing => ({
                id: ing.id || `recipe_ing_${Date.now()}_${Math.random()}`,
                ingredientId: ing.ingredientId,
                name: ing.name || ing.nombre,
                neto: ing.neto || ing.quantity || 0,
                unit: ing.unit,
                fc: ing.fc || 1,
                bruto: ing.bruto || ((ing.neto || ing.quantity || 0) * (ing.fc || 1)),
                costoTotal: ing.costoTotal || 0,
                costoPorcion: ing.costoPorcion || 0,
                calories: ing.calories || 0,
                caloriasPorcion: ing.caloriasPorcion || 0
            }));

            setFormData({
                name: recipe.name || recipe.nombre || '',
                portions: recipe.portions || recipe.porciones || 4,
                ingredients: normalizedIngredients
            });
        } else {
            setFormData({
                name: '',
                portions: 4,
                ingredients: []
            });
        }
    }, [recipe, isOpen]);

    // Get correction factor for an ingredient
    const getCorrectionFactor = (ingredientName) => {
        const factor = correctionFactors.find(cf =>
            cf.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
            ingredientName.toLowerCase().includes(cf.name.toLowerCase())
        );
        return factor?.correctionFactor || 1;
    };

    // Get nutritional info for an ingredient
    const getNutritionalData = (ingredientName) => {
        const info = nutritionalInfo.find(ni =>
            ni.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
            ingredientName.toLowerCase().includes(ni.name.toLowerCase())
        );
        return info || { calories: 0 };
    };

    // Add ingredient to recipe
    const handleAddIngredient = () => {
        if (!selectedIngredient || !netQuantity || parseFloat(netQuantity) <= 0) {
            setErrors({ ingredient: t('recipeEditor.selectAndQuantity') });
            return;
        }

        const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
        if (!ingredient) return;

        const neto = parseFloat(netQuantity);
        const fc = getCorrectionFactor(ingredient.name);
        const bruto = neto * fc;
        // FIXED: Calculate cost based on BRUTO weight (what you actually buy)
        const costoTotal = (bruto / 1000) * ingredient.unitPrice;
        const nutritional = getNutritionalData(ingredient.name);
        const calories = (neto / 100) * (nutritional.calories || 0);

        const newIngredient = {
            id: `recipe_ing_${Date.now()}`,
            ingredientId: ingredient.id,
            name: ingredient.name,
            neto,
            unit: ingredient.unit,
            fc,
            bruto,
            costoTotal,
            costoPorcion: 0, // Will be calculated
            calories,
            caloriasPorcion: 0 // Will be calculated
        };

        const updatedIngredients = [...formData.ingredients, newIngredient];
        const updatedFormData = {
            ...formData,
            ingredients: updatedIngredients
        };

        // Recalculate per-portion values
        recalculatePortions(updatedFormData);

        setSelectedIngredient('');
        setNetQuantity('');
        setErrors({});
    };

    // Remove ingredient from recipe
    const handleRemoveIngredient = (id) => {
        const updatedFormData = {
            ...formData,
            ingredients: formData.ingredients.filter(ing => ing.id !== id)
        };
        recalculatePortions(updatedFormData);
    };

    // Recalculate per-portion values
    const recalculatePortions = (data) => {
        const portions = data.portions || 1;
        const updatedIngredients = data.ingredients.map(ing => ({
            ...ing,
            costoPorcion: ing.costoTotal / portions,
            caloriasPorcion: ing.calories / portions
        }));

        setFormData({
            ...data,
            ingredients: updatedIngredients
        });
    };

    // Update portions and recalculate
    const handlePortionsChange = (newPortions) => {
        const portions = parseInt(newPortions) || 1;
        const updatedFormData = {
            ...formData,
            portions
        };
        recalculatePortions(updatedFormData);
    };

    // Calculate totals
    const totals = useMemo(() => {
        const totalCosto = formData.ingredients.reduce((sum, ing) => sum + ing.costoTotal, 0);
        const totalCalorias = formData.ingredients.reduce((sum, ing) => sum + ing.calories, 0);
        const costoPorPorcion = totalCosto / (formData.portions || 1);
        const caloriasPorPorcion = totalCalorias / (formData.portions || 1);

        return {
            totalCosto,
            totalCalorias,
            costoPorPorcion,
            caloriasPorPorcion
        };
    }, [formData]);

    const validate = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = t('recipeEditor.nameRequired');
        }

        if (!formData.portions || formData.portions <= 0) {
            newErrors.portions = t('recipeEditor.portionsRequired');
        }

        if (formData.ingredients.length === 0) {
            newErrors.ingredients = t('recipeEditor.ingredientsRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const recipeData = {
            ...formData,
            id: recipe?.id || `recipe_${Date.now()}`,
            totalCosto: totals.totalCosto,
            totalCalorias: totals.totalCalorias,
            costoPorPorcion: totals.costoPorPorcion,
            caloriasPorPorcion: totals.caloriasPorPorcion,
            createdAt: recipe?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onSave(recipeData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out',
            padding: '1rem'
        }} onClick={onClose}>
            <div
                style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    maxWidth: '1200px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'scaleIn 0.2s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary)' }}>
                        {recipe ? t('recipeEditor.editRecipe') : t('recipeEditor.newRecipe')}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            display: 'flex',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {t('recipeEditor.recipeName')} *
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%' }}
                            />
                            {errors.name && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {t('recipeEditor.portions')} *
                            </label>
                            <input
                                type="number"
                                className="input"
                                value={formData.portions}
                                onChange={(e) => handlePortionsChange(e.target.value)}
                                min="1"
                                style={{ width: '100%' }}
                            />
                            {errors.portions && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.portions}</span>}
                        </div>
                    </div>

                    {/* Add Ingredient Section */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                            {t('recipeEditor.addIngredient')}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {t('recipeEditor.ingredient')}
                                </label>
                                <select
                                    className="input"
                                    value={selectedIngredient}
                                    onChange={(e) => setSelectedIngredient(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">{t('recipeEditor.selectIngredient')}</option>
                                    {ingredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name} ({formatCurrency(ing.unitPrice, currency)}/{ing.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {t('recipeEditor.netQuantity')}
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={netQuantity}
                                    onChange={(e) => setNetQuantity(e.target.value)}
                                    step="0.01"
                                    min="0"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddIngredient}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={16} />
                                {t('recipeEditor.addIngredient')}
                            </button>
                        </div>
                        {errors.ingredient && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>{errors.ingredient}</span>}
                    </div>

                    {/* Ingredients Table */}
                    {formData.ingredients.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                {t('recipeEditor.recipeIngredients')}
                            </h3>
                            <div style={{ overflow: 'auto', maxHeight: '300px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <table className="table" style={{ marginBottom: 0, fontSize: '0.875rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--primary)', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ color: 'white' }}>{t('recipeEditor.ingredientCol')}</th>
                                            <th style={{ color: 'white', textAlign: 'right' }}>{t('recipeEditor.netCol')}</th>
                                            <th style={{ color: 'white', textAlign: 'center' }}>{t('recipeEditor.fcCol')}</th>
                                            <th style={{ color: 'white', textAlign: 'right' }}>{t('recipeEditor.grossCol')}</th>
                                            <th style={{ color: 'white', textAlign: 'right' }}>{t('recipeEditor.costCol')}</th>
                                            <th style={{ color: 'white', textAlign: 'right' }}>{t('recipeEditor.caloriesCol')}</th>
                                            <th style={{ color: 'white', textAlign: 'center', width: '60px' }}>{t('recipeEditor.actionCol')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.ingredients.map((ing, index) => (
                                            <tr key={ing.id} style={{ background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)' }}>
                                                <td>{ing.name}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{ing.neto.toFixed(1)}g</td>
                                                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--warning)' }}>{ing.fc.toFixed(2)}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{ing.bruto.toFixed(1)}g</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>
                                                    {formatCurrency(ing.costoTotal, currency)}
                                                </td>
                                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{ing.calories.toFixed(0)}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveIngredient(ing.id)}
                                                        style={{
                                                            background: 'var(--error)',
                                                            border: 'none',
                                                            color: 'white',
                                                            padding: '0.375rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            margin: '0 auto'
                                                        }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {errors.ingredients && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>{errors.ingredients}</span>}
                        </div>
                    )}

                    {/* Totals Summary */}
                    <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-tertiary) 100%)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Calculator size={20} color="var(--primary)" />
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>{t('recipeEditor.costNutritionSummary')}</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{t('recipeEditor.totalCost')}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                                    {formatCurrency(totals.totalCosto, currency)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{t('recipeEditor.costPerPortion')}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                    {formatCurrency(totals.costoPorPorcion, currency)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{t('recipeEditor.totalCalories')}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {totals.totalCalorias.toFixed(0)} kcal
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{t('recipeEditor.caloriesPerPortion')}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {totals.caloriasPorPorcion.toFixed(0)} kcal
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            {t('recipeEditor.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Save size={16} />
                            {recipe ? t('recipeEditor.updateRecipe') : t('recipeEditor.saveRecipe')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
