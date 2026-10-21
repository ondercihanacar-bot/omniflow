import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';

// Web sayfasını her kapatıp açtığımızda oturum sıfırlansın ve kullanıcı adı/şifre ekranı açılsın.
try {
  localStorage.removeItem('itmanager_user_session');
  localStorage.removeItem('itmanager_admin_logged_in');
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
