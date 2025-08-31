import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouteProgress() {
  const loc = useLocation();
  useEffect(() => {
    nprogress.start();
    const timer = setTimeout(() => nprogress.done(), 200);
    return () => clearTimeout(timer);
  }, [loc]);
  return null;
}