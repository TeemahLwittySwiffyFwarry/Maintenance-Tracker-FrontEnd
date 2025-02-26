import React, { useState, useEffect } from "react";
import axios from "axios";
import authService from "../services/authService";
import { useNavigate, useParams } from "react-router-dom";

function RepairForm() {
  const [machines, setMachines] = useState([]);
  const [repairTypes, setRepairTypes] = useState([]);
  const {Id,machineId } = useParams();  // Add machineId

  const [repairData, setRepairData] = useState({
    machine: "",
    repair_type: "",
    price: "",
    time_added: "",
    time_update:"",
  });

  const navigate = useNavigate();
  const { id } = useParams();  // For editing an existing repair

  // Fetch machines and repair types on load
  useEffect(() => {
    const fetchMachinesAndRepairTypes = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }
  
        const token = user.access;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const machineResponse = await axios.get("http://localhost:8000/api/machines/", config);
        setMachines(machineResponse.data);
  
        const repairTypeResponse = await axios.get("http://localhost:8000/api/repair-types/", config);
        setRepairTypes(repairTypeResponse.data);
        
        // Pre-fill machine if machineId is present
        if (machineId) {
          setRepairData((prevData) => ({
            ...prevData,
            machine: machineId,
          }));
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
  
    fetchMachinesAndRepairTypes();
  
    if (id) {
      const fetchRepairData = async () => {
        try {
          const user = authService.getCurrentUser();
          if (!user) {
            navigate("/login");
            return;
          }
  
          const token = user.access;
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
  
          const repairResponse = await axios.get(`http://localhost:8000/api/repairs/${id}/`, config);
          setRepairData(repairResponse.data);
        } catch (error) {
          console.error("Error fetching repair data", error);
        }
      };
  
      fetchRepairData();
    }
  }, [id, machineId]);  // Add machineId as a dependency
  
  

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRepairData({
      ...repairData,
      [name]: value,
    });
  };

  // Handle form submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
  
    const token = user.access;
    const apiUrl = id
      ? `http://localhost:8000/api/repairs/${id}/`
      : "http://localhost:8000/api/repairs/";
  
    // Format `time_added` correctly
    const formattedData = {
      ...repairData,
      time_added: new Date().toISOString(),  // Correctly formatted datetime
    };
  
    if (!id) {
      formattedData.time_updated = new Date().toISOString();  // Include `time_updated` if required
    }
  
    try {
      if (id) {
        await axios.put(apiUrl, formattedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
      } else {
        await axios.post(apiUrl, formattedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
  
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting repair form", error);
    }
  };
  

  return (
    <div className="container mx-auto p-4 z-60">
      <h2 className="text-center text-2xl mb-4">{id ? "Edit Repair" : "Add Repair"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Machine</label>
          <select
            name="machine"
            value={repairData.machine}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select a machine</option>
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Repair Type</label>
          <select
            name="repair_type"
            value={repairData.repair_type}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select repair type</option>
            {repairTypes.map((repairType) => (
              <option key={repairType.id} value={repairType.id}>
                {repairType.name}
              </option>
            ))}
            <option value="other">Other (Specify)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={repairData.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Price (in Naira)</label>
          <input
            type="number"
            name="price"
            value={repairData.price}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
          {id ? "Update Repair" : "Add Repair"}
        </button>
      </form>
    </div>
  );
}

export default RepairForm;
