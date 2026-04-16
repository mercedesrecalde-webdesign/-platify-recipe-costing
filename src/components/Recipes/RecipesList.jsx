import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { useNotifications } from '../UI/Notifications';
import { formatCurrency } from '../../utils/currencyConverter';
import RecipeEditor from './RecipeEditor';
import DietaryAssistant from './DietaryAssistant';
import Receta from '../Excel/Receta';
import ConfirmDialog from '../UI/ConfirmDialog';
import { Plus, Edit2, Trash2, Copy, ChefHat, Eye, FileText, Sparkles, Printer } from 'lucide-react';
import excelData from '../../data/excel_full_data.json';

export default function RecipesList() {
    const { t } = useTranslation();
    const { recipes, addRecipe, updateRecipe, deleteRecipe, ingredients } = useData();
    const { currency } = useSettings();
    const { success } = useNotifications();

    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [viewingExcelRecipe, setViewingExcelRecipe] = useState(null);
    const [assistantOpen, setAssistantOpen] = useState(false);

    // Parse Excel recipes
    const excelRecipes = useMemo(() => {
        const result = [];
        for (let i = 1; i <= 5; i++) {
            const sheetName = `RECETA ${i}`;
            const sheet = excelData[sheetName] || excelData[`${sheetName} `];

            if (!sheet || !sheet.data) continue;

            const nombreReceta = sheet.data[1]?.[1] || `RECETA ${i}`;
            let porciones = 4;
            let totalCosto = 0;
            let totalCalorias = 0;

            const nombreMatch = nombreReceta.match(/(\d+)\s*porciones/i);
            if (nombreMatch) {
                porciones = parseInt(nombreMatch[1]);
            }

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

            result.push({
                numero: i,
                nombre: nombreReceta,
                porciones,
                totalCosto,
                costoPorPorcion: totalCosto / porciones,
                totalCalorias,
                caloriasPorPorcion: totalCalorias / porciones,
                fromExcel: true
            });
        }
        return result;
    }, []);

    const handleNewRecipe = () => {
        setSelectedRecipe(null);
        setEditorOpen(true);
    };

    const handleEditRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setEditorOpen(true);
    };

    const handleCloneRecipe = (recipe) => {
        const clonedRecipe = {
            ...recipe,
            name: recipe.nombre ? `${recipe.nombre} (Copia)` : `${recipe.name} (Copia)`,
            nombre: undefined,
            numero: undefined,
            fromExcel: undefined,
            id: undefined
        };
        setSelectedRecipe(clonedRecipe);
        setEditorOpen(true);
    };

    const handleSaveRecipe = (recipeData) => {
        if (selectedRecipe && selectedRecipe.id) {
            updateRecipe(selectedRecipe.id, recipeData);
            success(t('recipesList.recipeUpdated'));
        } else {
            addRecipe(recipeData);
            success(t('recipesList.recipeCreated'));
        }
    };

    const handleDeleteClick = (recipe) => {
        setConfirmDelete(recipe);
    };

    const handleDeleteConfirm = () => {
        if (confirmDelete) {
            deleteRecipe(confirmDelete.id);
            success(`"${confirmDelete.name}" ${t('recipesList.recipeDeleted')}`);
            setConfirmDelete(null);
        }
    };

    const handleViewExcelRecipe = (recipeNumber) => {
        setViewingExcelRecipe(recipeNumber);
    };

    const handleAIAssistant = () => {
        setAssistantOpen(true);
    };

    const handleGenerateFromAI = (recipeData) => {
        addRecipe(recipeData);
        setAssistantOpen(false);
    };

    const handlePrint = (recipe) => {
        const printWindow = window.open('', '_blank');
        
        // CSS for A4 Print
        const printStyles = `
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Inter', -apple-system, sans-serif; color: #333; line-height: 1.6; padding: 0; margin: 0; background: white !important; }
            .print-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
            .title { font-size: 24pt; font-weight: bold; margin: 0; color: #1a1a1a; }
            .meta { font-size: 10pt; color: #666; }
            .section { margin-bottom: 2rem; page-break-inside: avoid; }
            .section-title { font-size: 14pt; font-weight: bold; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 1rem; background: #f9f9f9; padding: 5px 10px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
            .table th { background: #f2f2f2; text-align: left; padding: 8px; border: 1px solid #ddd; font-size: 10pt; }
            .table td { padding: 8px; border: 1px solid #ddd; font-size: 10pt; }
            .totals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; background: #f9f9f9; padding: 1rem; border-radius: 4px; margin-top: 2rem; }
            .total-item { text-align: center; }
            .total-label { font-size: 8pt; color: #666; display: block; }
            .total-value { font-size: 12pt; font-weight: bold; }
            .haccp { border: 2px solid #ff4444; padding: 1rem; border-radius: 4px; background: #fff5f5; }
            .photo-container { width: 100%; height: 300px; overflow: hidden; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid #ddd; }
            .photo-container img { width: 100%; height: 100%; object-fit: cover; }
            .footer { margin-top: 3rem; font-size: 8pt; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 1rem; }
        `;

        const ingredientsHtml = (recipe.ingredients || []).map(ing => `
            <tr>
                <td>${ing.name || ing.nombre}</td>
                <td style="text-align: right;">${(ing.neto || ing.quantity || 0).toFixed(1)} ${ing.unit || 'g'}</td>
                <td style="text-align: center;">${(ing.fc || 1).toFixed(2)}</td>
                <td style="text-align: right;">${(ing.bruto || 0).toFixed(1)} ${ing.unit || 'g'}</td>
                <td style="text-align: right;">${formatCurrency(ing.costoTotal || ing.cost || 0, currency)}</td>
            </tr>
        `).join('');

        const photoHtml = (recipe.photo_url || recipe.photoUrl) 
            ? `<div class="photo-container"><img src="${recipe.photo_url || recipe.photoUrl}" alt="Emplatado" /></div>` 
            : '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Platify - ${recipe.name || recipe.nombre}</title>
                    <style>${printStyles}</style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="header">
                            <div>
                                <h1 class="title">${recipe.name || recipe.nombre}</h1>
                                <div class="meta">
                                    <span>${new Date().toLocaleDateString()}</span> • 
                                    <span>${recipe.portions || recipe.porciones} ${t('recipesList.portions')}</span>
                                </div>
                            </div>
                            <div style="text-align: right; color: #999; font-size: 12pt; font-weight: 900;">PLATIFY</div>
                        </div>

                        ${photoHtml}

                        <div class="section">
                            <h2 class="section-title">${t('recipeEditor.recipeIngredients')}</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Ingrediente</th>
                                        <th style="text-align: right;">Peso Neto</th>
                                        <th style="text-align: center;">FC</th>
                                        <th style="text-align: right;">Peso Bruto</th>
                                        <th style="text-align: right;">Costo</th>
                                    </tr>
                                </thead>
                                <tbody>${ingredientsHtml}</tbody>
                            </table>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                            <div class="section">
                                <h2 class="section-title">${t('recipeEditor.procedure')}</h2>
                                <div style="white-space: pre-wrap; font-size: 10pt;">${recipe.procedure || 'No se especificó procedimiento.'}</div>
                            </div>
                            <div class="section">
                                <h2 class="section-title" style="border-left-color: #ff4444; color: #cc0000;">${t('recipeEditor.haccp')}</h2>
                                <div class="haccp">${recipe.haccp_notes || recipe.haccpNotes || 'No hay notas críticas de seguridad.'}</div>
                            </div>
                        </div>

                        <div class="totals">
                            <div class="total-item">
                                <span class="total-label">COSTO TOTAL</span>
                                <span class="total-value">${formatCurrency(recipe.total_cost || recipe.totalCosto || 0, currency)}</span>
                            </div>
                            <div class="total-item">
                                <span class="total-label">COSTO / PORCIÓN</span>
                                <span class="total-value">${formatCurrency(recipe.costo_por_porcion || recipe.costoPorPorcion || 0, currency)}</span>
                            </div>
                            <div class="total-item">
                                <span class="total-label">CALORÍAS TOTALES</span>
                                <span class="total-value">${(recipe.total_calories || recipe.totalCalorias || 0).toFixed(0)} kcal</span>
                            </div>
                            <div class="total-item">
                                <span class="total-label">CALORÍAS / PORCIÓN</span>
                                <span class="total-value">${(recipe.calorias_por_porcion || recipe.caloriasPorPorcion || 0).toFixed(0)} kcal</span>
                            </div>
                        </div>

                        <div class="footer">
                            Desarrollado por Mercedes Recalde - Platify Recipe Costing App &copy; ${new Date().getFullYear()}
                        </div>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Filter only custom recipes (not the Excel ones)
    const customRecipes = recipes.filter(r => !r.fromExcel);

    // Combine all recipes for display
    const allRecipesForDisplay = [...excelRecipes, ...customRecipes];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                            {t('recipesList.myRecipes')}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {excelRecipes.length} {t('recipesList.sampleRecipes')} • {customRecipes.length} {t('recipesList.customRecipes')}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={handleAIAssistant}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(212, 169, 58, 0.3)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Sparkles size={18} />
                            {t('recipesList.aiAssistant')}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleNewRecipe}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} />
                            {t('recipesList.newRecipe')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Recipes Grid */}
            {allRecipesForDisplay.length === 0 ? (
                <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '3rem 2rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <ChefHat size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                        {t('recipesList.noRecipes')}
                    </h3>
                    <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        {t('recipesList.startCreating')}
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={handleNewRecipe}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        {t('recipesList.createFirst')}
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1rem'
                }}>
                    {allRecipesForDisplay.map((recipe) => (
                        <div
                            key={recipe.fromExcel ? `excel-${recipe.numero}` : recipe.id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                borderLeft: recipe.fromExcel
                                    ? '4px solid var(--warning)'
                                    : '4px solid var(--primary)'
                            }}
                        >
                            {/* Recipe Type Badge */}
                            <div style={{ marginBottom: '0.75rem' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: recipe.fromExcel ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    color: recipe.fromExcel ? 'var(--warning)' : 'var(--primary)',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    {recipe.fromExcel ? (
                                        <>
                                            <FileText size={12} />
                                            {t('recipesList.sampleBadge')}
                                        </>
                                    ) : (
                                        <>
                                            <ChefHat size={12} />
                                            {t('recipesList.customBadge')}
                                        </>
                                    )}
                                </span>
                            </div>

                            {/* Recipe Image Preview */}
                            {(recipe.photo_url || recipe.photoUrl) && (
                                <div style={{ 
                                    width: '100%', 
                                    height: '160px', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden', 
                                    marginBottom: '1rem',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <img 
                                        src={recipe.photo_url || recipe.photoUrl} 
                                        alt={recipe.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '1.125rem' }}>
                                    {recipe.nombre || recipe.name}
                                </h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    {recipe.porciones || recipe.portions} {t('recipesList.portions')}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem',
                                padding: '1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '6px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                        {t('recipesList.costPerPortion')}
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                                        {formatCurrency(recipe.costoPorPorcion || 0, currency)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                        {t('recipesList.caloriesPerPortion')}
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                        {(recipe.caloriasPorPorcion || 0).toFixed(0)} kcal
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => recipe.fromExcel ? handleViewExcelRecipe(recipe.numero) : handleEditRecipe(recipe)}
                                    className="btn btn-secondary"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        padding: '0.5rem'
                                    }}
                                >
                                    {recipe.fromExcel ? <Eye size={14} /> : <Edit2 size={14} />}
                                    <span>{recipe.fromExcel ? t('recipesList.view') : t('recipesList.edit')}</span>
                                </button>

                                <button
                                    onClick={() => handlePrint(recipe)}
                                    className="btn btn-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        padding: '0.5rem'
                                    }}
                                    title={t('common.print')}
                                >
                                    <Printer size={14} />
                                </button>

                                <button
                                    onClick={() => handleCloneRecipe(recipe)}
                                    className="btn btn-secondary"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        padding: '0.5rem'
                                    }}
                                    title={t('recipesList.clone')}
                                >
                                    <Copy size={14} />
                                    <span>{t('recipesList.clone')}</span>
                                </button>

                                {!recipe.fromExcel && (
                                    <button
                                        onClick={() => handleDeleteClick(recipe)}
                                        className="btn btn-secondary"
                                        style={{
                                            background: 'var(--error)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem'
                                        }}
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recipe Editor Modal */}
            <RecipeEditor
                recipe={selectedRecipe}
                isOpen={editorOpen}
                onClose={() => {
                    setEditorOpen(false);
                    setSelectedRecipe(null);
                }}
                onSave={handleSaveRecipe}
            />

            {/* AI Dietary Assistant */}
            <DietaryAssistant
                isOpen={assistantOpen}
                onClose={() => setAssistantOpen(false)}
                onGenerateRecipe={handleGenerateFromAI}
                ingredients={ingredients}
            />

            {/* Excel Recipe Viewer Modal */}
            {viewingExcelRecipe && (
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
                    padding: '1rem'
                }} onClick={() => setViewingExcelRecipe(null)}>
                    <div
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            maxWidth: '1200px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0, color: 'var(--primary)' }}>RECETA {viewingExcelRecipe}</h2>
                            <button
                                onClick={() => setViewingExcelRecipe(null)}
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {t('common.close')}
                            </button>
                        </div>
                        <Receta recetaNum={viewingExcelRecipe} />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDeleteConfirm}
                title={t('recipesList.deleteTitle')}
                message={`${t('recipesList.deleteConfirm')} "${confirmDelete?.name}"? ${t('recipesList.deleteWarning')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
}
