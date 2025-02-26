import React, { useState } from "react";
import axios from "axios";
import authService from "../services/authService";
import Swal from "sweetalert2";
import "./loading.css";

const AddMachineModal = ({ isOpen, onClose, onMachineAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("Machine is beautiful");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = authService.getCurrentUser();
    if (!user) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) formData.append("image", image);

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
      await axios.post("https://agronomy-dept-llgc.teemah.com.ng/api/machines/", formData, {
        headers: {
          Authorization: `Bearer ${user.access}`,
          "Content-Type": "multipart/form-data",
        },
      });

      

      setLoading(false);
      setName(""); // Clear form fields
      setDescription("Machine is beautiful");
      setImage(null);
      onClose();
      onMachineAdded(); // Refresh the list in Dashboard
    // ✅ Show SweetAlert success message
    Swal.fire({
      title: "Success!",
      text: "Machine added successfully.",
      icon: "success",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });

  } catch (err) {
    console.error("Error adding machine", err);
    setLoading(false);

    // ❌ Show SweetAlert error message
    Swal.fire({
      title: "Error!",
      text: "Failed to add machine. Please try again.",
      icon: "error",
      confirmButtonColor: "#d33",
      confirmButtonText: "OK",
    });
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 z-50">
        <h3 className="text-xl font-bold mb-4">Add New Machine</h3>
        <form onSubmit={handleAddMachine} className="space-y-4">
          <div>
            <label className="block font-medium">Machine Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Description</label>
            <textarea
              className="w-full p-2 border rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Upload Image</label>
            <input type="file" onChange={handleFileChange} />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Machine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMachineModal;
