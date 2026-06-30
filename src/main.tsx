import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error overlay for debugging
window.addEventListener('error', (event) => {
  const errorMsg = String(event.message || event.error?.message || "");
  if (
    errorMsg.includes("WebSocket") || 
    errorMsg.includes("websocket") || 
    errorMsg.includes("vite") || 
    errorMsg.includes("HMR") ||
    errorMsg.includes("connection") ||
    errorMsg.includes("closed without opened")
  ) {
    // Ignore benign environment/websocket errors caused by disabled dev-server HMR
    return;
  }

  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '0';
  errorContainer.style.left = '0';
  errorContainer.style.width = '100vw';
  errorContainer.style.height = '100vh';
  errorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  errorContainer.style.color = '#ff3333';
  errorContainer.style.fontFamily = 'monospace';
  errorContainer.style.padding = '20px';
  errorContainer.style.zIndex = '999999';
  errorContainer.style.overflow = 'auto';
  errorContainer.style.boxSizing = 'border-box';
  
  errorContainer.innerHTML = `
    <h1 style="color: #ff0055; margin-top: 0;">⚠️ Uncaught Error</h1>
    <p style="font-weight: bold; font-size: 16px;">${event.message || event.error?.message}</p>
    <pre style="background: #220000; padding: 15px; border-radius: 5px; color: #ff9999; border: 1px solid #ff3333; overflow-x: auto;">${event.error?.stack || 'No stack trace available'}</pre>
  `;
  document.body.appendChild(errorContainer);
});

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || "");
  if (
    reasonStr.includes("WebSocket") || 
    reasonStr.includes("websocket") || 
    reasonStr.includes("vite") || 
    reasonStr.includes("HMR") ||
    reasonStr.includes("connection") ||
    reasonStr.includes("closed without opened")
  ) {
    // Ignore benign environment/websocket errors caused by disabled dev-server HMR
    return;
  }

  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '0';
  errorContainer.style.left = '0';
  errorContainer.style.width = '100vw';
  errorContainer.style.height = '100vh';
  errorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  errorContainer.style.color = '#ff3333';
  errorContainer.style.fontFamily = 'monospace';
  errorContainer.style.padding = '20px';
  errorContainer.style.zIndex = '999999';
  errorContainer.style.overflow = 'auto';
  errorContainer.style.boxSizing = 'border-box';
  
  errorContainer.innerHTML = `
    <h1 style="color: #ff0055; margin-top: 0;">⚠️ Unhandled Promise Rejection</h1>
    <p style="font-weight: bold; font-size: 16px;">${event.reason?.message || event.reason}</p>
    <pre style="background: #220000; padding: 15px; border-radius: 5px; color: #ff9999; border: 1px solid #ff3333; overflow-x: auto;">${event.reason?.stack || 'No stack trace available'}</pre>
  `;
  document.body.appendChild(errorContainer);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
