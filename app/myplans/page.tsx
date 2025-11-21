"use client";
import React, { useEffect, useState } from "react";

export default function EsimListPage() {
  const [esims, setEsims] = useState<any[]>([]);
  const [filteredEsims, setFilteredEsims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  interface EsimPackage {
    packageCode: string;
    slug: string;
    name: string;
    price: number;
    currencyCode: string;
    volume: number;
    smsStatus: number;
    dataType: number;
    unusedValidTime: number;
    duration: number;
    durationUnit: string;
    location: string;
    locationCode: string;
    description: string;
    activeType: number;
    favorite: boolean;
    retailPrice: number;
    speed: string;
    ipExport: string;
    supportTopUpType: number;
    fupPolicy: string;
    locationNetworkList: {
      locationName: string;
      locationLogo: string;
      locationCode: string;
      operatorList: { operatorName: string; networkType: string }[];
    }[];
}

  const [selectedPlan, setSelectedPlan] = useState<EsimPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cart
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    name: "",
    region: "",
    duration: "",
    dataValue: "",
    dataType: "",
  });

  // Fetch packages
  useEffect(() => {
    const fetchEsims = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/inquiry/packages");
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        setEsims(data);
        setFilteredEsims(data);
        setTotalItems(data.length);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEsims();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDataTypeAndValue = (volume: number) => {
    if (volume >= 1000000000)
      return { dataType: "GB", dataValue: Math.round(volume / 1000000000) };
    return { dataType: "MB", dataValue: Math.round(volume / 1000000 / 100) * 100 };
  };

  useEffect(() => {
    let data = [...esims];

    if (filters.name)
      data = data.filter((i) => i.name.toLowerCase().includes(filters.name.toLowerCase()));

    if (filters.region)
      data = data.filter((i) =>
        i.locationNetworkList[0]?.locationName.toLowerCase().includes(filters.region.toLowerCase())
      );

    if (filters.duration)
      data = data.filter((i) => i.duration.toString().includes(filters.duration));

    if (filters.dataValue) {
      data = data.filter((i) => {
        const { dataType, dataValue } = calculateDataTypeAndValue(i.volume);
        const typeMatches = !filters.dataType || filters.dataType === dataType;
        const valueMatches = Number(filters.dataValue) === dataValue;
        return typeMatches && valueMatches;
      });
    }

    setFilteredEsims(data);
    setTotalItems(data.length);
    setTotalPages(Math.ceil(data.length / itemsPerPage));
  }, [filters, esims, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEsims.slice(startIndex, startIndex + itemsPerPage);

  const formatVolume = (volume:any) => {
    if (volume >= 1000000000) return `${Math.round(volume / 1000000000)} GB`;
    return `${Math.round(volume / 1000000 / 100) * 100} MB`;
  };

  // Add to cart
  const addToCart = (item: any) => {
    const exists = cart.find((c) => c.packageCode === item.packageCode);
    if (exists) return;
    setCart([...cart, { ...item, qty: 1 }]);
  };

  const removeFromCart = (code: string) => {
    setCart(cart.filter((c) => c.packageCode !== code));
  };

  const updateQty = (code: string, qty: number) => {
    setCart(
      cart.map((c) => (c.packageCode === code ? { ...c, qty: Number(qty) } : c))
    );
  };

  // Open modal for a row
  const openModal = (item: any) => {
    setSelectedPlan(item);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  // Checkout
  const checkout = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });

      const data = await res.json();
      if (!res.ok) alert(`Order failed: ${data.message}`);
      else alert("Order successful!");
    } catch (error) {
      alert("Checkout error");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-md shadow w-[70%] mx-auto">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          placeholder="Search Name"
          className="px-3 py-2 border rounded-md"
        />
        <input
          name="region"
          value={filters.region}
          onChange={handleFilterChange}
          placeholder="Search Region"
          className="px-3 py-2 border rounded-md"
        />
        <input
          name="duration"
          value={filters.duration}
          onChange={handleFilterChange}
          placeholder="Duration"
          className="px-3 py-2 border rounded-md"
        />
        <input
          name="dataValue"
          value={filters.dataValue}
          onChange={handleFilterChange}
          placeholder="Data Value"
          type="number"
          className="px-3 py-2 border rounded-md"
        />
        <select name="dataType" value={filters.dataType} onChange={handleFilterChange} className="px-3 py-2 border rounded-md">
          <option value="">Select Type</option>
          <option value="GB">GB</option>
          <option value="MB">MB</option>
        </select>
        <button
          onClick={() => setFilters({ name: "", region: "", duration: "", dataValue: "", dataType: "" })}
          className="px-4 py-2 bg-gray-300 rounded-md"
        >
          Reset
        </button>
      </div>
      {/* Cart button */}
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setIsCartOpen(true)}
        >
          Check Out ({cart.length})
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-gray-700 text-sm border-b">
            <th className="py-2 text-left">Name</th>
            <th className="py-2 text-left">Price(MNT)</th>
            <th className="py-2 text-left">Price</th>
            <th className="py-2 text-left">Data</th>
            <th className="py-2 text-left">Duration</th>
            <th className="py-2 text-left">Region</th>
            <th className="py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.packageCode} className="border-b">
              <td className="text-blue-600 cursor-pointer" onClick={() => { setSelectedPlan(item); setIsModalOpen(true); }}>
                {item.name}
              </td>
              <td>{item.buyPrice}</td>
              <td>${(item.price / 10000).toFixed(2)}</td>
              <td>{formatVolume(item.volume)}</td>
              <td>{item.duration} {item.durationUnit}</td>
              <td>{item.locationNetworkList[0]?.locationName}</td>
              <td>
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded-md"
                  onClick={() => addToCart(item)}
                >
                  Add to cart
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>Showing {startIndex + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</div>
        <div className="flex gap-3">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md">Previous</button>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded-md">Next</button>
        </div>
      </div>

      {/* Items per page */}
      <div className="mt-4">
        <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} className="px-3 py-2 border rounded-md">
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-1/2 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Cart details</h2>

            {cart.length === 0 && <div>Your cart is empty.</div>}

            {cart.length > 0 && (
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Name</th>
                    <th className="py-2 text-left">Qty</th>
                    <th className="py-2 text-left">Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.packageCode} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateQty(item.packageCode, Number(e.target.value))}
                          className="border px-2 w-16"
                        />
                      </td>
                      <td>${((item.price / 10000) * item.qty).toFixed(2)}</td>
                      <td>
                        <button className="text-red-500" onClick={() => removeFromCart(item.packageCode)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsCartOpen(false)}>Close</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={checkout}>Check out</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan details modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-1/2">
            <h2 className="text-xl font-bold mb-4">{selectedPlan.name}</h2>
            <div>Code: {selectedPlan.packageCode}</div>
            <div>Price: ${(selectedPlan.price / 10000).toFixed(2)}</div>
            <div>Duration: {selectedPlan.duration} {selectedPlan.durationUnit}</div>
            <div>Data: {formatVolume(selectedPlan.volume)}</div>
            <div>Region: {selectedPlan.locationNetworkList[0]?.locationName}</div>

            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
