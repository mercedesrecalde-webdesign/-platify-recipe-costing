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
    const { recipes, addRecipe, updateRecipe, deleteRecipe, ingredients, getCorrectionFactor } = useData();
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            @page { size: A4; margin: 12mm; }
            body { 
                font-family: 'Inter', sans-serif; 
                color: #1f2937; 
                line-height: 1.5; 
                padding: 0; 
                margin: 0; 
                background: white !important; 
            }
            .print-container { max-width: 100%; margin: 0 auto; }
            .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                border-bottom: 3px solid #d4a93a; 
                padding-bottom: 1rem; 
                margin-bottom: 1.5rem; 
            }
            .title-area h1 { 
                font-size: 22pt; 
                font-weight: 800; 
                margin: 0; 
                color: #111827; 
                letter-spacing: -0.02em;
                text-transform: uppercase;
            }
            .protocol-badge {
                background: #111827;
                color: white;
                padding: 4px 12px;
                font-size: 10pt;
                font-weight: 600;
                border-radius: 4px;
                text-transform: uppercase;
            }
            .meta-grid { 
                display: flex;
                gap: 2rem;
                margin-top: 0.5rem;
                font-size: 10pt;
                color: #4b5563;
                font-weight: 600;
            }
            .section { margin-bottom: 2rem; }
            .section-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 0.25rem;
            }
            .section-title { 
                font-size: 12pt; 
                font-weight: 800; 
                color: #111827;
                text-transform: uppercase;
                margin: 0;
            }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; border-radius: 8px; overflow: hidden; }
            .table th { 
                background: #f9fafb; 
                text-align: left; 
                padding: 10px; 
                border-bottom: 2px solid #e5e7eb; 
                font-size: 9pt; 
                font-weight: 800; 
                color: #374151;
            }
            .table td { 
                padding: 10px; 
                border-bottom: 1px solid #f3f4f6; 
                font-size: 10pt; 
            }
            .table tr:nth-child(even) { background: #fafafa; }
            .haccp-box { 
                border: 2px solid #ef4444; 
                padding: 1rem; 
                background: #fef2f2; 
                color: #991b1b;
                font-weight: 600;
                font-size: 10pt;
            }
            .photo-frame { 
                width: 100%; 
                height: 220px; 
                overflow: hidden; 
                border-radius: 12px;
                margin-bottom: 1.5rem; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .photo-frame img { width: 100%; height: 100%; object-fit: cover; }
            .procedure-container { 
                font-size: 10pt; 
                color: #374151;
                white-space: pre-wrap;
                line-height: 1.6;
            }
            .brand-footer { 
                margin-top: 2rem; 
                padding-top: 1rem;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                font-size: 8pt; 
                color: #9ca3af; 
            }
        `;

        const ingredientsHtml = (recipe.ingredients || []).map(ing => {
            const neto = ing.net_quantity || ing.neto || 0;
            // Always recalculate FC and Bruto to ensure accuracy
            const fc = getCorrectionFactor(ing.ingredient?.name || ing.name || '');
            const bruto = neto * fc;
            return `
                <tr>
                    <td style="font-weight: 600; color: #111827;">${ing.ingredient?.name || ing.name || ing.nombre}</td>
                    <td style="text-align: right; color: #6b7280;">${parseFloat(neto).toFixed(1)} ${ing.unit || 'g'}</td>
                    <td style="text-align: center; color: #d4a93a; font-weight: 800;">${parseFloat(fc).toFixed(2)}</td>
                    <td style="text-align: right; font-weight: 800; color: #111827;">${parseFloat(bruto).toFixed(1)} ${ing.unit || 'g'}</td>
                </tr>
            `;
        }).join('');

        const photoHtml = (recipe.photo_url || recipe.photoUrl) 
            ? `<div class="photo-frame"><img src="${recipe.photo_url || recipe.photoUrl}" alt="Emplatado" /></div>` 
            : '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>FT - ${recipe.name || recipe.nombre}</title>
                    <style>${printStyles}</style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="header">
                            <div class="title-area">
                                <h1>${recipe.name || recipe.nombre}</h1>
                                <div class="meta-grid">
                                    <span>PORCIONES: ${recipe.portions || recipe.porciones}</span>
                                    <span>FECHA: ${new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div class="protocol-badge">Protocolo de Cocina</div>
                        </div>

                        ${photoHtml}

                        <div class="section">
                            <div class="section-header">
                                <h2 class="section-title">Ingredientes y Pesos Operativos</h2>
                            </div>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th style="width: 40%">INGREDIENTE</th>
                                        <th style="text-align: right;">PESO NETO</th>
                                        <th style="text-align: center;">FC</th>
                                        <th style="text-align: right;">PESO BRUTO (COMPRA)</th>
                                    </tr>
                                </thead>
                                <tbody>${ingredientsHtml}</tbody>
                            </table>
                        </div>

                        <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem;">
                            <div class="section">
                                <div class="section-header">
                                    <h2 class="section-title">Procedimiento de Elaboración</h2>
                                </div>
                                <div class="procedure-container">${recipe.procedure || 'No se especificó procedimiento.'}</div>
                            </div>
                            <div class="section">
                                <div class="section-header">
                                    <h2 class="section-title" style="color: #ef4444;">Seguridad Alimentaria (HACCP)</h2>
                                </div>
                                <div class="haccp-box">${recipe.haccp_notes || recipe.haccpNotes || 'Mantener buenas prácticas de manufactura.'}</div>
                                
                                <div style="margin-top: 2rem; border: 1px dashed #d1d5db; padding: 1rem; border-radius: 8px;">
                                    <h3 style="margin: 0 0 0.5rem 0; font-size: 9pt; color: #374151;">NOTAS ADICIONALES</h3>
                                    <div style="height: 100px;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="brand-footer">
                            <div>PLATIFY Gastronomic Ecosystem &bull; Gestión de Comedores</div>
                            <div>&copy; ${new Date().getFullYear()} Mercedes Recalde</div>
                        </div>
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => { window.print(); }, 500);
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
