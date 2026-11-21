import { Routes, Route } from 'react-router'
import ScrollToTop from './components/ScrollToTop.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Placeholder from './pages/Placeholder.jsx'
import Contact from './pages/Contact.jsx'
import Credits from './pages/Credits.jsx'
import About from './pages/About.jsx'
import Tonight from './pages/Tonight.jsx'
import Calendar from './pages/Calendar.jsx'
import MoonPanel from './components/moon/MoonPanel.jsx'
import CloudsPanel from './components/clouds/CloudsPanel.jsx'
import DarknessPanel from './components/darkness/DarknessPanel.jsx'
import SeeingPanel from './components/seeing/SeeingPanel.jsx'
import UpTonightPanel from './components/uptonight/UpTonightPanel.jsx'
import './App.css'



// APP

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />



      {/* PAGES */}

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
        <Route path="tools" element={<Placeholder title="Sky tools" />} />
        <Route path="about" element={<About />} />
        <Route path="credits" element={<Credits />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Placeholder title="Lost in space" text="We couldn't find that page." />} />
      </Routes>



      {/* FOOTER */}

      <Footer />
    </>
  )
}

export default App
