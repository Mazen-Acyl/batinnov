import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pro from './pages/Pro';
import Connexion from './pages/Connexion';
import ConnexionPro from './pages/ConnexionPro';
import InscriptionClient from './pages/InscriptionClient';
import DashboardPro from './pages/DashboardPro';
import DashboardClient from './pages/DashboardClient';
import DashboardAdmin from './pages/DashboardAdmin';
import ServiceDetail from './pages/ServiceDetail';
import DemandeDevis from './pages/DemandeDevis';
import MotDePasseOublie from './pages/MotDePasseOublie';
import VerificationOTP from './pages/VerificationOTP';
import FAQ from './pages/FAQ';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* PAGES PUBLIQUES */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/pro" element={<><Navbar /><Pro /><Footer /></>} />
        <Route path="/connexion" element={<><Navbar /><Connexion /><Footer /></>} />
        <Route path="/connexion-pro" element={<><Navbar /><ConnexionPro /><Footer /></>} />
        <Route path="/inscription-client" element={<><Navbar /><InscriptionClient /><Footer /></>} />
        <Route path="/services/:serviceId" element={<><Navbar /><ServiceDetail /><Footer /></>} />
        <Route path="/faq" element={<><Navbar /><FAQ /><Footer /></>} />
        <Route path="/devis" element={<DemandeDevis />} />

        {/* AUTH */}
        <Route path="/mot-de-passe-oublie" element={<><Navbar /><MotDePasseOublie /><Footer /></>} />
        <Route path="/verification" element={<><Navbar /><VerificationOTP /><Footer /></>} />

        {/* DASHBOARDS */}
        <Route path="/dashboard-pro" element={<ProtectedRoute role="prestataire"><DashboardPro /></ProtectedRoute>} />
        <Route path="/dashboard-client" element={<ProtectedRoute role="client"><DashboardClient /></ProtectedRoute>} />
        <Route path="/dashboard-admin" element={<ProtectedRoute role="admin"><DashboardAdmin /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;