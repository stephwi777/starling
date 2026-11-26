import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router'
import ScrollToTop from './components/ScrollToTop.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Placeholder from './pages/Placeholder.jsx'
import './App.css'



// PAGES

const Contact = lazy(() => import('./pages/Contact.jsx'))
const Credits = lazy(() => import('./pages/Credits.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Tonight = lazy(() => import('./pages/Tonight.jsx'))
const Calendar = lazy(() => import('./pages/Calendar.jsx'))
const Tools = lazy(() => import('./pages/Tools.jsx'))
const MoonPanel = lazy(() => import('./components/moon/MoonPanel.jsx'))
const CloudsPanel = lazy(() => import('./components/clouds/CloudsPanel.jsx'))
const DarknessPanel = lazy(() => import('./components/darkness/DarknessPanel.jsx'))
const SeeingPanel = lazy(() => import('./components/seeing/SeeingPanel.jsx'))
const UpTonightPanel = lazy(() => import('./components/uptonight/UpTonightPanel.jsx'))



// APP

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />



      {/* PAGES */}

      <Suspense fallback={<main className="page-loading" aria-busy="true" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="tonight" element={<Tonight />}>
          <Route path="moon" element={<MoonPanel />} />
          <Route path="clouds" element={<CloudsPanel />} />
          <Route path="darkness" element={<DarknessPanel />} />
          <Route path="seeing" element={<SeeingPanel />} />
          <Route path="up" element={<UpTonightPanel />} />
        </Route>
        <Route path="calendar" element={<Calendar />} />
        <Route path="map" element={<Placeholder title="Map" />} />
        <Route path="learn" element={<Placeholder title="Learn" />} />
        <Route path="tools" element={<Tools />} />
        <Route path="about" element={<About />} />
        <Route path="credits" element={<Credits />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Placeholder title="Lost in space" text="We couldn't find that page." />} />
      </Routes>
      </Suspense>



      {/* FOOTER */}

      <Footer />
    </>
  )
}

export default App
