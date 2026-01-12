import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { useData } from '../../context/DataContext';
import { useNotifications } from '../UI/Notifications';
import { formatCurrency } from '../../utils/currencyConverter';
import { translateIngredient } from '../../utils/ingredientTranslations';
import IngredientEditor from '../Ingredients/IngredientEditor';
import ConfirmDialog from '../UI/ConfirmDialog';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

function PreciosMayoristas() {
    const { i18n } = useTranslation();
    const { currency } = useSettings();
    const { ingredients, updateIngredient, deleteIngredient, addIngredient } = useData();
    const { success, error } = useNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Map ingredients to display format
    const items = useMemo(() => {
        return ingredients.map(ing => ({
            id: ing.id,
            categoria: ing.category || 'OTROS',
            nombre: ing.name,
            cantidad: ing.quantity,
            um: ing.unit,
            precioCompra: ing.purchasePrice,
            precioUnitario: ing.unitPrice,
            originalData: ing
        }));
    }, [ingredients]);

    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (item) => {
        setSelectedIngredient(item.originalData);
        setEditorOpen(true);
    };

    const handleAdd = () => {
        setSelectedIngredient(null);
        setEditorOpen(true);
    };

    const handleSave = (ingredientData) => {
        if (selectedIngredient) {
            // Update existing
            updateIngredient(ingredientData.id, ingredientData);
            success('Ingrediente actualizado correctamente');
        } else {
            // Add new
            addIngredient(ingredientData);
            success('Ingrediente agregado correctamente');
        }
    };

    const handleDeleteClick = (item) => {
        setConfirmDelete(item);
    };

    const handleDeleteConfirm = () => {
        if (confirmDelete) {
            deleteIngredient(confirmDelete.id);
            success(`"${confirmDelete.nombre}" eliminado correctamente`);
            setConfirmDelete(null);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary)' }}>PLANILLA DE COSTOS - LISTA DE PRECIOS MAYORISTAS</h2>
                    <button
                        className="btn btn-primary"
                        onClick={handleAdd}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        Nuevo Ingrediente
                    </button>
                </div>

                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)'
                        }}
                    />
                    <input
                        type="text"
                        className="input"
                        placeholder="Buscar ingrediente o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Mostrando {filteredItems.length} de {items.length} ingredientes
                </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                        <tr style={{ background: 'var(--primary)', color: 'white' }}>
                            <th style={{ color: 'white' }}>CATEGORÍA</th>
                            <th style={{ color: 'white' }}>MATERIA PRIMA</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>CANTIDAD</th>
                            <th style={{ color: 'white' }}>U.M.</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>PRECIO DE COMPRA</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>PRECIO UNITARIO</th>
                            <th style={{ color: 'white', textAlign: 'center', width: '120px' }}>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item, index) => {
                                const handleFieldChange = (field, value) => {
                                    const updatedData = { ...item.originalData };

                                    if (field === 'quantity') {
                                        updatedData.quantity = parseFloat(value) || 0;
                                    } else if (field === 'purchasePrice') {
                                        updatedData.purchasePrice = parseFloat(value) || 0;
                                    }

                                    // Recalculate unit price
                                    updatedData.unitPrice = updatedData.quantity > 0
                                        ? updatedData.purchasePrice / updatedData.quantity
                                        : 0;

                                    updateIngredient(item.id, updatedData);
                                    success('Precio actualizado - Recálculo automático aplicado');
                                };

                                return (
                                    <tr key={item.id} style={{ background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)' }}>
                                        <td>
                                            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                                {item.categoria}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '500' }}>
                                            {translateIngredient(item.nombre, i18n.language)}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={(e) => handleFieldChange('quantity', e.target.value)}
                                                style={{
                                                    width: '80px',
                                                    textAlign: 'right',
                                                    fontFamily: 'monospace',
                                                    padding: '0.375rem 0.5rem',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '4px',
                                                    background: 'var(--bg-primary)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.875rem'
                                                }}
                                                step="0.01"
                                                min="0"
                                            />
                                        </td>
                                        <td>{item.um}</td>
                                        <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={item.precioCompra}
                                                onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
                                                style={{
                                                    width: '100px',
                                                    textAlign: 'right',
                                                    fontFamily: 'monospace',
                                                    padding: '0.375rem 0.5rem',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '4px',
                                                    background: 'var(--bg-primary)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.875rem'
                                                }}
                                                step="0.01"
                                                min="0"
                                            />
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: 'var(--primary)', padding: '0.75rem' }}>
                                            {formatCurrency(item.precioUnitario, currency)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    style={{
                                                        background: 'var(--primary)',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="Editar completo (nombre, categoría, etc.)"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    style={{
                                                        background: 'var(--error)',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <strong>💡 Cómo usar:</strong>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', marginBottom: 0 }}>
                    <li><strong>Edición rápida:</strong> Click directamente en los campos de CANTIDAD o PRECIO DE COMPRA para editarlos. El PRECIO UNITARIO se recalcula automáticamente.</li>
                    <li><strong>Edición completa:</strong> Click en el botón ✏️ para editar nombre, categoría y otros campos.</li>
                    <li><strong>Fórmula:</strong> PRECIO UNITARIO = PRECIO DE COMPRA ÷ CANTIDAD</li>
                    <li><strong>Ejemplo:</strong> Harina 50kg a $700 = $14/kg | Harina 25kg a $360 = $14.4/kg</li>
                </ul>
            </div>

            {/* Ingredient Editor Modal */}
            <IngredientEditor
                ingredient={selectedIngredient}
                isOpen={editorOpen}
                onClose={() => {
                    setEditorOpen(false);
                    setSelectedIngredient(null);
                }}
                onSave={handleSave}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="¿Eliminar ingrediente?"
                message={`¿Estás seguro de que deseas eliminar "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    );
}

export default PreciosMayoristas;
