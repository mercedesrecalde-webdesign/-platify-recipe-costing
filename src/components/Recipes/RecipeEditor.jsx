import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Plus, Trash2, Calculator } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currencyConverter';
import { supabase } from '../../utils/supabaseClient';
import { Image, ClipboardList, ShieldCheck, Upload, Trash } from 'lucide-react';

export default function RecipeEditor({
    recipe = null,
    isOpen,
    onClose,
    onSave
}) {
    const { t } = useTranslation();
    const { ingredients, getCorrectionFactor, getNutritionalInfo, addIngredient } = useData();
    const { currency } = useSettings();

    const [formData, setFormData] = useState({
        name: '',
        portions: 4,
        ingredients: [],
        procedure: '',
        haccpNotes: '',
        photoUrl: ''
    });

    const [isUploading, setIsUploading] = useState(false);

    const [errors, setErrors] = useState({});
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [netQuantity, setNetQuantity] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [quickAddIngredient, setQuickAddIngredient] = useState({ name: '', purchasePrice: '', quantity: 1000, unit: 'g', category: 'Otros' });

    // Sync formData with recipe prop
    useEffect(() => {
        if (recipe) {
            // Normalize ingredients from both AI and manual recipes
            const normalizedIngredients = (recipe.ingredients || []).map(ing => {
                const ingredientId = ing.ingredient_id || ing.ingredientId;
                
                // Lookup LATEST data from wholesale list
                const wholesaleIng = ingredients.find(i => i.id === ingredientId);
                
                // Use latest data or fallback to saved data
                const name = wholesaleIng?.name || ing.ingredient?.name || ing.name || ing.nombre;
                const fc = getCorrectionFactor(name); // Always use latest FC logic
                const neto = ing.net_quantity || ing.neto || ing.quantity || 0;
                const bruto = neto * fc;
                
                // Use latest price for accurate costing
                const purchasePrice = wholesaleIng?.purchasePrice || wholesaleIng?.purchase_price || 0;
                const purchaseQty = wholesaleIng?.quantity || 1;
                const cost = (bruto / purchaseQty) * purchasePrice;
                
                const calories = ing.calories || ing.calorias || 0;

                return {
                    id: ing.id || `recipe_ing_${Date.now()}_${Math.random()}`,
                    ingredientId: ingredientId,
                    name: name,
                    neto: neto,
                    unit: wholesaleIng?.unit || ing.unit,
                    fc: fc,
                    bruto: bruto,
                    costoTotal: cost,
                    costoPorcion: (cost / (recipe.portions || recipe.porciones || 1)),
                    calories: calories,
                    caloriasPorcion: (calories / (recipe.portions || recipe.porciones || 1))
                };
            });

            setFormData({
                name: recipe.name || recipe.nombre || '',
                portions: recipe.portions || recipe.porciones || 4,
                ingredients: normalizedIngredients,
                procedure: recipe.procedure || '',
                haccpNotes: recipe.haccp_notes || recipe.haccpNotes || '',
                photoUrl: recipe.photo_url || recipe.photoUrl || ''
            });
        } else {
            setFormData({
                name: '',
                portions: 4,
                ingredients: []
            });
        }
    }, [recipe, isOpen, ingredients, getCorrectionFactor]);


    // Get nutritional info for an ingredient
    const getNutritionalData = (ingredientName) => {
        const info = nutritionalInfo.find(ni =>
            ni.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
            ingredientName.toLowerCase().includes(ni.name.toLowerCase())
        );
        return info || { calories: 0 };
    };

    // Add ingredient to recipe
    const handleAddIngredient = async () => {
        if (isAddingNew) {
            // Parse and validate numeric inputs
            const pPrice = parseFloat(quickAddIngredient.purchasePrice);
            const pQty = parseFloat(quickAddIngredient.quantity);
            const rQty = parseFloat(netQuantity);

            if (isNaN(pPrice) || isNaN(pQty) || isNaN(rQty)) {
                console.warn('Numeric validation failed', { pPrice, pQty, rQty });
                alert('Por favor enter números válidos para el precio y las cantidades.');
                return;
            }

            console.log('Attempting to add new ingredient to DB...', { ...quickAddIngredient, purchasePrice: pPrice, quantity: pQty });
            
            let createdIng;
            try {
                createdIng = await addIngredient({
                    name: quickAddIngredient.name,
                    purchasePrice: pPrice,
                    quantity: pQty,
                    unit: quickAddIngredient.unit,
                    category: quickAddIngredient.category
                });
            } catch (err) {
                console.error('Error in addIngredient call:', err);
                return;
            }

            console.log('Response from addIngredient:', createdIng);

            if (createdIng) {
                try {
                    const fc = getCorrectionFactor(createdIng.name) || 1;
                    const bruto = rQty * fc;
                    const costoTotal = (bruto / (createdIng.quantity || 1)) * createdIng.purchasePrice;
                    
                    const newRecipeIng = {
                        id: `recipe_ing_${Date.now()}_${Math.random()}`,
                        ingredientId: createdIng.id,
                        name: createdIng.name,
                        neto: rQty,
                        unit: createdIng.unit,
                        fc: fc,
                        bruto: bruto,
                        costoTotal: costoTotal,
                        costoPorcion: (costoTotal / (formData.portions || 1)),
                        calories: 0,
                        caloriasPorcion: 0
                    };

                    setFormData(prev => ({
                        ...prev,
                        ingredients: [...prev.ingredients, newRecipeIng]
                    }));
                    
                    setIsAddingNew(false);
                    setQuickAddIngredient({
                        name: '',
                        purchasePrice: '',
                        quantity: 1000,
                        unit: 'g',
                        category: 'Carnes'
                    });
                    setNetQuantity('');
                } catch (err) {
                    console.error('Error updating local recipe state:', err);
                }
            }
            return;
        }

        if (!selectedIngredient || !netQuantity || parseFloat(netQuantity) <= 0) {
            setErrors({ ingredient: t('recipeEditor.selectAndQuantity') });
            return;
        }

        const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
        if (!ingredient) return;

        const neto = parseFloat(netQuantity) || 0;
        const fc = getCorrectionFactor(ingredient.name);
        const bruto = neto * fc;
        
        // Use latest price from wholesale list
        const purchaseQuantity = ingredient.quantity || 1;
        const price = ingredient.purchasePrice || ingredient.purchase_price || 0;
        const costoTotal = (bruto / purchaseQuantity) * price;
        
        const nutritional = getNutritionalData(ingredient.name);
        const calories = (neto / 100) * (nutritional?.calories || 0);

        const newIngredient = {
            id: `recipe_ing_${Date.now()}_${Math.random()}`,
            ingredientId: ingredient.id,
            name: ingredient.name,
            neto,
            unit: ingredient.unit,
            fc,
            bruto,
            costoTotal,
            costoPorcion: (costoTotal / (formData.portions || 1)),
            calories,
            caloriasPorcion: (calories / (formData.portions || 1))
        };

        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, newIngredient]
        }));

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

    // Image Compression & Upload
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Compress Image using Canvas
            const compressedFile = await compressImage(file);
            
            // 2. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `recipe_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('platify-photos')
                .upload(filePath, compressedFile);

            if (error) throw error;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('platify-photos')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, photoUrl: publicUrl }));
        } catch (err) {
            console.error("Error uploading photo:", err);
            alert("Error al subir la foto. Asegurate de que el bucket 'platify-photos' existe en Supabase.");
        } finally {
            setIsUploading(false);
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const recipeData = {
            ...formData,
            id: recipe?.id || `recipe_${Date.now()}`,
            total_cost: totals.totalCosto,
            total_calories: totals.totalCalorias,
            costo_por_porcion: totals.costoPorPorcion,
            calorias_por_porcion: totals.caloriasPorPorcion,
            haccp_notes: formData.haccpNotes,
            photo_url: formData.photoUrl,
            updated_at: new Date().toISOString()
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.portions}
                                    onChange={(e) => handlePortionsChange(e.target.value)}
                                    min="1"
                                    style={{ width: '100px' }}
                                />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>porciones</span>
                            </div>
                            {errors.portions && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.portions}</span>}
                        </div>
                    </div>

                    {/* Add Ingredient Section */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={18} color="var(--primary)" />
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{isAddingNew ? t('ingredients.addNew') : t('recipeEditor.addIngredient')}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddingNew(!isAddingNew)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'underline' }}
                            >
                                {isAddingNew ? `« ${t('common.cancel')}` : `+ ${t('ingredients.addNew')}`}
                            </button>
                        </div>

                        {!isAddingNew ? (
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
                                        {Object.entries(
                                            ingredients.reduce((acc, ing) => {
                                                const cat = ing.category || t('ingredients.categories.other');
                                                if (!acc[cat]) acc[cat] = [];
                                                acc[cat].push(ing);
                                                return acc;
                                            }, {})
                                        ).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                                            <optgroup key={category} label={category}>
                                                {items
                                                    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                                    .map(ing => (
                                                        <option key={ing.id} value={ing.id}>
                                                            {ing.name} ({formatCurrency(ing.purchasePrice, currency)} / {ing.quantity}{ing.unit})
                                                        </option>
                                                    ))}
                                            </optgroup>
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
                                        placeholder="Ej: 500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddIngredient}
                                    style={{ height: '42px', padding: '0 1.5rem' }}
                                >
                                    Añadir a Receta
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('common.name')}</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={quickAddIngredient.name}
                                        onChange={(e) => setQuickAddIngredient({ ...quickAddIngredient, name: e.target.value })}
                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                        placeholder="Ej: Roast Beef"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('common.category')}</label>
                                    <select
                                        className="input"
                                        value={quickAddIngredient.category}
                                        onChange={(e) => setQuickAddIngredient({ ...quickAddIngredient, category: e.target.value })}
                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                    >
                                        <option value="Carnes">{t('ingredients.categories.meat')}</option>
                                        <option value="Vegetales">{t('ingredients.categories.vegetables')}</option>
                                        <option value="Secos">{t('ingredients.categories.dry')}</option>
                                        <option value="Lácteos">{t('ingredients.categories.dairy')}</option>
                                        <option value="Otros">{t('ingredients.categories.other')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('ingredients.purchasePrice')} ({currency})</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={quickAddIngredient.purchasePrice}
                                        onChange={(e) => setQuickAddIngredient({ ...quickAddIngredient, purchasePrice: e.target.value })}
                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                        placeholder={currency}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('common.quantity')}</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={quickAddIngredient.quantity}
                                        onChange={(e) => setQuickAddIngredient({ ...quickAddIngredient, quantity: e.target.value })}
                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('common.unit')}</label>
                                    <select
                                        className="input"
                                        value={quickAddIngredient.unit}
                                        onChange={(e) => setQuickAddIngredient({ ...quickAddIngredient, unit: e.target.value })}
                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                    >
                                        <option value="g">{t('units.g')}</option>
                                        <option value="ml">{t('units.ml')}</option>
                                        <option value="unidades">{t('units.units')}</option>
                                        <option value="kg">{t('units.kg')}</option>
                                        <option value="l">{t('units.l')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('recipes.netWeight')}</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={netQuantity}
                                        onChange={(e) => setNetQuantity(e.target.value)}
                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddIngredient}
                                    style={{ height: '42px', background: 'var(--success)', whiteSpace: 'nowrap', padding: '0 1rem', fontSize: '0.875rem' }}
                                >
                                    {t('common.add')}
                                </button>
                            </div>
                        )}
                        {errors.ingredient && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.75rem', display: 'block' }}>{errors.ingredient}</span>}
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

                    {/* Preparation, HACCP and Plating */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Procedure */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <ClipboardList size={18} color="var(--primary)" />
                                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {t('recipeEditor.procedure')}
                                </label>
                            </div>
                            <textarea
                                className="input"
                                value={formData.procedure}
                                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                                style={{ width: '100%', minHeight: '150px', resize: 'vertical', lineHeight: '1.5' }}
                                placeholder="Describí los pasos de la elaboración..."
                            />
                        </div>

                        {/* HACCP & Safety */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <ShieldCheck size={18} color="var(--error)" />
                                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {t('recipeEditor.haccp')}
                                </label>
                            </div>
                            <textarea
                                className="input"
                                value={formData.haccpNotes}
                                onChange={(e) => setFormData({ ...formData, haccpNotes: e.target.value })}
                                style={{ width: '100%', minHeight: '150px', resize: 'vertical', borderLeft: '3px solid var(--error)' }}
                                placeholder="Notas críticas de seguridad, temperaturas, etc."
                            />
                        </div>
                    </div>

                    {/* Photo Plating Section */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Image size={18} color="var(--accent)" />
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{t('recipeEditor.platingInstructions')}</h3>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Subí una foto del plato terminado para mantener la uniformidad estética en todos los comedores.
                                </p>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: 'none' }}
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className={`btn ${isUploading ? 'btn-secondary' : 'btn-primary'}`}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                                    >
                                        <Upload size={16} />
                                        {isUploading ? 'Subiendo...' : 'Subir Foto de Emplatado'}
                                    </label>
                                    
                                    {formData.photoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                                            style={{ color: 'var(--error)', background: 'transparent', border: 'none', marginLeft: '1rem', cursor: 'pointer', fontSize: '0.875rem' }}
                                        >
                                            <Trash size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                            Eliminar foto
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {formData.photoUrl && (
                                <div style={{ width: '200px', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img 
                                        src={formData.photoUrl} 
                                        alt="Vista previa" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div style={{ background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
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
