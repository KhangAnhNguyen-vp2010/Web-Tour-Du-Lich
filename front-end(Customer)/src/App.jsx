import { Routes, Route } from "react-router-dom";
import Header from "./pages/landing/Header";
import Footer from "./pages/landing/Footer";
import SectionHome from "./pages/landing/SectionHome";
import SectionAbout from "./pages/landing/SectionAbout";
import SectionContact from "./pages/landing/SectionContact";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ToursPage from "./pages/tours/ToursPage";
import ProfilePage from "./pages/profile/ProfilePage";
import "./App.scss";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pt-16">
              <SectionHome />
              <SectionAbout />
              <SectionContact />
            </main>
            <Footer />
          </div>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
