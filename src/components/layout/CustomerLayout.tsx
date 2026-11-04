import React from 'react';
import { PublicLayout } from './PublicLayout';

/**
 * CustomerLayout - Dedicated isolated storefront layout for customers with Customer Navbar, Cart drawer, and Footer.
 * Staff terminals and Admin dashboards NEVER share this layout.
 */
export const CustomerLayout: React.FC = () => {
  return <PublicLayout />;
};

export default CustomerLayout;

