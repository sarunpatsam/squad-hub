import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UserApp from "./pages/UserApp";
import PartnerApp from "./pages/PartnerApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/app"     element={<UserApp />} />
        <Route path="/app/*"   element={<UserApp />} />
        <Route path="/partner" element={<PartnerApp />} />
      </Routes>
    </BrowserRouter>
  );
}
