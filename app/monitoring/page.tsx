"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { monitoringApi } from "@/lib/monitoring-api";
import SettingsReferenceModal from "@/components/SettingsReferenceModal";
import SalaryModal from "@/components/SalaryModal";

// Type definitions for data
interface DashboardData {
  totalOrders: { amount: number; count: number };
  baseOrders: { amount: number; count: number };
  topUpOrders: { amount: number; count: number };
  rangedTranPriecUSD: number;
  rangedTranPriceMNT: number;
  rangedTranWithTax: number;
  rangedTranWithoutTax: number;
  rangedTranPureAmount: number;
}

interface Transaction {
  itemCounter: number;
  transactionDate: string;
  packageName: string;
  transactionType: string;
  customerPhone: string;
  customerMail: string;
  supplyAmount: number;
  supplyAmountMNT: number;
  buyAmountWithTax: number;
  buyAmountWithoutTax: number;
  pureAmount: number;
}

interface SalaryPreData {
  rangedTranPriecUSD: number;
  rangedTranPriceMNT: number;
  rangedTranWithTax: number;
  rangedTranWithoutTax: number;
  rangedTranPureAmount: number;
  startDate: string;
  endDate: string;
}

interface SettingsReferenceData {
    id: string;
    module: string;
    key: string;
    type: string;
    value: string;
    description: string;
}

