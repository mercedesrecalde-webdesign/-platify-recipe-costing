import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function IngredientEditor({
    ingredient = null,
    isOpen,
    onClose,
    onSave
}) {
    const [formData, setFormData] = useState(ingredient || {
        name: '',
        category: 'SECOS',
        quantity: 1,
        unit: 'KG',
        purchasePrice: 0
    });

    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const categories = [
        'SECOS',
        'LÁCTEOS',
        'CARNES',
        'VEGETALES',
        'FRUTAS',
        'CONDIMENTOS',
        'BEBIDAS',
        'OTROS'
    ];

    const units = [
        'KG',
        'grs',
        'LT',
        'ml',
        'unidades',
        'paquete',
        'lata',
        'botella'
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = 'La cantidad debe ser mayor a 0';
        }

        if (!formData.purchasePrice || formData.purchasePrice < 0) {
            newErrors.purchasePrice = 'El precio debe ser mayor o igual a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Calculate unit price
        const unitPrice = formData.purchasePrice / formData.quantity;

        const ingredientData = {
            ...formData,
            unitPrice,
            id: ingredient?.id || `ing_${Date.now()}`
        };

        onSave(ingredientData);
        onClose();
    };

    const unitPrice = formData.quantity > 0
        ? (formData.purchasePrice / formData.quantity).toFixed(2)
        : '0.00';

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
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>
            <div
                style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    maxWidth: '600px',
                    width: '90%',
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
                        {ingredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
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
                    {/* Name */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Nombre del Ingrediente *
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Ej: Harina 000"
                            style={{ width: '100%' }}
                        />
                        {errors.name && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Categoría
                        </label>
                        <select
                            className="input"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            style={{ width: '100%' }}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity and Unit */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                Cantidad *
                            </label>
                            <input
                                type="number"
                                className="input"
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                                step="0.01"
                                min="0"
                                style={{ width: '100%' }}
                            />
                            {errors.quantity && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.quantity}</span>}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                Unidad
                            </label>
                            <select
                                className="input"
                                value={formData.unit}
                                onChange={(e) => handleChange('unit', e.target.value)}
                                style={{ width: '100%' }}
                            >
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Purchase Price */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Precio de Compra *
                        </label>
                        <input
                            type="number"
                            className="input"
                            value={formData.purchasePrice}
                            onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                            style={{ width: '100%' }}
                        />
                        {errors.purchasePrice && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.purchasePrice}</span>}
                    </div>

                    {/* Calculated Unit Price */}
                    <div style={{
                        background: 'var(--primary-light)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--primary)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                            PRECIO UNITARIO (calculado automáticamente)
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                            ${unitPrice} / {formData.unit}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Fórmula: Precio de Compra ÷ Cantidad
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Save size={16} />
                            {ingredient ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
