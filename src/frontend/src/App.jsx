import "./App.css";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import MyMap_OpenStreet from "./pages/MyMap_OpenStreet";
import Statistics from "./pages/statistics/Statistics.jsx";

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <div className="grid-container">
      <Header OpenSidebar={OpenSidebar} />
      <Sidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={OpenSidebar}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Statistics />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/map" element={<MyMap_OpenStreet />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
