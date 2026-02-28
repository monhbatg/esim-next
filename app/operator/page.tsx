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

  // Fetch invoices
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

  // Pagination logic
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

  return (
    <div className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300 bg-white shadow-sm rounded-lg">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-2 px-3">№</th>
                  <th>Огноо</th>
                  <th>Нэр</th>
                  <th>Төлөв</th>
                  <th>Утас</th>
                  <th>И-мэйл</th>
                  <th>Дүн</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((invoiceItem, index) => (
                    <tr key={invoiceItem.invoice_id} className="hover:bg-gray-100">
                      <td className="py-2 px-3">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-2 text-center">
                        {new Date(invoiceItem.invoice_createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        {invoiceItem.package_name}
                      </td>
                      <td className="py-2 text-center">
                        {invoiceItem.invoice_status}
                      </td>
                      <td className="py-2 text-center">
                        {invoiceItem.customer_phoneNumber}
                      </td>
                      <td className="py-2 text-center">
                        {invoiceItem.customer_email}
                      </td>
                      <td className="py-2 text-center">
                        {invoiceItem.invoice_amount.toLocaleString()}₮
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
              {totalItems}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <select
              value={itemsPerPage}
              onChange={(e) =>
                handleItemsPerPageChange(Number(e.target.value))
              }
              className="px-3 py-2 border rounded-md"
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