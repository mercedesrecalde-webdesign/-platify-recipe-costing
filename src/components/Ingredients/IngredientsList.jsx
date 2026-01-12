import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currencyConverter';
import { convertWeight } from '../../utils/unitConverter';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

function IngredientsList() {
    const { t } = useTranslation();
    const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useData();
    const { currency, unitSystem } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const filteredIngredients = ingredients.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <h2>{t('ingredients.title')}</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus size={20} />
                    {t('ingredients.addNew')}
                </button>
            </div>

            {/* Search */}
            <div style={{
                position: 'relative',
                marginBottom: 'var(--spacing-lg)'
            }}>
                <input
                    type="text"
                    className="input"
                    placeholder={t('common.search') + '...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                />
                <Search
                    style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-tertiary)'
                    }}
                    size={20}
                />
            </div>

            {/* Ingredients Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('common.name')}</th>
                            <th>{t('common.category')}</th>
                            <th>{t('common.quantity')}</th>
                            <th>{t('ingredients.purchasePrice')}</th>
                            <th>{t('ingredients.unitPrice')}</th>
                            <th>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIngredients.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    {t('common.noResults')}
                                </td>
                            </tr>
                        ) : (
                            filteredIngredients.map((ingredient) => (
                                <tr key={ingredient.id}>
                                    <td style={{ fontWeight: '600' }}>{ingredient.name}</td>
                                    <td>
                                        <span className="badge badge-primary">
                                            {ingredient.category}
                                        </span>
                                    </td>
                                    <td>
                                        {ingredient.quantity} {ingredient.unit}
                                    </td>
                                    <td>{formatCurrency(ingredient.purchasePrice, currency)}</td>
                                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                        {formatCurrency(ingredient.unitPrice, currency)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                title={t('common.edit')}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => deleteIngredient(ingredient.id)}
                                                title={t('common.delete')}
                                                style={{ color: 'var(--error)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default IngredientsList;
