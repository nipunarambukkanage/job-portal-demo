import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
export interface Column<T>{ key: keyof T | string; header: string; render?: (row:T)=>React.ReactNode; }
export default function DataTable<T extends {id: string|number}>({ rows, columns }: { rows: T[]; columns: Column<T>[] }){
  return (
    <TableContainer component={Paper}>
      <Table size='small'>
        <TableHead><TableRow>{columns.map(c=><TableCell key={String(c.key)}>{c.header}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {rows.map(r=>(
            <TableRow key={r.id}>
              {columns.map(c=><TableCell key={String(c.key)}>{c.render?c.render(r):(r as any)[c.key]}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
