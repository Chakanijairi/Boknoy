import { useEffect, useState } from 'react'
import {
  fetchCustomerRecord,
  getCustomerSession,
  updateCustomerPassword,
  updateCustomerProfile,
} from '../data/customerAuth.js'

function newAddrId() {
  return crypto.randomUUID?.() ?? `a-${Date.now()}`
}

export default function CustomerMyAccount() {
  const session = getCustomerSession()
  const [record, setRecord] = useState(null)
  const [loadErr, setLoadErr] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [addresses, setAddresses] = useState([])
  const [label, setLabel] = useState('Home')
  const [line, setLine] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [profileMsg, setProfileMsg] = useState(null)
  const [pwdMsg, setPwdMsg] = useState(null)
  const [locMsg, setLocMsg] = useState(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchCustomerRecord(session.id).then((r) => {
      if (cancelled) return
      if (!r) {
        setLoadErr('Could not load profile. Is the API server running?')
        return
      }
      setRecord(r)
      setName(r.name ?? '')
      setPhone(r.phone ?? '')
      setAddresses(Array.isArray(r.addresses) ? r.addresses : [])
    })
    return () => {
      cancelled = true
    }
  }, [session])

  if (!session) return null
  if (loadErr) {
    return <p className="mx-auto max-w-2xl text-red-600">{loadErr}</p>
  }
  if (!record) {
    return (
      <p className="mx-auto max-w-2xl text-slate-600">Loading account…</p>
    )
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileMsg(null)
    const result = await updateCustomerProfile(session.id, {
      name: name.trim(),
      phone: phone.trim(),
      addresses,
    })
    if (!result.ok) {
      setProfileMsg({
        type: 'err',
        text: result.error ?? 'Could not save.',
      })
      return
    }
    if (result.customer) setRecord({ ...record, ...result.customer })
    setProfileMsg({ type: 'ok', text: 'Profile updated.' })
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPwdMsg(null)
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'err', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'err', text: 'New passwords do not match.' })
      return
    }
    const result = await updateCustomerPassword(
      session.id,
      currentPassword,
      newPassword,
    )
    if (!result.ok) {
      setPwdMsg({
        type: 'err',
        text: result.error ?? 'Could not update password.',
      })
      return
    }
    setPwdMsg({ type: 'ok', text: 'Password updated.' })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const persistAddresses = async (next) => {
    setAddresses(next)
    const result = await updateCustomerProfile(session.id, {
      name: name.trim(),
      phone: phone.trim(),
      addresses: next,
    })
    if (result.ok && result.customer) {
      setRecord({ ...record, ...result.customer })
    }
  }

  const addAddress = async (e) => {
    e.preventDefault()
    if (!line.trim()) return
    const next = [
      ...addresses,
      {
        id: newAddrId(),
        label: label.trim() || 'Address',
        line: line.trim(),
        lat: lat.trim() || null,
        lng: lng.trim() || null,
      },
    ]
    await persistAddresses(next)
    setLine('')
    setLat('')
    setLng('')
  }

  const removeAddress = (id) => {
    persistAddresses(addresses.filter((a) => a.id !== id))
  }

  const useMyLocation = () => {
    setLocMsg(null)
    if (!navigator.geolocation) {
      setLocMsg({
        type: 'err',
        text: 'Location is not supported in this browser.',
      })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)))
        setLng(String(pos.coords.longitude.toFixed(6)))
        setLocMsg({
          type: 'ok',
          text: 'Coordinates filled from your device. Add a label and save the address.',
        })
      },
      () => {
        setLocMsg({
          type: 'err',
          text: 'Could not read location. Check browser permissions.',
        })
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My account</h1>
        <p className="mt-1 text-sm text-slate-600">{session.email}</p>
      </div>

      <section className="rounded-2xl border border-sky-200/80 bg-white/90 p-5 shadow-md sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          {profileMsg ? (
            <p
              className={
                profileMsg.type === 'ok'
                  ? 'text-sm text-emerald-700'
                  : 'text-sm text-red-600'
              }
            >
              {profileMsg.text}
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Save profile
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-sky-200/80 bg-white/90 p-5 shadow-md sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800">Password</h2>
        <form onSubmit={savePassword} className="mt-4 space-y-4">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          {pwdMsg ? (
            <p
              className={
                pwdMsg.type === 'ok' ? 'text-sm text-emerald-700' : 'text-sm text-red-600'
              }
            >
              {pwdMsg.text}
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Update password
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-sky-200/80 bg-white/90 p-5 shadow-md sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800">Addresses</h2>
        <p className="mt-1 text-sm text-slate-600">
          Save places you order from often. Use your live location to pin
          coordinates (browser will ask permission).
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          className="mt-4 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900"
        >
          Use my current location
        </button>
        {locMsg ? (
          <p
            className={`mt-2 text-sm ${
              locMsg.type === 'ok' ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {locMsg.text}
          </p>
        ) : null}
        <form onSubmit={addAddress} className="mt-4 space-y-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Home)"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="Street, barangay, city"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude (optional)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude (optional)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add address
          </button>
        </form>
        <ul className="mt-6 space-y-3">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-sky-100 bg-sky-50/50 p-4"
            >
              <div>
                <p className="font-semibold text-slate-800">{a.label}</p>
                <p className="text-sm text-slate-700">{a.line}</p>
                {a.lat && a.lng ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {a.lat}, {a.lng}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeAddress(a.id)}
                className="text-sm font-semibold text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
