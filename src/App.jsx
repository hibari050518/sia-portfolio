import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import WorksHome from './pages/WorksHome'
import WorksTheme from './pages/WorksTheme'
import WorkDetail from './pages/WorkDetail'
import FlashHome from './pages/FlashHome'
import FlashSeries from './pages/FlashSeries'
import FlashDetail from './pages/FlashDetail'
import LoadingPage from './pages/LoadingPage'
import { LangProvider } from './context/LangContext'
import './styles/global.css'

function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <>
      {!isHome && pathname !== '/works' && pathname !== '/flash' && pathname !== '/loading' && !/^\/works\//.test(pathname) && !/^\/flash\//.test(pathname) && <Navbar />}
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/works"               element={<WorksHome />} />
        <Route path="/works/:theme"        element={<WorksTheme />} />
        <Route path="/works/:theme/:id"    element={<WorkDetail />} />
        <Route path="/flash"               element={<FlashHome />} />
        <Route path="/flash/:series"       element={<FlashSeries />} />
        <Route path="/flash/:series/:id"   element={<FlashDetail />} />
        <Route path="/loading"             element={<LoadingPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </LangProvider>
  )
}
