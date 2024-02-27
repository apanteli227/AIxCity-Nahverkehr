import "./App.css";
import {useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
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
            <Header OpenSidebar={OpenSidebar}/>
            <Sidebar
                openSidebarToggle={openSidebarToggle}
                OpenSidebar={OpenSidebar}
            />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/map" element={<MyMap_OpenStreet/>}/>
                    <Route path="/statistics" element={<Statistics/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
