import React, { useState } from "react";
import Button from './ui/Button'; // Make sure to import your Button component
import { monitoringApi } from "@/lib/monitoring-api";

interface SettingsReferenceModalProps {
  onClose: () => void;
  data: {
    id: string;
    module: string;
    key: string;
    type: string;
    value: string;
    description: string;
  }[];
}

const SettingsReferenceModal: React.FC<SettingsReferenceModalProps> = ({ data, onClose }) => {
  const [editableData, setEditableData] = useState(data); // Editable state for table rows
  const [editIndex, setEditIndex] = useState<number | null>(null); // Track the index of the row being edited
  const [loading, setLoading] = useState(false);
  const [oldValues, setOldValues] = useState<{ [key: string]: string }>({}); // To track old values

  // Handle edit button click
  const handleEdit = (index: number) => {
    setEditIndex(index); // Set the row to be editable

    // Save the old value when the user starts editing
    setOldValues((prevOldValues) => ({
      ...prevOldValues,
      [index]: editableData[index].value, // Store the old value for the current index
    }));
  };

  // Handle save button click
  const handleSave = async (index: number, id: string, newValue: string) => {
    const oldValue = oldValues[index]; // Get the old value from the state
    setLoading(true); // Set loading to true before starting the API call

    try {
      const response = await monitoringApi.updateSettingsReference(id, newValue);
      
      // Check if response is valid
      if (!response) {
        throw new Error('Алдаа гарлаа'); // Handle API failure
      }

      alert("Амжилттай");

      // If successful, update the row with the new value
      const updatedData = [...editableData];
      updatedData[index].value = newValue; // Update the row value
      setEditableData(updatedData); // Update the state
      setEditIndex(null); // Stop editing
    } catch (error) {
      // Revert to old value in case of failure
      const updatedData = [...editableData];
      updatedData[index].value = oldValue; // Restore the old value
      setEditableData(updatedData); // Update the state with old value
      setEditIndex(null); // Stop editing
      alert("Та засах эрхгүй байна"); // Show error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle value change in the input field for editing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedData = [...editableData];
    updatedData[index].value = e.target.value; // Update the value of the edited row
    setEditableData(updatedData); // Update state with new data
  };

  return (
    <div className="fixed inset-0 bg-gray bg-opacity-50 flex justify-center items-start z-50 pt-20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative overflow-y-auto max-h-[80vh]">
        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          X
        </Button>

        <h2 className="text-2xl font-bold mb-4">Тохиргоо</h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4">Module</th>
                <th className="py-2 px-4">Key</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Value</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editableData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4">{row.module}</td>
                  <td className="py-2 px-4">{row.key}</td>
                  <td className="py-2 px-4">{row.type}</td>
                  <td className="py-2 px-4">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleChange(e, index)}
                        className="border px-2 py-1 rounded-md items-center"
                      />
                    ) : (
                      row.value
                    )}
                  </td>
                  <td className="py-2 px-4">{row.description}</td>
                  <td className="py-2 px-4">
                    {editIndex === index ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-500"
                        onClick={() =>
                          handleSave(index, row.id, row.value) // Pass the current value to save
                        }
                      >
                        Хадгалах
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-500"
                        onClick={() => handleEdit(index)} // Enable editing
                      >
                        Засах
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsReferenceModal;