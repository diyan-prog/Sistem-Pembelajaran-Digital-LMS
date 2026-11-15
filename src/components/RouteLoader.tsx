import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';

export const RouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location]);

  if (!loading) return null;

  return <PageLoader delay={0} />;
};
