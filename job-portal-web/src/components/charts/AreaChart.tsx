import Chart from 'react-apexcharts';
export default function AreaChart({ series, categories }:{ series:{name:string; data:number[]}[]; categories:string[] }){
  return <Chart type='area' height={300} series={series} options={{
    chart:{ toolbar:{ show:false } }, dataLabels:{enabled:false},
    xaxis:{ categories }, stroke:{ curve:'smooth' }, legend:{ position:'top' }
  }} />;
}
