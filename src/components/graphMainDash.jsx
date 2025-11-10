import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDocsToMainDashDB } from "../querysDB/taxDocument/getDocsToMainDash";
import { useState } from "react";


export function GraphYearIncomeAndExpenses() {
  const [data, setData] = useState([]) 

  useEffect(()=>{
    getDocsLastYear()
  },[])
  const getDocsLastYear = async()=>{
    const res = await getDocsToMainDashDB()
    setData(res)
  }
  return (
    <ResponsiveContainer width="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes_declarado" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total_facturas_emitidas" fill="#007bff" barSize={20} />
        <Bar dataKey="total_facturas_recibidas" fill="#28a745" barSize={20} />
        <Bar dataKey="total_nc_emitidas" fill="#fd7e14" barSize={20} />
        <Bar dataKey="total_nc_recibidas" fill="#6f42c1" barSize={20} />
        <Bar dataKey="total_retenciones_recibidas" fill="#dc3545" barSize={20} />
      </BarChart>      
    </ResponsiveContainer>
  );
}
