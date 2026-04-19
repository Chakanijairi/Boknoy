import { Navigate } from 'react-router-dom'
import { getCustomerSession } from '../../data/customerAuth.js'
import { CustomerLayout } from './CustomerLayout.jsx'

export function CustomerProtectedLayout() {
  if (!getCustomerSession()) {
    return <Navigate to="/login" replace />
  }
  return <CustomerLayout />
}
