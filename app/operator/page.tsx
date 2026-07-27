"use client";

import { useState, useEffect } from "react";
import { operatorApi } from "@/lib/operator-api";
import { PackageLocationNetwork } from "@/types";

interface InvoiceItem {
  invoice_id: string;
  invoice_amount: number;
  invoice_qpayInvoiceId: string;
  invoice_status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  customer_email: string;
  customer_phoneNumber: string;
  invoice_createdAt: string;
  package_name: string;
  invoice_iccId: string;
}

export interface EsimPackage {
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
  description: string;
  buyPrice: number;
  activeType: number;
  favorite: boolean;
  retailPrice: number;
  speed?: string;
  locationNetworkList?: PackageLocationNetwork[];
}

interface InvoiceResponse {
  success: boolean;
  data: InvoiceItem[];
}

interface PackageResponse {
  invoice_id: string;
  internalInvoiceId: string;
  qr_image: string;
}

const Operator: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceResponse>({
    success: false,
    data: [],
  });
  const [packagesData, setPackages] = useState<EsimPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [newOrderData, setNewOrderData] = useState({
    description: "",
    packageCode: "",
    email: "",
    phoneNumber: "",
    amount: 0,
  });

  // New states for package selection
  const [selectedPackageCode, setSelectedPackageCode] = useState<string | null>(null);
  const [showPackageList, setShowPackageList] = useState<boolean>(false);
  const [checkingId, setCheckingId] = useState<string | null>(null); // ✅ loading per row

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const packages = await operatorApi.getPackages();
      setPackages(packages);
      const response = await operatorApi.getInvoices();
      setInvoiceData(response);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const [creating, setCreating] = useState(false);
  const [qrData, setQrData] = useState<PackageResponse | null>(null);

  const handleCreateQPay = async () => {
    try {
      setCreating(true);
      const response = await operatorApi.getPurchaseOrders(newOrderData);
      setQrData(response);
    } catch (error) {
      console.error("QPay error:", error);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalItems = invoiceData.data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = invoiceData.data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const [popup, setPopup] = useState<{
  show: boolean;
  message: string;
  type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showPopup = (message: string, type: "success" | "error") => {
  setPopup({ show: true, message, type });

  setTimeout(() => {
    setPopup({ show: false, message: "", type: "success" });
  }, 2500);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold tracking-wide";
    switch (status) {
      case "PAID":
        return <span className={`${base} bg-emerald-100 text-emerald-700`}>PAID</span>;
      case "PENDING":
        return <span className={`${base} bg-amber-100 text-amber-700`}>PENDING</span>;
      case "FAILED":
        return <span className={`${base} bg-red-100 text-red-600`}>FAILED</span>;
      case "CANCELLED":
        return <span className={`${base} bg-slate-200 text-slate-600`}>CANCELLED</span>;
      default:
        return <span className={base}>{status}</span>;
    }
  };

  const handleNewOrderSave = () => {
    console.log("New Order Data:", newOrderData);
    setShowNewOrderModal(false);
    setNewOrderData({ description: "", packageCode: "", email: "", phoneNumber: "", amount: 0 });
    setSelectedPackageCode(null);
  };

  return (
    <div className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Нийт Нэхэмжлэхүүд</h1>
              <p className="text-slate-500 mt-2">Хянах, засах, залруулах нэхэмжлэлүүдийн жагсаалт</p>
            </div>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl shadow-lg hover:opacity-90 transition"
            >
              Шинэ Захиалга
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl">
            <div className="overflow-x-auto">

              {/* ✅ POPUP UI (IMPORTANT - MUST BE HERE) */}
              {popup.show && (
                <div
                  className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white z-50 transition
                    ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}
                  `}
                >
                  {popup.message}
                </div>
              )}

              <table className="w-full text-sm text-slate-700">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-4 text-left">№</th>
                    <th className="py-4 px-4 text-left">Огноо</th>
                    <th className="py-4 px-4 text-left">Нэр</th>
                    <th className="py-4 px-4 text-center">Төрөл</th>
                    <th className="py-4 px-4 text-center">Төлөв</th>
                    <th className="py-4 px-4 text-center">Утас</th>
                    <th className="py-4 px-4 text-center">И-мэйл</th>
                    <th className="py-4 px-4 text-right">Дүн</th>
                    <th className="py-4 px-4 text-center">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        Loading...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((invoiceItem, index) => (
                      <tr
                        key={invoiceItem.invoice_id}
                        className="hover:bg-slate-50 transition-all duration-200"
                      >
                        <td className="py-4 px-4">{startIndex + index + 1}</td>
                        <td className="py-4 px-4 font-mono text-xs text-slate-600">
                          {new Date(invoiceItem.invoice_createdAt)
                            .toISOString()
                            .slice(0, 19)
                            .replace("T", " ")}
                        </td>
                        <td className="py-4 px-4 font-semibold">{invoiceItem.package_name}</td>
                        <td className="py-4 px-4 text-center">
                          {invoiceItem.invoice_iccId != null? 
                          <span className="bg-indigo-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                            Цэнэглэлт
                          </span>
                          : 
                          <span className="bg-indigo-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            Шинэ
                          </span>
                          }
                        </td>
                        <td className="py-4 px-4 text-center">
                          <StatusBadge status={invoiceItem.invoice_status} />
                        </td>
                        <td className="py-4 px-4 text-center">{invoiceItem.customer_phoneNumber}</td>
                        <td className="py-4 px-4 text-center">{invoiceItem.customer_email}</td>
                        <td className="py-4 px-4 text-right font-semibold text-emerald-600">
                          {invoiceItem.invoice_amount.toLocaleString()}₮
                        </td>
                        <td className="p-3 text-center">
                          {invoiceItem.invoice_status === "PENDING" && (
                            <button
                              disabled={checkingId === invoiceItem.invoice_id}
                              onClick={async () => {
                                try {
                                  setCheckingId(invoiceItem.invoice_id);
                                
                                  const res = await operatorApi.checkPaymentStatus(
                                    invoiceItem.invoice_qpayInvoiceId
                                  );
                                
                                  if (res.count > 0) {
                                    showPopup("Амжилттай", "success");
                                    await fetchInvoices();
                                  } else {
                                    showPopup("Төлбөр төлөгдөөгүй байна", "error");
                                  }
                                } catch (error) {
                                  console.error(error);
                                  showPopup("Алдаа гарлаа", "error");
                                } finally {
                                  setCheckingId(null);
                                }
                              }}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                              {checkingId === invoiceItem.invoice_id
                                ? "Шалгаж байна..."
                                : "Төлбөр шалгах"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
            <div className="text-slate-500 text-sm">
              Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-30"
              >
                Previous
              </button>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-30"
              >
                Next
              </button>
            </div>

            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          {/* Modal */}
          {showNewOrderModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-green-600">Шинэ Захиалга</h2>

                {/* Package Search */}
                <input
                  type="text"
                  placeholder="Багц хайх"
                  className="w-full mb-3 p-2 border rounded"
                  value={newOrderData.description}
                  onFocus={() => setShowPackageList(true)}
                  onChange={(e) => {
                    setNewOrderData({
                      ...newOrderData,
                      description: e.target.value,
                    });
                    setSelectedPackageCode(null);
                    setShowPackageList(true);
                  }}
                />

                {/* Selected package info */}
                {newOrderData.packageCode && (
                  <div className="mb-3 text-sm text-gray-700">
                    <div>Багцын нэр: {newOrderData.description}</div>
                    <div>Багцын үнэ: {newOrderData.amount}₮  </div>
                    <div>Багцын код: ({newOrderData.packageCode})</div>
                  </div>
                  
                )}

                {/* Package Dropdown */}
                {showPackageList && (
                  <div className="max-h-32 overflow-y-auto border rounded mb-3">
                    {packagesData
                      .filter((pkg) =>
                        pkg.name.toLowerCase().includes(newOrderData.description.toLowerCase())
                      )
                      .map((pkg) => {
                        const isSelected = selectedPackageCode === pkg.packageCode;
                        return (
                          <div
                            key={pkg.packageCode}
                            className={`p-2 cursor-pointer transition ${
                              isSelected
                                ? "bg-indigo-100 border-l-4 border-indigo-500"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              setNewOrderData({
                                ...newOrderData,
                                packageCode: pkg.packageCode,
                                amount: Number(pkg.buyPrice),
                                description: pkg.name,
                              });
                              setSelectedPackageCode(pkg.packageCode);
                              setShowPackageList(false);
                            }}
                          >
                            <div className="font-medium">{pkg.name}</div>
                            <div className="text-xs text-gray-500">{pkg.buyPrice}₮</div>
                          </div>
                        );
                      })}
                  </div>
                )}

                <input
                  type="email"
                  placeholder="И-мэйл"
                  className="w-full mb-3 p-2 border rounded"
                  value={newOrderData.email}
                  onChange={(e) => setNewOrderData({ ...newOrderData, email: e.target.value })}
                />

                <input
                  type="text"
                  placeholder="Утас"
                  className="w-full mb-4 p-2 border rounded"
                  value={newOrderData.phoneNumber}
                  onChange={(e) =>
                    setNewOrderData({ ...newOrderData, phoneNumber: e.target.value })
                  }
                />

                {/* QPay Button */}
                <button
                  onClick={handleCreateQPay}
                  disabled={creating}
                  className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
                >
                  {creating ? "Үүсгэж байна..." : "QPay үүсгэх"}
                </button>

                {/* QR Code Display */}
                {qrData && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">Invoice: {qrData.invoice_id}</p>
                    <img
                      src={`data:image/png;base64,${qrData.qr_image}`}
                      alt="QPay QR"
                      className="mx-auto w-48 h-48 border rounded shadow"
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowNewOrderModal(false);
                  }}
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Төлбөр шалгах
                </button>

                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="mt-6 w-full bg-gray-200 py-2 rounded"
                >
                  Хаах
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Operator;