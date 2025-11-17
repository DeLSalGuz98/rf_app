import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function GraphExpenditureProject({data=[]}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        <Bar dataKey="Gastos con Factura" fill="#f87171" barSize={20} />
        <Bar dataKey="Gastos sin Factura" fill="#60a5fa" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
