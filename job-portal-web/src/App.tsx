import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import AppProviders from './providers/AppProviders';
import RouteProgress from './components/common/RouteProgress';

export default function App(){
  return (
    <BrowserRouter>
      <AppProviders>
        <RouteProgress />
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}