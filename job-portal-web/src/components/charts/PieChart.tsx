import Chart from 'react-apexcharts';
export default function PieChart({ labels, data }:{ labels:string[]; data:number[] }){
  return <Chart type='donut' height={300} series={data} options={{ labels }} />;
}
