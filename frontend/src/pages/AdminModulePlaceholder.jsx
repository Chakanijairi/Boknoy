import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'

export default function AdminModulePlaceholder({ title, description }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title={title} />
        <div className="mx-auto max-w-2xl flex-1 px-5 py-16 text-center">
          <p className="text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  )
}
