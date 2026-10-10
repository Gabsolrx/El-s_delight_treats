import React from 'react';
import { Navigate } from 'react-router-dom';

export const TreatsPage: React.FC = () => {
  return <Navigate to="/cakes" replace />;
};
