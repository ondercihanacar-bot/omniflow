import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';

// Web sayfasını her kapatıp açtığımızda oturum sıfırlansın ve kullanıcı adı/şifre ekranı açılsın.
try {
  localStorage.removeItem('itmanager_user_session');
  localStorage.removeItem('itmanager_admin_logged_in');

  const navEntries = typeof performance !== 'undefined' && performance.getEntriesByType && performance.getEntriesByType('navigation');
  const isReload = (navEntries && navEntries[0] && navEntries[0].type === 'reload') ||
                   (typeof window !== 'undefined' && window.performance && window.performance.navigation && window.performance.navigation.type === 1);

  if (!isReload) {
    sessionStorage.removeItem('itmanager_user_session');
    sessionStorage.removeItem('itmanager_admin_logged_in');
  }
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
