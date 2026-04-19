import { Navigate } from 'react-router-dom'
import { getRiderSession } from '../../data/riderAuth.js'
import { RiderLayout } from './RiderLayout.jsx'

export function RiderProtectedLayout() {
  if (!getRiderSession()) {
    return <Navigate to="/rider/login" replace />
  }
  return <RiderLayout />
}
