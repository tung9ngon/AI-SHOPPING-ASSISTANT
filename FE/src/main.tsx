import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import 'antd/dist/reset.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/antd-overrides.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './theme/antdTheme';

// ConfigProvider phải nằm trong ThemeProvider để đọc được chế độ sáng/tối hiện tại.
function ThemedApp() {
  const { effectiveMode } = useTheme();
  return (
    <ConfigProvider locale={viVN} theme={effectiveMode === 'dark' ? darkTheme : lightTheme}>
      <AntdApp>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>,
);
