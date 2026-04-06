import { Route, Routes } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
import { AuthProvider } from "@/context/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";

export default function App() {
  return (
    <AppProviders>
      <AuthProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </AppProviders>
  );
}
