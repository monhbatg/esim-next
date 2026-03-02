"use client";

import { useState, useEffect } from "react";
import { operatorApi } from "@/lib/operator-api";

interface InvoiceItem {
  invoice_id: string;
  invoice_amount: number;
  invoice_qpayInvoiceId: string;
  invoice_status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  customer_email: string;
  customer_phoneNumber: string;
  invoice_createdAt: string;
  package_name: string;
}

interface InvoiceResponse {
  success: boolean;
  data: InvoiceItem[];
}

const Operator: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceResponse>({
    success: false,
    data: [],
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await operatorApi.getInvoices();
      setInvoiceData(response);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalItems = invoiceData.data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentItems = invoiceData.data.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleView = (invoice: InvoiceItem) => {
    console.log("View invoice:", invoice);
    // You can add modal or router push here
  };

  const handleCancel = (invoiceId: string) => {
    console.log("Cancel invoice:", invoiceId);
    // Call cancel API here
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold tracking-wide";

    switch (status) {
      case "PAID":
        return (
          <span className={`${base} bg-emerald-100 text-emerald-700`}>
            PAID
          </span>
        );
      case "PENDING":
        return (
          <span className={`${base} bg-amber-100 text-amber-700`}>
            PENDING
          </span>
        );
      case "FAILED":
        return (
          <span className={`${base} bg-red-100 text-red-600`}>
            FAILED
          </span>
        );
      case "CANCELLED":
        return (
          <span className={`${base} bg-slate-200 text-slate-600`}>
            CANCELLED
          </span>
        );
      default:
        return <span className={base}>{status}</span>;
    }
  };

  return (
    <div className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Нийт Нэхэмжлэхүүд
            </h1>
            <p className="text-slate-500 mt-2">
              Хянах, засах, залруулах нэхэмжлэлүүдийн жагсаалт
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl">
            <table className="w-full text-sm text-slate-700">
              <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4 text-left">№</th>
                  <th className="py-4 px-4 text-left">Огноо</th>
                  <th className="py-4 px-4 text-left">Нэр</th>
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
                      <td className="py-4 px-4">
                        {startIndex + index + 1}
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-slate-600">
                        {new Date(invoiceItem.invoice_createdAt)
                          .toISOString()
                          .slice(0, 19)
                          .replace("T", " ")}
                      </td>

                      <td className="py-4 px-4 font-semibold">
                        {invoiceItem.package_name}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <StatusBadge
                          status={invoiceItem.invoice_status}
                        />
                      </td>

                      <td className="py-4 px-4 text-center">
                        {invoiceItem.customer_phoneNumber}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {invoiceItem.customer_email}
                      </td>

                      <td className="py-4 px-4 text-right font-semibold text-emerald-600">
                        {invoiceItem.invoice_amount.toLocaleString()}₮
                      </td>

                      <td className="py-4 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleView(invoiceItem)}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-500 transition"
                        >
                          Cancel
                        </button>

                        
                        {invoiceItem.invoice_status === "PENDING" && (
                          <button
                            onClick={() =>
                              handleCancel(invoiceItem.invoice_id)
                            }
                            className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs hover:bg-green-500 transition"
                          >
                            Check
                          </button>
                        )}
                        
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
            <div className="text-slate-500 text-sm">
              Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
              {totalItems}
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
                disabled={
                  currentPage === totalPages || totalPages === 0
                }
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-30"
              >
                Next
              </button>
            </div>

            <select
              value={itemsPerPage}
              onChange={(e) =>
                handleItemsPerPageChange(Number(e.target.value))
              }
              className="px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operator;