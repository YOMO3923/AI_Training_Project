import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/common/Layout'
import DashboardPage from './features/dashboard/components/DashboardPage'
import DiaryPage from './features/diary/components/DiaryPage'
import NightRoutinePage from './features/night-routine/components/NightRoutinePage'
import ToDoList from './features/todo-list/components/ToDoList'

function App() {
  return (
    // Routes は URL と画面を結び付ける「ルーティングの入れ物」
    <Routes>
      {/* Layout を親にすることでヘッダーなど共通部分を共有 */}
      <Route element={<Layout />}>
        {/* ルートパスはポータル一覧 */}
        <Route path="/" element={<DashboardPage />} />
        {/* ナイトルーティーンページ */}
        <Route path="/night-routine" element={<NightRoutinePage />} />
        {/* 仮の ToDo ページ */}
        <Route path="/todo" element={<ToDoList />} />
        {/* 一言日記ページ */}
        <Route path="/diary" element={<DiaryPage />} />
      </Route>
      {/* どのページにも一致しない場合はトップへ戻す */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
