import Chart from 'react-apexcharts';
export default function BarChart({ series, categories }:{ series:{name:string; data:number[]}[]; categories:string[] }){
  return <Chart type='bar' height={300} series={series} options={{ xaxis:{ categories }, legend:{ position:'top' } }} />;
}
