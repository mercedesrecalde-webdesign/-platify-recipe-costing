import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { useNotifications } from '../UI/Notifications';
import { formatCurrency } from '../../utils/currencyConverter';
import RecipeEditor from './RecipeEditor';
import DietaryAssistant from './DietaryAssistant';
import Receta from '../Excel/Receta';
import ConfirmDialog from '../UI/ConfirmDialog';
import { Plus, Edit2, Trash2, Copy, ChefHat, Eye, FileText, Sparkles } from 'lucide-react';
import excelData from '../../data/excel_full_data.json';

export default function RecipesList() {
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
            nombre: undefined, // Clear Excel name
            numero: undefined, // Clear Excel number
            fromExcel: undefined, // Make it editable
            id: undefined
        };
        setSelectedRecipe(clonedRecipe);
        setEditorOpen(true);
    };

    const handleSaveRecipe = (recipeData) => {
        if (selectedRecipe && selectedRecipe.id) {
            updateRecipe(selectedRecipe.id, recipeData);
            success('Receta actualizada correctamente');
        } else {
            addRecipe(recipeData);
            success('Receta creada correctamente');
        }
    };

    const handleDeleteClick = (recipe) => {
        setConfirmDelete(recipe);
    };

    const handleDeleteConfirm = () => {
        if (confirmDelete) {
            deleteRecipe(confirmDelete.id);
            success(`"${confirmDelete.name}" eliminada correctamente`);
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
                            Mis Recetas
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {excelRecipes.length} recetas de ejemplo • {customRecipes.length} recetas personalizadas
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
                            Asistente IA
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleNewRecipe}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} />
                            Nueva Receta
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
                        No hay recetas disponibles
                    </h3>
                    <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Comienza creando tu primera receta con cálculos automáticos
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={handleNewRecipe}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        Crear Primera Receta
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
                                            Receta de Ejemplo
                                        </>
                                    ) : (
                                        <>
                                            <ChefHat size={12} />
                                            Personalizada
                                        </>
                                    )}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '1.125rem' }}>
                                    {recipe.nombre || recipe.name}
                                </h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    {recipe.porciones || recipe.portions} porciones
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
                                        Costo/Porción
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                                        {formatCurrency(recipe.costoPorPorcion || 0, currency)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                        Calorías/Porción
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
                                    <span>{recipe.fromExcel ? 'Ver' : 'Editar'}</span>
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
                                    title="Clonar receta"
                                >
                                    <Copy size={14} />
                                    <span>Clonar</span>
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
                                        title="Eliminar receta"
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
                                Cerrar
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
                title="¿Eliminar receta?"
                message={`¿Estás seguro de que deseas eliminar "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    );
}
