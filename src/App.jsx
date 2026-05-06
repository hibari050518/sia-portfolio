import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import WorksHome from './pages/WorksHome'
import WorksTheme from './pages/WorksTheme'
import WorkDetail from './pages/WorkDetail'
import FlashHome from './pages/FlashHome'
import FlashSeries from './pages/FlashSeries'
import FlashDetail from './pages/FlashDetail'
import './styles/global.css'

function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <>
      {!isHome && <Navbar />}
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/works"               element={<WorksHome />} />
        <Route path="/works/:theme"        element={<WorksTheme />} />
        <Route path="/works/:theme/:id"    element={<WorkDetail />} />
        <Route path="/flash"               element={<FlashHome />} />
        <Route path="/flash/:series"       element={<FlashSeries />} />
        <Route path="/flash/:series/:id"   element={<FlashDetail />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
