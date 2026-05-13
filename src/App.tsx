import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Builder } from './pages/Builder'
import { Home } from './pages/Home'
import { Jobs } from './pages/Jobs'
import { PublicSite } from './pages/PublicSite'
import { Strength } from './pages/Strength'
import { Templates } from './pages/Templates'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="templates" element={<Templates />} />
          <Route path="builder" element={<Builder />} />
          <Route path="ats" element={<Strength />} />
          <Route path="strength" element={<Navigate to="/ats" replace />} />
          <Route path="jobs" element={<Jobs />} />
        </Route>
        <Route path="site/:slug" element={<PublicSite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