const Monitoring: React.FC = () => {
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState<string>("Today");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOrders: { amount: 0, count: 0 },
    baseOrders: { amount: 0, count: 0 },
    topUpOrders: { amount: 0, count: 0 },
    rangedTranPriecUSD: 0,
    rangedTranPriceMNT: 0,
    rangedTranWithTax: 0,
    rangedTranWithoutTax: 0,
    rangedTranPureAmount: 0
  });
  const [settingsReference, setSettingsReferenceData] = useState<SettingsReferenceData[]>([
  {
    id: "",
    module: "",
    key: "",
    type: "",
    value: "",
    description: ""
  }
]);
  const [SalaryPreData, setSalaryPreData] = useState<SalaryPreData>({
    rangedTranPriecUSD: 0,
    rangedTranPriceMNT: 0,
    rangedTranWithTax: 0,
    rangedTranWithoutTax: 0,
    rangedTranPureAmount: 0,
    startDate: "",
    endDate: ""
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredEsims, setFilteredEsims] = useState<any[]>([]);
  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false)

  // Fetch backend data
  const fetchDashboardData = async (timePeriod: string) => {
    setLoading(true);
    try {
      const response = await monitoringApi.getMonitoring(timePeriod);
      setDashboardData(response);
      setTransactions(response.rangedTransactions);
      setTotalItems(response.rangedTransactionCount);
      setTotalPages(Math.ceil(response.rangedTransactionCount / itemsPerPage));
      setFilteredEsims(response.rangedTransactions);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreData = async () => {
    setLoading(true);
    try {
      const response = await monitoringApi.getSalaryPre();
      setSalaryPreData(response);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timePeriod);
  }, [timePeriod, currentPage, itemsPerPage]);

  // Get today's date
  const today = new Date();
  const currentDay = today.getDate();

  // Disable button unless today is the 5th or 20th
  const isButtonEnabled = currentDay === 5 || currentDay === 20;

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEsims.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          {/* Time Filter */}
          <div className="flex items-center mb-8">
            <label className="mr-4 text-lg font-medium">Хайх хугацаа</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="p-2 rounded-md border border-gray-300 shadow-sm"
            >
              <option value="today">Өнөөдөр</option>
              <option value="yesterday">Өчигдөр</option>
              <option value="last_week">Сүүлийн 1 долоо хоног</option>
              <option value="last_two_week">Сүүлийн 2 долоо хоног</option>
              <option value="last_month">Сүүлийн 1 сар</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <Card className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">Нийт захиалга</div>
                <div className="text-lg font-medium">Дүн</div>
              </div>
              <div className="flex justify-between">
                <div className="text-3xl font-extrabold">{dashboardData.totalOrders.count}</div>
                <div className="text-3xl font-extrabold">{dashboardData.totalOrders.amount}₮</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">Шинэ захиалга</div>
                <div className="text-lg font-medium">Дүн</div>
              </div>
              <div className="flex justify-between">
                <div className="text-3xl font-extrabold">{dashboardData.baseOrders.count}</div>
                <div className="text-3xl font-extrabold">{dashboardData.baseOrders.amount}₮</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">Цэнэглэлт</div>
                <div className="text-lg font-medium">Дүн</div>
              </div>
              <div className="flex justify-between">
                <div className="text-3xl font-extrabold">{dashboardData.topUpOrders.count}</div>
                <div className="text-3xl font-extrabold">{dashboardData.topUpOrders.amount}₮</div>
              </div>
            </Card>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="p-6 w-full table-auto border-collapse border border-gray-300 bg-white shadow-sm rounded-lg">
              <thead className="bg-gradient-to-r from-gray-300 text-gray-700">
                <tr>
                  <th colSpan={6}></th>
                  <th className="py-2 text-left"><div>${dashboardData.rangedTranPriecUSD}</div></th>
                  <th className="py-2 text-left"><div>{dashboardData.rangedTranPriceMNT}₮</div></th>
                  <th className="py-2 text-left"><div className="text-yellow-500">{dashboardData.rangedTranWithTax}₮</div></th>
                  <th className="py-2 text-left"><div className="text-green-500">{dashboardData.rangedTranWithoutTax}₮</div></th>
                  <th className="py-2 text-left"><div className="text-green-500">{dashboardData.rangedTranPureAmount}₮</div></th>
                </tr>
                <tr>
                  <th className="py-2 px-3">№</th>
                  <th>Огноо</th>
                  <th>Багцын нэр</th>
                  <th>Гүйлгээний төрөл</th>
                  <th>Утас</th>
                  <th>И-мэйл</th>
                  <th>Авсан үнэ</th>
                  <th>Хөрвөсөн дүн</th>
                  <th>Зарсан үнэ</th>
                  <th>Суутгалгүй дүн</th>
                  <th>Цэвэр дүн</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 text-center">{transaction.transactionDate}</td>
                    <td className="py-2 text-center">{transaction.packageName}</td>
                    <td className="py-2 text-center">{transaction.transactionType}</td>
                    <td className="py-2 text-center">{transaction.customerPhone}</td>
                    <td className="py-2 text-center">{transaction.customerMail}</td>
                    <td className="py-2 text-center">${transaction.supplyAmount}</td>
                    <td className="py-2 text-center">{transaction.supplyAmountMNT}₮</td>
                    <td className="py-2 text-center">{transaction.buyAmountWithTax}₮</td>
                    <td className="py-2 text-center">{transaction.buyAmountWithoutTax}₮</td>
                    <td className="py-2 text-center">{transaction.pureAmount}₮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div>Showing {startIndex + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</div>
            <div className="flex gap-3">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md">Previous</button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded-md">Next</button>
            </div>
            <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} className="px-3 py-2 border rounded-md">
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={async () => {
                setLoading(true);
                try {
                  const response = await monitoringApi.getSettingsReference();
                  setSettingsReferenceData(response); // store fetched pre-data
                  setIsModalOpen(true);        // open modal after data is fetched
                } catch (error) {
                  console.error("Error fetching salary pre-data", error);
                } finally {
                  setLoading(false);
                }
              }}
          >
            Тохиргоо
          </Button>

          {/* Modal */}
          {isModalOpen && (
            <SettingsReferenceModal
              data={settingsReference}
              onClose={closeModal} // Function to close the modal
            />
          )}


          {/* Salary Button opens popup */}
          <div>
            <div>
              <b>Санамж:</b> Зөвхөн 5, 20 -ний өдөр дарах боломжтой
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setLoading(true);
                try {
                  const response = await monitoringApi.getSalaryPre();
                  setSalaryPreData(response); // store fetched pre-data
                  setSalaryOpen(true);        // open modal after data is fetched
                } catch (error) {
                  console.error("Error fetching salary pre-data", error);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={!isButtonEnabled} // Disable the button if not the 5th or 20th
            >
              Ашгийн тооцоолол
            </Button>
          </div>
            
          {/* Salary Modal */}
          {salaryOpen && (
            <SalaryModal
              SalaryPreData={SalaryPreData} // pass the fetched data
              onClose={() => setSalaryOpen(false)}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Monitoring;