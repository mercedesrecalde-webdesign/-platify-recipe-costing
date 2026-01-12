import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger' // 'danger' or 'warning'
}) {
    if (!isOpen) return null;

    const confirmColor = type === 'danger' ? '#ef4444' : '#f59e0b';

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
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'scaleIn 0.2s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        padding: '0.75rem',
                        borderRadius: '8px'
                    }}>
                        <AlertTriangle size={24} color={confirmColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                            {title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            {message}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        style={{
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.875rem'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.875rem',
                            background: confirmColor,
                            border: 'none',
                            color: 'white'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Add keyframes
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { 
                opacity: 0;
                transform: scale(0.9);
            }
            to { 
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}
