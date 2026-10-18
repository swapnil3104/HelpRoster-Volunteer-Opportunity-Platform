import React from 'react';
import { useAuth } from '../context/AuthContext';
import VolunteerDashboard from './VolunteerDashboard';
import OrganizationDashboard from './OrganizationDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'organization') {
    return <OrganizationDashboard />;
  }

  // Default to volunteer dashboard (including admin overview)
  return <VolunteerDashboard />;
}
