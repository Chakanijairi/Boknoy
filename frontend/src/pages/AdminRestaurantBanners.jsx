import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'
import { Link } from 'react-router-dom'

export default function AdminRestaurantBanners() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title="System settings — Restaurant banners" />
        <div className="mx-auto max-w-2xl flex-1 px-5 py-10 text-center">
          <p className="mb-4 text-slate-400">
            <Link
              to="/admin/system"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              ← System settings
            </Link>
          </p>
          <p className="text-slate-300">
            Restaurant banner management will be configured here (per partner
            restaurants).
          </p>
        </div>
      </div>
    </div>
  )
}
