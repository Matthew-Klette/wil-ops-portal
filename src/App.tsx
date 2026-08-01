import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { AuthProvider } from './context/AuthContext'
import { RequestsProvider } from './context/RequestsContext'
import { AppShell } from './components/shell/AppShell'
import { ProtectedRoute } from './components/shell/ProtectedRoute'
import { RolePicker } from './pages/RolePicker'
import { NotFound } from './pages/NotFound'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { UserManagement } from './pages/admin/UserManagement'
import { RolePermissionsPage } from './pages/admin/RolePermissionsPage'
import { ActivityLogPage } from './pages/admin/ActivityLogPage'

import { StaffDashboard } from './pages/staff/StaffDashboard'
import { RequestList } from './pages/staff/RequestList'
import { StaffRequestDetail } from './pages/staff/StaffRequestDetail'
import { StaffRequestMessages } from './pages/staff/StaffRequestMessages'
import { Reports } from './pages/staff/Reports'

import { ClientDashboard } from './pages/client/ClientDashboard'
import { MyRequests } from './pages/client/MyRequests'
import { NewRequest } from './pages/client/NewRequest'
import { ClientRequestDetail } from './pages/client/ClientRequestDetail'

export default function App() {
  return (
    <DataProvider>
    <AuthProvider>
      <RequestsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RolePicker />} />

            <Route element={<ProtectedRoute role="admin" />}>
              <Route element={<AppShell />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/roles" element={<RolePermissionsPage />} />
                <Route path="/admin/activity" element={<ActivityLogPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="staff" />}>
              <Route element={<AppShell />}>
                <Route path="/staff" element={<StaffDashboard />} />
                <Route path="/staff/requests" element={<RequestList />} />
                <Route path="/staff/requests/:id" element={<StaffRequestDetail />} />
                <Route path="/staff/requests/:id/messages" element={<StaffRequestMessages />} />
                <Route path="/staff/reports" element={<Reports />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="client" />}>
              <Route element={<AppShell />}>
                <Route path="/client" element={<ClientDashboard />} />
                <Route path="/client/requests" element={<MyRequests />} />
                <Route path="/client/requests/new" element={<NewRequest />} />
                <Route path="/client/requests/:id" element={<ClientRequestDetail />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RequestsProvider>
    </AuthProvider>
    </DataProvider>
  )
}
