import React, { useState, useEffect } from "react";
import axios from "axios";
import authService from "../services/authService";
import Swal from "sweetalert2";
import TopNavbar from "../components/TopNavbar"
import { useLoading } from "../context/LoadingContext";
import {Link} from "react-router-dom"
import "./print.css"

function ViewAllMachines() {
  const [machines, setMachines] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search
  const { setIsLoading } = useLoading();
  const [data, setData] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;
    const token = user.access;
  
    axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/user-profile/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      setUserRole(response.data.role);
    })
    .catch(error => console.error("Error fetching user role", error));
  }, []);

  useEffect(() => {
    console.log("User Role:", userRole);
  }, [userRole]);
  


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/user-profile/");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      const machinesResponse = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/machines/", config);

      // Fetch repairs (or any other required data)
      const repairsResponse = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/repairs/", config);

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
            await axios.put(`https://agronomy-dept-llgc.teemah.com.ng/api/repairs/${repairId}/`, updatedRepair, config);
  
            fetchMachines(); // Refresh data
            setEditingId(null);
  
            Swal.fire("Updated!", "Price has been updated successfully.", "success");
          } catch (error) {
            console.error("Error updating repair", error);
            Swal.fire("Error!", "Failed to update the price.", "error");
          } finally {
            setIsLoading(false); // Stop loading after request completes
          }
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

          await axios.delete(`https://agronomy-dept-llgc.teemah.com.ng/api/repairs/${repairId}/`, config);
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
    return machine.repairs.filter((repair) => {
      // Filter by selected month
      const matchesMonth =
        !selectedMonth || // If no month is selected, include all repairs
        new Date(repair.time_added).toISOString().slice(0, 7) === selectedMonth;
  
      // Filter by search term (machine name or repair type)
      const matchesSearchTerm =
        searchTerm.length === 0 ||
        repair.repair_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.name.toLowerCase().includes(searchTerm.toLowerCase());
  
      return matchesMonth && matchesSearchTerm;
    });
  };
  
  // Calculate total price correctly
  
  
      
  

  const getFilteredMachines = () => {
    return machines
      .map((machine) => {
        const filteredRepairs = getFilteredRepairs(machine); // Use the updated filtering logic
        return { ...machine, repairs: filteredRepairs };
      })
      .filter((machine) => machine.repairs.length > 0 || machine.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }; 
  
  // ✅ Updated total price calculation to only include filtered repairs
  const getTotalPrice = (machine) => {
    return (machine.repairs || []).reduce(
      (sum, repair) => sum + (parseFloat(repair.price) || 0), 
      0
    );
  };

  const getGrandTotal = () => {
    return getFilteredMachines().reduce((total, machine) => total + getTotalPrice(machine), 0);
  };
  
      
      


  return (
    <div className="container mx-auto p-4 print-header">
      <TopNavbar/>
      <div className="fixed top-16 left-0 w-full bg-green-100 shadow-md z-40 px-6 py-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
      <Link to="/dashboard" className="bg-green-500 p-2 rounded rounded-sm text-white"> 🔙Return to Dashboard</Link>
  {/* Filter by Month */}
  <div className="flex flex-col md:flex-row md:items-center gap-2">
    <label className="font-bold">Filter by Month: </label>
    <input
      type="month"
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
      className="border p-2 rounded w-full md:w-auto"
    />
  </div>

  {/* Search Bar */}
  <div className="w-full md:w-1/3">
    <input
      type="text"
      placeholder="Search by Machine Name or Repair Type"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border p-2 rounded w-full"
    />
  </div>

  {/* Print Button */}
  <div>
    <button onClick={() => window.print()} className="bg-green-500 text-white px-4 py-2 rounded">
      🖨️ Print as PDF
    </button>
  </div>

</div>


      <h2 className="text-xl md:text-2xl font-bold text-center mt-96 md:mt-36 rounded-lg mb-4">All Equipments and Repair Price Details</h2>

      {getFilteredMachines().length === 0 ? (
  <p className="text-center text-gray-500">No matching machines found.</p>
) : (
  <div className="overflow-x-auto print-content">
  <table className="w-full border-collapse border border-gray-300 rounded-lg min-w-max">
  <thead>
    <tr className="bg-gray-200 text-left text-sm md:text-base">
      <th className="border p-2">S/N</th>
      <th className="border p-2">Machine Name</th>
      <th className="border p-2"></th>
      <th className="border p-2"></th>
      <th className="border p-2"></th>
      <th className="border p-2"></th>
      <th className="border p-2"></th>
      {userRole !== "Admin Staff" && <th className="border p-2 actions-column">Actions</th>}
    </tr>
  </thead>
  <tbody>
  {getFilteredMachines().map((machine, machineIndex) => (
<React.Fragment key={machine.id}>
<tr className="bg-green-500">
<td className="border p-2 font-bold">{machineIndex + 1}</td>
<td className="border p-2 font-bold">{machine.name}</td>
<td className="border p-2 font-bold">S/N</td>
<td className="border p-2 font-bold">Parts</td>
<td className="border p-2 font-bold">Price(Naira)</td>
<td className="border p-2 font-bold">Added By</td>
<td className="border p-2 font-bold">Updated By</td>
{userRole !== "Admin Staff" &&<td className="border p-2 font-bold actions-column">Actions</td>}
{/* <td colSpan="6" className="border p-2 font-bold">
Total: ₦{machine.total_spent_all_time?.toLocaleString() || "N/A"}
</td> */}
</tr>
{getFilteredRepairs(machine).map((repair, repairIndex) => (
<tr key={repair.id}>
<td className="border p-2"></td>
<td className="border p-2"></td>
<td className="border p-2">{repairIndex + 1}</td>
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
{userRole !== "Admin Staff" && (
      <td className="border p-2 flex flex-col md:flex-row gap-2 actions-column">
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
    )}
  </tr>
))}
<tr className="">
<td className="border p-2 font-bold"></td>
<td className="border p-2 font-bold"></td>
<td className="border p-2 font-bold"></td>
<td className="border p-2 font-bold bg-green-500">Total</td>
<td colSpan="1" className="border p-2 font-bold bg-green-500">
₦ {getTotalPrice(machine).toLocaleString() || "N/A"}
</td>
<td className="border p-2 font-bold"></td>
<td className="border p-2 font-bold"></td>
{userRole !== "Admin Staff" && <td className="border p-2 font-bold">active</td>}     
</tr>
<tr><td className="text-white">hi</td></tr>
</React.Fragment>
))}
<tr className="bg-green-500">
    <td colSpan="4" className="border p-2 font-bold">Grand Total</td>
    <td colSpan="4" className="border p-2 font-bold">
      ₦{getGrandTotal().toLocaleString()}
    </td>
  </tr>

  </tbody>
</table>
</div>
      
     )}
    </div>
  );

}

export default ViewAllMachines;
