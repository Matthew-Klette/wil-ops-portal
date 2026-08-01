import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { permissionLabels } from '../../data/mock'
import { useData } from '../../context/DataContext'
import type { PermissionKey } from '../../data/types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'

const permissionKeys = Object.keys(permissionLabels) as PermissionKey[]

export function RolePermissionsPage() {
  const { rolePermissions: matrix, updateRolePermission } = useData()
  const [savedFlash, setSavedFlash] = useState(false)
  const flashTimeout = useRef<number | undefined>(undefined)

  function toggle(roleIndex: number, key: PermissionKey) {
    const entry = matrix[roleIndex]
    updateRolePermission(entry.role, key, !entry.permissions[key])
    setSavedFlash(true)
    window.clearTimeout(flashTimeout.current)
    flashTimeout.current = window.setTimeout(() => setSavedFlash(false), 1400)
  }

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Control what each role can see and do across the portal."
        crumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Roles & Permissions' }]}
        actions={
          savedFlash ? (
            <motion.span
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-full bg-pine-soft px-3 py-1.5 text-xs font-medium text-pine"
            >
              Saved
            </motion.span>
          ) : null
        }
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-fog">
              <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-soft">
                Permission
              </th>
              {matrix.map((r) => (
                <th key={r.role} className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-soft">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-fog">
            {permissionKeys.map((key) => (
              <tr key={key}>
                <td className="px-5 py-3.5 text-sm text-ink">{permissionLabels[key]}</td>
                {matrix.map((r, i) => (
                  <td key={r.role} className="px-5 py-3.5">
                    <button
                      onClick={() => toggle(i, key)}
                      disabled={r.role === 'admin'}
                      aria-label={`Toggle ${permissionLabels[key]} for ${r.label}`}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        r.permissions[key] ? 'bg-signal' : 'bg-fog'
                      } ${r.role === 'admin' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <motion.span
                        layout
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-paper-raised shadow"
                        animate={{ left: r.permissions[key] ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 text-xs text-slate-soft">
        Admin permissions are fixed to keep at least one role with full system access.
      </p>
    </div>
  )
}
