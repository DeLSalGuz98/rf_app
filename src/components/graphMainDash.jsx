import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Ene", "Total gastos": 1200, "Gastos Facturados": 950,  "Total de Ingresos": 3000 },
  { name: "Feb", "Total gastos": 900,  "Gastos Facturados": 700,  "Total de Ingresos": 2500 },
  { name: "Mar", "Total gastos": 1400, "Gastos Facturados": 1100, "Total de Ingresos": 3200 },
  { name: "Abr", "Total gastos": 1000, "Gastos Facturados": 800,  "Total de Ingresos": 2800 },
  { name: "May", "Total gastos": 1600, "Gastos Facturados": 1300, "Total de Ingresos": 3500 },
  { name: "Jun", "Total gastos": 1100, "Gastos Facturados": 850,  "Total de Ingresos": 2700 },
  { name: "Jul", "Total gastos": 1500, "Gastos Facturados": 1200, "Total de Ingresos": 3300 },
  { name: "Ago", "Total gastos": 1300, "Gastos Facturados": 1000, "Total de Ingresos": 3100 },
  { name: "Sep", "Total gastos": 1700, "Gastos Facturados": 1400, "Total de Ingresos": 3600 },
  { name: "Oct", "Total gastos": null, "Gastos Facturados": null, "Total de Ingresos": null },
  { name: "Nov", "Total gastos": null, "Gastos Facturados": null, "Total de Ingresos": null },
  { name: "Dic", "Total gastos": null, "Gastos Facturados": null, "Total de Ingresos": null },
];

export function GraphYearIncomeAndExpenses() {
  return (
    <ResponsiveContainer width="100%">
      <BarChart data={data} barGap={-20}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        <Bar dataKey="Total gastos" fill="#f87171" barSize={40} />
        <Bar dataKey="Gastos Facturados" fill="#60a5fa" barSize={20} />
        <Bar dataKey="Total de Ingresos" fill="#34d399" barSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
}
