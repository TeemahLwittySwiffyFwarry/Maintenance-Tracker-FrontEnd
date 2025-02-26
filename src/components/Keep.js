import React, { useState, useEffect } from "react";
import axios from "axios";
import authService from "../services/authService";
import Swal from "sweetalert2";

function ViewAllMachines() {
  const [machines, setMachines] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;
      const token = user.access;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch machines
      const machinesResponse = await axios.get("http://localhost:8000/api/machines/", config);

      // Fetch repairs (or any other required data)
      const repairsResponse = await axios.get("http://localhost:8000/api/repairs/", config);

      // Merge repairs into machines (if they are not already included)
      const machinesData = machinesResponse.data.map((machine) => ({
        ...machine,
        repairs: repairsResponse.data.filter((repair) => repair.machine === machine.id),
      }));

      setMachines(machinesData);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };


  const handleEdit = (repairId, repair) => {
    setEditingId(repairId);
    setEditData({
      ...repair, // Keep all fields intact
      price: repair.price, // Allow editing price
    });
  };


  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (repairId, machineId) => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;
      const token = user.access;
      const config = { headers: { Authorization: `Bearer ${token}` } };



      const machine = machines.find((m) => m.id === machineId);
      if (!machine) return;

      const repair = machine.repairs.find((r) => r.id === repairId);
      if (!repair) return;

      const oldPrice = repair.price;
      const newPrice = editData.price;

      Swal.fire({
        title: "Confirm Price Change",
        html: `Your price has changed from <b>₦${oldPrice}</b> to <b>₦${newPrice}</b>. Do you want to proceed?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, Save",
        cancelButtonText: "No, Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const updatedRepair = {
            price: newPrice,
            updated_by: user.username,
            time_updated: new Date().toISOString(),
            machine: repair.machine,
            repair_type: repair.repair_type,
            time_added: repair.time_added,
          };

          await axios.put(`http://localhost:8000/api/repairs/${repairId}/`, updatedRepair, config);

          fetchMachines();
          setEditingId(null);

          Swal.fire("Updated!", "Price has been updated successfully.", "success");
        }
      });
    } catch (error) {
      console.error("Error updating repair", error);
    }
  };

  const handleDelete = async (repairId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This repair will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const user = authService.getCurrentUser();
          if (!user) return;
          const token = user.access;
          const config = { headers: { Authorization: `Bearer ${token}` } };

          await axios.delete(`http://localhost:8000/api/repairs/${repairId}/`, config);
          fetchMachines();

          Swal.fire("Deleted!", "The repair has been removed.", "success");
        } catch (error) {
          console.error("Error deleting repair", error);
          Swal.fire("Error", "Could not delete repair. Try again.", "error");
        }
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  // **Filter by Selected Month**
  const getFilteredRepairs = (machine) => {
    const filteredRepairs = selectedMonth
      ? machine.repairs.filter(
          (repair) => new Date(repair.time_added).toISOString().slice(0, 7) === selectedMonth
        )
      : machine.repairs;
  
    // Calculate total price of filtered repairs
    const totalPrice = filteredRepairs.reduce((total, repair) => total + Number(repair.price || 0), 0);

  
    return { filteredRepairs, totalPrice }; // ✅ Return filtered repairs & total price
  };
  
      

  const getFilteredMachines = () => {
    return machines
      .map((machine) => {
        const { filteredRepairs, totalPrice } = getFilteredRepairs(machine); // ✅ Properly call getFilteredRepairs
  
        if (
          machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          filteredRepairs.length > 0
        ) {
          return { ...machine, repairs: filteredRepairs, totalPrice }; // ✅ Attach totalPrice
        }
        return null;
      })
      .filter(Boolean);
  };
  


  return (
    <div className="container mx-auto p-4">
      <div className="my-4">
        <label className="font-bold">Filter by Month: </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
  
      {/* Search Bar */}
      <div className="my-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Machine Name or Repair Type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
  
        <div className="flex justify-end">
          <button onClick={() => window.print()} className="bg-green-500 text-white px-4 py-2 rounded my-4">
            🖨️ Print as PDF
          </button>
        </div>
      </div>
  
      <h2 className="text-2xl font-bold text-center">All Machines and Repairs</h2>
  
      {getFilteredMachines().length === 0 ? (
        <p className="text-center text-gray-500">No matching machines found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="fixed">
            <tr className="bg-gray-200 text-left">
              <th className="border p-2">S/N</th>
              <th className="border p-2">Machine Name</th>
              <th className="border p-2">S/N (Repairs)</th>
              <th className="border p-2">Repair Type</th>
              <th className="border p-2">Price (Naira)</th>
              <th className="border p-2">Added By</th>
              <th className="border p-2">Updated By</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredMachines().map((machine, machineIndex) => {
              const { filteredRepairs, totalPrice } = getFilteredRepairs(machine);
  
              return (
                <React.Fragment key={machine.id}>
                  <tr className="bg-green-500">
                    <td className="border p-2 font-bold">{machineIndex + 1}</td>
                    <td className="border p-2 font-bold">{machine.name}</td>
                    <td colSpan="6" className="border p-2 font-bold">
                    Total: ₦{totalPrice ? totalPrice.toLocaleString() : "0"}
                    </td>
                  </tr>
                  {filteredRepairs.map((repair, repairIndex) => (
                    <tr key={repair.id}>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2">{repairIndex + 1}</td>
                      <td className="border p-2">{repair.repair_type_name || "Custom Repair"}</td>
                      <td className="border p-2">
                        {editingId === repair.id ? (
                          <input
                            name="price"
                            value={editData.price}
                            onChange={handleChange}
                            className="border rounded p-1 w-full md:w-auto"
                          />
                        ) : (
                          `₦${repair.price}`
                        )}
                      </td>
                      <td className="border p-2 text-xs md:text-base">
                        {repair.created_by} <br />
                        <span className="text-gray-500">{formatDate(repair.time_added)}</span>
                        <br />
                        <span className="text-gray-500">{formatTime(repair.time_added)}</span>
                      </td>
                      <td className="border p-2 text-xs md:text-base">
                        {repair.updated_by} <br />
                        <span className="text-gray-500">{formatDate(repair.time_updated)}</span>
                        <br />
                        <span className="text-gray-500">{formatTime(repair.time_updated)}</span>
                      </td>
                      <td className="border p-2 flex flex-col md:flex-row gap-2">
                        {editingId === repair.id ? (
                          <button onClick={() => handleSave(repair.id, machine.id)} className="bg-green-500 text-white px-3 py-1 rounded">
                            💾 Save
                          </button>
                        ) : (
                          <button onClick={() => handleEdit(repair.id, repair)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                            ✏️ Edit
                          </button>
                        )}
                        <button onClick={() => handleDelete(repair.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                          ❌ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

}

export default ViewAllMachines;
