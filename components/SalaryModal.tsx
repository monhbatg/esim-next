// /components/SalaryModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import { monitoringApi } from "@/lib/monitoring-api";

interface SalaryModalProps {
  SalaryPreData: {
    rangedTranPriecUSD: number;
    rangedTranPriceMNT: number;
    rangedTranWithTax: number;
    rangedTranWithoutTax: number;
    rangedTranPureAmount: number;
    startDate: string;
    endDate: string;
  };
  onClose: () => void;
}

interface BackendResponse {
  totalFinalProfit: number;
  investmentTaxPercent: string;
  investmentTaxAmount: number;
  operatorsSalaryDetail: { operatorName: string; operatorSalary: number }[];
  totalOperatorSalary: number;
  developerSalaryDetail: { developer: string; salaryPercen: string; salary: number }[];
  totalDeveloperSalary: number;
  totalAdminSalary: number;
}

interface SalaryPreData {
  rangedTranPriecUSD: number;
  rangedTranPriceMNT: number;
  rangedTranWithTax: number;
  rangedTranWithoutTax: number;
  rangedTranPureAmount: number;
}

const SalaryModal: React.FC<SalaryModalProps> = ({SalaryPreData, onClose }) => {
  const [lossAmount, setLossAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [salaryResult, setSalaryResult] = useState<BackendResponse>();
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await monitoringApi.calculateSalaryFinal(SalaryPreData.rangedTranPureAmount,lossAmount,description);

      if (!res) throw new Error("Calculation failed");
      setSalaryResult(res);
    } catch (error) {
      console.error(error);
      alert("Error calculating salary");
    } finally {
      setLoading(false);
    }
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

        <h2 className="text-2xl font-bold mb-4">Ашгийн тооцоолол ({SalaryPreData.startDate} - {SalaryPreData.endDate})</h2>

        {/* Dashboard Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <p>Нийт худалдан авалт USD: ${SalaryPreData.rangedTranPriecUSD}</p>
          <p>Нийт худалдан авалт MNT: {SalaryPreData.rangedTranPriceMNT.toLocaleString()}₮</p>
          <p>Нийт орлого(QPay-н шимтгэлтэй дүн): {SalaryPreData.rangedTranWithTax.toLocaleString()}₮</p>
          <p>Нийт орлого(QPay-н шимтгэл татсан дүн): {SalaryPreData.rangedTranWithoutTax.toLocaleString()}₮</p>
          <p>Нийт ашиг: {SalaryPreData.rangedTranPureAmount.toLocaleString()}₮</p>
        </div>

        {/* Loss input */}
        <div className="flex items-center gap-3 mb-4">
          <p>Урсгал зардал:</p>
          <input
            type="text"
            className="border px-3 py-2 rounded-md w-32"
            placeholder="Тайлбар"
            value={description}
            onChange={(e) => setDescription((e.target.value))}
          />
          <input
            type="number"
            className="border px-3 py-2 rounded-md w-32"
            placeholder="Loss Amount"
            value={lossAmount}
            onChange={(e) => setLossAmount(Number(e.target.value))}
          />
          <Button onClick={handleCalculate} disabled={loading}>
            {loading ? "Тооцоолж байна..." : "Тооцоолох"}
          </Button>
        </div>

        {/* Salary result */}
        {salaryResult && (
          <div className="mt-6">
            <h3 className="text-2xl font-bold mb-4">Ашиг орлогын бодолт</h3>
            
            <div>Энэ удаагийн нийт ашиг: {salaryResult.totalFinalProfit.toLocaleString()}₮</div>
            <div>Хөрөнгө оруулалтын суутгалын хувь: {salaryResult.investmentTaxPercent}</div>
            <div>Хөрөнгө оруулалтын суутгалын дүн: ({salaryResult.investmentTaxAmount.toLocaleString()}₮)</div>
            
            {/* Operators */}
            {salaryResult.operatorsSalaryDetail.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold">Операторын нийт ашиг: {salaryResult.totalOperatorSalary.toLocaleString()}₮</h4>
                <table className="w-full table-auto border-collapse border border-gray-300 text-center">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-1 px-2">Операторын нэр</th>
                      <th>Хэмжээ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryResult.operatorsSalaryDetail.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td>{item.operatorName}</td>
                        <td>{item.operatorSalary.toLocaleString()}₮</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Developers */}
            {salaryResult.developerSalaryDetail.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold">Хөгжүүлэгчдийн нийт ашиг: {salaryResult.totalDeveloperSalary.toLocaleString()}₮</h4>
                <table className="w-full table-auto border-collapse border border-gray-300 text-center">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-1 px-2">Хөгжүүлэгч</th>
                      <th>Хувь</th>
                      <th>Хэмжээ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryResult.developerSalaryDetail.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td>{item.developer}</td>
                        <td>{item.salaryPercen}</td>
                        <td>{item.salary.toLocaleString()}₮</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-2 font-bold">Админы нийт ашиг: {salaryResult.totalAdminSalary.toLocaleString()}₮</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryModal;