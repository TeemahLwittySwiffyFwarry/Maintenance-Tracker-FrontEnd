import React, { useEffect, useState } from "react";
import axios from "axios";
import authService from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import AddMachineModal from "../components/AddMachineModal";
import RepairModal from "../components/RepairModal"
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import TopNavbar from "../components/TopNavbar"
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useLoading } from "../context/LoadingContext";


const Dashboard = () => {
  const [machines, setMachines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { setIsLoading } = useLoading();
  const [data, setData] = useState([]);
  
  const navigate = useNavigate();

  const openModalWithMachine = (machineId) => {
    setSelectedMachineId(machineId);
    setIsModal2Open(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/data/");
        
        // Artificial delay of 3 seconds before setting data
        setTimeout(() => {
          setData(res.data);
          setIsLoading(false);
        }, 5000); // 3000ms = 3 seconds
      } catch (error) {
        console.error("Error fetching data", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Define fetchMachines at the component level
  const fetchMachines = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const response = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/machines/", {
        headers: {
          Authorization: `Bearer ${user.access}`,
        },
      });
      setMachines(response.data);
    } catch (err) {
      console.log("Error fetching machines", err);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, [navigate]); // ✅ Only call it once when component mounts

  const getFilteredMachines = () => {
    return machines.filter((machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <TopNavbar/>
      {/* Header */}
      <div className="fixed top-16 left-0 w-full bg-green-100 shadow-md z-40 px-6  flex flex-col md:flex-row md:justify-between md:items-center  ">
  {/* Left Section: Dashboard Title */}
  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 p-4">Equipment Dashboard</h2>

  {/* Middle Section: Buttons */}
  <div className="flex justify-between mt-0 p-1 md:p-4">
    <Link to="/machine-details">
      <button className="bg-green-500 text-white p-2 rounded-lg shadow-md hover:bg-green-600 transition mr-1">
        View All Machine Details
      </button>
    </Link>

    <button
      onClick={() => setIsModalOpen(true)}
      className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition p-2 ml-1"
    >
      + Add Machine
    </button>
  </div>

  {/* Right Section: Search Bar (Always Fixed on Small Screens) */}
  <div className="w-full md:w-auto mt-0 md:mt-3 md:mt-0 p-4">
    <input
      type="text"
      placeholder="Search by Machine Name"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border p-2 rounded w-full md:w-80"
    />
  </div>
</div>



      {/* Machines List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-80 md:mt-44">
        
      {getFilteredMachines().map((machine) => (
  <div
    key={machine.id}
    className="bg-white/70 backdrop-blur-lg shadow-lg p-6 rounded-lg border border-gray-200"
  >
    <h3 className="text-xl font-semibold text-gray-800 text-center">{machine.name}</h3>

    {machine.image && (
      <LazyLoadImage 
        src={`${machine.image}`} 
        alt={machine.name} 
        className="w-auto h-80 object-cover rounded-md my-3 mx-auto"
      />
    )}

    <div className="flex justify-between mt-4">
      <button
        onClick={() => openModalWithMachine(machine.id)}
        className="bg-green-500 text-white p-2 rounded-lg shadow-md hover:bg-green-600 transition"
      >
        ➕ Add Repair
      </button>

      <button
        onClick={() => navigate(`/repairs/${machine.id}`)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        🔍 View Details
      </button>
    </div>
  </div>
))}

      </div>

      {/* Add Machine Modal */}
      <AddMachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMachineAdded={fetchMachines} // ✅ Now fetchMachines is properly defined
        className=""
      />
      <RepairModal
        isOpen={isModal2Open}
        onClose={() => setIsModal2Open(false)}
        onRepairAdded={() => console.log("Repair Added")}
        selectedMachineId={selectedMachineId} // ✅ Now fetchMachines is properly defined
        className=""
      />
    </div>
  );
};

export default Dashboard;
