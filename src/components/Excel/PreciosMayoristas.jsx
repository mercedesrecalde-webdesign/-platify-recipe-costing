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
    const { t, i18n } = useTranslation();
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
            success(t('prices.ingredientUpdated'));
        } else {
            // Add new
            addIngredient(ingredientData);
            success(t('prices.ingredientAdded'));
        }
    };

    const handleDeleteClick = (item) => {
        setConfirmDelete(item);
    };

    const handleDeleteConfirm = () => {
        if (confirmDelete) {
            deleteIngredient(confirmDelete.id);
            success(`"${confirmDelete.nombre}" ${t('prices.ingredientDeleted')}`);
            setConfirmDelete(null);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary)' }}>{t('prices.title')}</h2>
                    <button
                        className="btn btn-primary"
                        onClick={handleAdd}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        {t('prices.newIngredient')}
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
                        placeholder={t('prices.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {t('prices.showing')} {filteredItems.length} {t('prices.of')} {items.length} {t('prices.ingredientsCount')}
                </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                        <tr style={{ background: 'var(--primary)', color: 'white' }}>
                            <th style={{ color: 'white' }}>{t('prices.category')}</th>
                            <th style={{ color: 'white' }}>{t('prices.rawMaterial')}</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>{t('prices.quantity')}</th>
                            <th style={{ color: 'white' }}>{t('prices.measureUnit')}</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>{t('prices.purchasePrice')}</th>
                            <th style={{ color: 'white', textAlign: 'right' }}>{t('prices.unitPrice')}</th>
                            <th style={{ color: 'white', textAlign: 'center', width: '120px' }}>{t('prices.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    {t('prices.noResults')}
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
                                    success(t('prices.priceUpdated'));
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
                                                    title={t('prices.editFull')}
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
                                                    title={t('common.delete')}
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
                <strong>💡 {t('prices.howToUse')}:</strong>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', marginBottom: 0 }}>
                    <li><strong>{t('prices.quickEdit')}:</strong> {t('prices.quickEditDesc')}</li>
                    <li><strong>{t('prices.fullEdit')}:</strong> {t('prices.fullEditDesc')}</li>
                    <li><strong>{t('prices.formula')}:</strong> {t('prices.formulaDesc')}</li>
                    <li><strong>{t('prices.example')}:</strong> {t('prices.exampleDesc')}</li>
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
                title={t('prices.deleteTitle')}
                message={`${t('prices.deleteMessage')} "${confirmDelete?.nombre}"? ${t('prices.deleteWarning')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
}

export default PreciosMayoristas;
