import React, { useState, useEffect } from "react";
import axios from "axios";
import authService from "../services/authService";
import Swal from "sweetalert2";
import { useLoading } from "../context/LoadingContext";
import "./loading.css"



const RepairModal = ({ isOpen, onClose, onRepairAdded, selectedMachineId }) => {
  const [machines, setMachines] = useState([]);
  const [repairTypes, setRepairTypes] = useState([]);
  const { setIsLoading } = useLoading();
  const [data, setData] = useState([]);
  const [repairData, setRepairData] = useState({
    machine: "",
    repair_type: "",
    custom_repair_type: "",
    price: "",
    description: "This is a machine",
    time_added: "",
    time_updated: "",
  });

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

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) return;
        const token = user.access;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const machinesRes = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/machines/", config);
        const repairTypesRes = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/repair-types/", config);
        
        setMachines(machinesRes.data);
        setRepairTypes(repairTypesRes.data);

        if (selectedMachineId) {
          setRepairData((prev) => ({ ...prev, machine: selectedMachineId }));
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [isOpen, selectedMachineId]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRepairData({ ...repairData, [name]: value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const user = authService.getCurrentUser();
  //   if (!user) return;
  //   const token = user.access;
  
  //   const formattedData = {
  //     ...repairData,
  //     repair_type: repairData.repair_type === "other" ? "" : repairData.repair_type,
  //     time_added: new Date().toISOString(),
  //     time_updated: new Date().toISOString(),
  //   };
  
  //   setIsLoading(true); // Show loading state
  
  //   try {
  //     await axios.post("http://localhost:8000/api/repairs/", formattedData, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  
  //     Swal.fire({
  //       icon: "success",
  //       title: "Success!",
  //       text: "Repair added successfully.",
  //       confirmButtonColor: "#22c55e",
  //     });
  
  //     setRepairData({
  //       machine: "",
  //       repair_type: "",
  //       custom_repair_type: "",
  //       price: "",
  //       description: "This is a machine",
  //       time_added: "",
  //       time_updated: "",
  //     });
  
  //     onRepairAdded();
  
  //     // Add slight delay before closing modal
  //     setTimeout(() => {
  //       setIsLoading(false); // Hide loading after a delay
  //       onClose(); 
  //     }, 500);
  //   } catch (error) {
  //     console.error("Error adding repair", error);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Oops...",
  //       text: "Something went wrong! Please try again.",
  //       confirmButtonColor: "#ef4444",
  //     });
  //   } finally {
  //     setTimeout(() => setIsLoading(false), 500); // Ensure loading stops
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user) return;
    const token = user.access;
  
    const formattedData = {
      ...repairData,
      repair_type: repairData.repair_type === "other" ? "" : repairData.repair_type,
      time_added: new Date().toISOString(),
      time_updated: new Date().toISOString(),
    };
  
    setIsLoading(true); // Show loading state
  
    // Show processing Swal before request
    Swal.fire({
      title: "Processing...",
      html: `
          <div class="custom-loading">
              <div class="spinner">
                  <img src="/small_logo1.png" alt="Loading" />
              </div>
              <p>Please hold on while your request is being processed.</p>
          </div>
      `,
      showConfirmButton: false, // Hide confirm button during loading
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    try {
      await axios.post("https://agronomy-dept-llgc.teemah.com.ng/api/repairs/", formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Repair added successfully.",
        confirmButtonColor: "#22c55e",
      });
  
      setRepairData({
        machine: "",
        repair_type: "",
        custom_repair_type: "",
        price: "",
        description: "This is a machine",
        time_added: "",
        time_updated: "",
      });
  
      onRepairAdded();
  
      // Add slight delay before closing modal
      setTimeout(() => {
        setIsLoading(false); // Hide loading after a delay
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error adding repair", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong! Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setTimeout(() => setIsLoading(false), 500); // Ensure loading stops
    }
  };
  
  


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/3 z-50">
        <h2 className="text-2xl mb-4">Add Repair</h2>
        <form onSubmit={handleSubmit}>
          {/* Machine Selection */}
          <label className="block">Machine</label>
          <select name="machine" value={repairData.machine} onChange={handleInputChange} className="w-full p-2 border rounded">
            <option value="">Select Machine</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Repair Type Selection */}
          <label className="block mt-2">Repair Type</label>
          <select 
            name="repair_type" 
            value={repairData.repair_type} 
            onChange={handleInputChange} 
            className="w-full p-2 border rounded"
          >
            <option value="">Select Repair Type</option>
            {repairTypes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
            <option value="other">Other</option>
          </select>

          {/* Show input field if "Other" is selected */}
          {repairData.repair_type === "other" && (
            <input 
              type="text" 
              name="custom_repair_type" 
              placeholder="Enter custom repair type" 
              value={repairData.custom_repair_type} 
              onChange={handleInputChange} 
              className="w-full p-2 border rounded mt-2"
              required 
            />
          )}

          {/* Price Field */}
          <label className="block mt-2">Price (₦)</label>
          <input 
            type="number" 
            name="price" 
            value={repairData.price} 
            onChange={handleInputChange} 
            className="w-full p-2 border rounded" 
            required 
          />

          {/* Description Field */}
          <label className="block mt-2">Description</label>
          <textarea 
            name="description" 
            value={repairData.description} 
            onChange={handleInputChange} 
            className="w-full p-2 border rounded"
          ></textarea>

          {/* Buttons */}
          <div className="flex justify-end mt-4">
            <button type="button" onClick={onClose} className="p-2 bg-gray-500 text-white rounded mr-2">Cancel</button>
            <button type="submit" className="p-2 bg-green-500 text-white rounded">Add Repair</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairModal;
