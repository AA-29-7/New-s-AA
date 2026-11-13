import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../shared/components/AppShell'
import { Home } from '../shared/components/Home'
import { QuestsPage } from '../shared/quest/QuestsPage'
import { modules } from './modules'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell modules={modules} />}>
        <Route index element={<Home modules={modules} />} />
        <Route path="quetes" element={<QuestsPage />} />
        {modules.map(({ id, component: Page }) => (
          <Route key={id} path={`${id}/*`} element={<Page />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
