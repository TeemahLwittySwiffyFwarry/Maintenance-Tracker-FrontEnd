import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Updated import
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import Spinner from "./components/Spinner";

import LandingPage from "./pages/LandingPage";
import RepairDetails from "./pages/RepairDetails";
import ViewAllMachines from "./pages/ViewAllMachines";

import ViewAllMachinesAd from "./pages/ViewAllMachinesAd";


function App() {
  return (
    <LoadingProvider>
    <GlobalLoader />
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/repairs/:machineId" element={<RepairDetails />} />
        <Route path="/machine-details" element={<ViewAllMachines />} />
        <Route path="/machine-details-ad" element={<ViewAllMachinesAd />} />
        {/* You can define other routes here */}
      </Routes>
    </Router>
    </LoadingProvider>
  );
};

// This component will globally show the loader
const GlobalLoader = () => {
  const { isLoading } = useLoading();
  return isLoading ? <Spinner /> : null;
};

export default App;
