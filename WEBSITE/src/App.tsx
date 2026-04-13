import { Route, Routes } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import AppProviders from "@/AppProviders";
import Index from "@/views/Index";
import Gallery from "@/views/Gallery";
import About from "@/views/About";
import Services from "@/views/Services";
import Contacts from "@/views/Contacts";
import ServiceDetails from "@/views/ServiceDetails";
import NotFound from "@/views/NotFound";
import Login from "@/views/Login";
import Register from "@/views/Register";
import Profile from "@/views/Profile";
import Admin from "@/views/Admin";
import GeneralTerms from "@/views/GeneralTerms";
import PrivacyPolicy from "@/views/PrivacyPolicy";
import CookiePolicy from "@/views/CookiePolicy";
import DataRights from "@/views/DataRights";
import { AuthProvider } from "@/context/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import RouteSeo from "@/components/RouteSeo";

export default function App() {
  return (
    <AppProviders>
      <AuthProvider>
        <ScrollToTop />
        <RouteSeo />
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
          <Header />
          <div className="flex-1 min-w-0 pt-14 sm:pt-16 lg:pt-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/galeriya" element={<Gallery />} />
              <Route path="/za-nas" element={<About />} />
              <Route path="/uslugi" element={<Services />} />
              <Route path="/uslugi/usluga" element={<ServiceDetails />} />
              <Route path="/kontakti" element={<Contacts />} />
              <Route path="/vhod" element={<Login />} />
              <Route path="/registracia" element={<Register />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/obshti-usloviya" element={<GeneralTerms />} />
              <Route path="/poveritelnost" element={<PrivacyPolicy />} />
              <Route path="/biskvitki" element={<CookiePolicy />} />
              <Route path="/gdpr-prava" element={<DataRights />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <CookieConsentBanner />
        </div>
      </AuthProvider>
    </AppProviders>
  );
}
