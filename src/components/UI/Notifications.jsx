import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const success = useCallback((message) => showNotification(message, 'success'), [showNotification]);
    const error = useCallback((message) => showNotification(message, 'error'), [showNotification]);
    const info = useCallback((message) => showNotification(message, 'info'), [showNotification]);
    const warning = useCallback((message) => showNotification(message, 'warning'), [showNotification]);

    return (
        <NotificationContext.Provider value={{ success, error, info, warning }}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
}

function NotificationContainer({ notifications, onRemove }) {
    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxWidth: '400px'
        }}>
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    {...notification}
                    onClose={() => onRemove(notification.id)}
                />
            ))}
        </div>
    );
}

function Notification({ message, type, onClose }) {
    const styles = {
        success: {
            bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            icon: CheckCircle
        },
        error: {
            bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            icon: AlertTriangle
        },
        warning: {
            bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            icon: AlertTriangle
        },
        info: {
            bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            icon: Info
        }
    };

    const style = styles[type] || styles.info;
    const Icon = style.icon;

    return (
        <div style={{
            background: style.bg,
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s ease-out',
            minWidth: '300px'
        }}>
            <Icon size={20} />
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: '500' }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white'
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
}

// Add keyframes in a style tag
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}
