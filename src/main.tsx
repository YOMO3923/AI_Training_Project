import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// React を実際の DOM に結びつける起点
createRoot(document.getElementById('root')!).render(
  // StrictMode は開発時の問題検出を強化する React の仕組み
  <StrictMode>
    {/* BrowserRouter で URL による画面切り替えを有効化 */}
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      {/* アプリ全体の入口コンポーネント */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
