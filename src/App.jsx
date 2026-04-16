import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './components/UI/Notifications';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import './index.css';
import './i18n/config';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <DataProvider>
          <NotificationProvider>
            <div className="app-container">
              <Header />
              <main className="main-content" style={{ maxWidth: '100%', margin: '0 auto', width: '100%', padding: 0 }}>
                <Dashboard />
              </main>
            </div>
          </NotificationProvider>
        </DataProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
