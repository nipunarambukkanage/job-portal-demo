import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJobs } from '../../store/slices/jobsSlice';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function JobsListPage(){
  const d = useAppDispatch();
  const { items, loading } = useAppSelector(s=>s.jobs);

  useEffect(()=>{ d(fetchJobs({ page:1, pageSize:20 })); }, [d]);
  if (loading) return <Spinner />;

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography variant='h5'>Jobs</Typography>
        <Button component={Link} to='/jobs/new' variant='contained'>Post Job</Button>
      </Box>
      <DataTable rows={items} columns={[
        { key: 'title', header:'Title' },
        { key: 'company', header:'Company' },
        { key: 'location', header:'Location' },
        { key: 'id', header:'Open', render:(r)=><Button component={Link} to={'/jobs/'+r.id} size='small'>Open</Button> }
      ]}/>
    </Box>
  );
}
