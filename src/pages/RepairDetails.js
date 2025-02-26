import React, { useState, useEffect } from "react";
import axios from "axios";
import authService from "../services/authService";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import TopNavbar from "../components/TopNavbar"
import {Link} from "react-router-dom"
import { useLoading } from "../context/LoadingContext";
import "./print.css"

function RepairDetails() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const { setIsLoading } = useLoading();
   const [data, setData] = useState([]);

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
    fetchRepairs();
  }, [machineId, editingId]);

  const fetchRepairs = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;
      const token = user.access;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.get(
        `https://agronomy-dept-llgc.teemah.com.ng/api/repairs/?machine_id=${machineId}`,
        config
      );

      const sortedRepairs = response.data.sort(
        (a, b) => new Date(b.time_added) - new Date(a.time_added)
      );

      setRepairs(sortedRepairs);
    } catch (error) {
      console.error("Error fetching repairs", error);
    }
  };

  const handleEdit = (id, repair) => {
    
    Swal.fire({
      title: "Edit Price",
      text: "Only the price can be edited. Do you want to proceed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "No, Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setEditingId(id);
        setEditData({ price: repair.price });
      }
    });
  };
  

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;
      const token = user.access;
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      const originalRepair = repairs.find((repair) => repair.id === id);
      if (!originalRepair) return;
  
      const oldPrice = originalRepair.price;
      const newPrice = editData.price;
  
      // Confirm price change
      Swal.fire({
        title: "Confirm Price Change",
        html: `Your price has changed from <b>₦${oldPrice}</b> to <b>₦${newPrice}</b>. Do you want to proceed?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, Save",
        cancelButtonText: "No, Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setIsLoading(true); // Show loading before request starts
  
          const updatedRepair = {
            price: newPrice,
            updated_by: user.username,
            time_updated: new Date().toISOString(),
            time_added: originalRepair.time_added,
            machine: originalRepair.machine,
            repair_type: originalRepair.repair_type,
            custom_repair_type: originalRepair.custom_repair_type
          };

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
            await axios.put(`https://agronomy-dept-llgc.teemah.com.ng/api/repairs/${id}/`, updatedRepair, config);
  
            setRepairs((prevRepairs) =>
              prevRepairs.map((repair) =>
                repair.id === id ? { ...repair, ...updatedRepair } : repair
              )
            );
  
            Swal.fire("Updated!", "Price has been updated successfully.", "success");
            setEditingId(null);
          } catch (error) {
            console.error("Error updating repair", error);
            Swal.fire("Error!", "Failed to update the price.", "error");
          } finally {
            setIsLoading(false); // Hide loading after request completes
          }
        }
      });
    } catch (error) {
      console.error("Error updating repair", error);
    }
  };
  
  
  

  const handleDelete = async (id) => {
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
          const user = authService.getCurrentUser();
          if (!user) return;
          const token = user.access;
          const config = { headers: { Authorization: `Bearer ${token}` } };

          await axios.delete(`https://agronomy-dept-llgc.teemah.com.ng/api/repairs/${id}/`, config);
          fetchRepairs();

          Swal.fire("Deleted!", "The repair has been removed.", "success");
        } catch (error) {
          console.error("Error deleting repair", error);
          Swal.fire("Error", "Could not delete repair. Try again.", "error");
        }finally {
          setIsLoading(false); // Hide loading after request completes
        }
      }
    });
  };

  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    return new Date(dateString).toLocaleTimeString("en-US", options);
  };

  // **Filter by Selected Month**
  const filteredRepairs = selectedMonth
    ? repairs.filter((repair) => new Date(repair.time_added).toISOString().slice(0, 7) === selectedMonth)
    : repairs;

  // **Calculate Total Price**
  const totalPrice = filteredRepairs.reduce((sum, repair) => sum + parseFloat(repair.price), 0);

  return (
    <div className="container mx-auto p-4 max-w-screen-lg">
      <TopNavbar/>

      <div className="fixed top-16 left-0 w-full bg-green-100 shadow-md z-40 px-4 md:px-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
      <Link to="/dashboard" className="bg-green-500 p-2 rounded rounded-sm text-white mt-2">🔙Return to Dashboard</Link>
      {repairs.length > 0 && (
        <p className="text-xl md:text-2xl font-bold text- mt-0">Repair for Machine {repairs[0].machine_name}</p>
      )}
      
      {/* Select Month Filter */}
      <div className="my-0 md:my-4">
        <label className="font-bold">Filter by Month: </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <button onClick={() => window.print()} className="bg-green-500 text-white px-4 py-2 rounded my-0 md:my-4">
        🖨️ Print as PDF
      </button>
</div>
<div className="overflow-x-auto print-content">
   <table className="w-full border-collapse border border-gray-300 text-sm md:text-base mt-80 md:mt-44 min-w-max">
  <thead>
    <tr className="bg-gray-200">
      <th className="border p-2">S/N</th>
      <th className="border p-2">Repair Type</th>
      <th className="border p-2">Price (Naira)</th>
      <th className="border p-2">Added By</th>
      <th className="border p-2">Updated By</th>
      <th className="border p-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredRepairs.map((repair, index) => (
      <tr key={repair.id} className="hover:bg-gray-100">
        <td className="border p-2">{index + 1}</td>
        <td className="border p-2">{repair.repair_type_name || repair.custom_repair_type}</td>
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
            <button onClick={() => handleSave(repair.id)} className="bg-green-500 text-white px-3 py-1 rounded">
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
  </tbody>
</table>
</div>

      {/* Total Price Display */}
      <h3 className="text-xl font-bold mt-4">Total Price: ₦{totalPrice.toLocaleString()}</h3>

      <button onClick={() => navigate("/dashboard")} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">
        🔙 Back to Dashboard
      </button>
    </div>
  );
}

export default RepairDetails;
