import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import ChatWidget from './components/ChatWidget';
import Shell from './components/Shell';
import { Loading } from './components/ui';
import Admin from './pages/Admin';
import Clients from './pages/Clients';
import Companies from './pages/Companies';
import Dashboard from './pages/Dashboard';
import InvoiceStudio from './pages/InvoiceStudio';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import Personnel from './pages/Personnel';
import { PortalHome, PortalInvoice, PortalLayout, PortalProject, PortalQuote } from './pages/Portal';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import QuoteStudio from './pages/QuoteStudio';
import Quotes from './pages/Quotes';
import Register from './pages/Register';
import { About, Advice, Demo, Features, Home, Pricing, Sectors, SiteLayout, Vision } from './pages/Site';
import Stats from './pages/Stats';

function RequireAuth() {
  const auth = useAuth();
  if (!auth?.ready) return <Loading />;
  if (!auth.user) return <Navigate to="/login" replace />;
  if (auth.isClient) return <Navigate to="/espace-client" replace />;
  return <Shell />;
}

function RequireClient() {
  const auth = useAuth();
  if (!auth?.ready) return <Loading />;
  if (!auth.user) return <Navigate to="/login" replace />;
  if (!auth.isClient) return <Navigate to="/tableau" replace />;
  return <PortalLayout />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="fonctionnalites" element={<Features />} />
          <Route path="secteurs" element={<Sectors />} />
          <Route path="demo" element={<Demo />} />
          <Route path="tarifs" element={<Pricing />} />
          <Route path="conseils" element={<Advice />} />
          <Route path="vision" element={<Vision />} />
          <Route path="a-propos" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="inscription" element={<Register />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="tableau" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<Clients />} />
          <Route path="devis" element={<Quotes />} />
          <Route path="devis/nouveau" element={<QuoteStudio />} />
          <Route path="devis/:id" element={<QuoteStudio />} />
          <Route path="factures" element={<Invoices />} />
          <Route path="factures/nouvelle" element={<InvoiceStudio />} />
          <Route path="factures/:id" element={<InvoiceStudio />} />
          <Route path="projets" element={<Projects />} />
          <Route path="projets/nouveau" element={<ProjectDetail />} />
          <Route path="projets/:id" element={<ProjectDetail />} />
          <Route path="personnel" element={<Personnel />} />
          <Route path="entreprises" element={<Companies />} />
          <Route path="statistiques" element={<Stats />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route element={<RequireClient />}>
          <Route path="espace-client" element={<PortalHome />} />
          <Route path="espace-client/devis/:id" element={<PortalQuote />} />
          <Route path="espace-client/factures/:id" element={<PortalInvoice />} />
          <Route path="espace-client/projets/:id" element={<PortalProject />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </>
  );
}
