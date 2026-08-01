import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { AuthProvider } from './context/AuthContext'
import { ListingsProvider } from './context/ListingsContext'
import { ChatProvider } from './context/ChatContext'
import { AppShell } from './components/shell/AppShell'
import { ProtectedRoute } from './components/shell/ProtectedRoute'
import { RolePicker } from './pages/RolePicker'
import { NotFound } from './pages/NotFound'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { UserManagement } from './pages/admin/UserManagement'
import { RolePermissionsPage } from './pages/admin/RolePermissionsPage'
import { ActivityLogPage } from './pages/admin/ActivityLogPage'

import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard'
import { ManageListings } from './pages/recruiter/ManageListings'
import { NewListing } from './pages/recruiter/NewListing'
import { ListingApplicants } from './pages/recruiter/ListingApplicants'
import { ApplicationReview } from './pages/recruiter/ApplicationReview'
import { ApplicationChat as RecruiterApplicationChat } from './pages/recruiter/ApplicationChat'
import { Reports } from './pages/recruiter/Reports'

import { JobSeekerDashboard } from './pages/jobseeker/JobSeekerDashboard'
import { BrowseListings } from './pages/jobseeker/BrowseListings'
import { ListingDetail } from './pages/jobseeker/ListingDetail'
import { MyApplications } from './pages/jobseeker/MyApplications'
import { ApplicationDetail } from './pages/jobseeker/ApplicationDetail'
import { ApplicationChat as JobSeekerApplicationChat } from './pages/jobseeker/ApplicationChat'

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <ListingsProvider>
            <ChatProvider>
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

                <Route element={<ProtectedRoute role="recruiter" />}>
                  <Route element={<AppShell />}>
                    <Route path="/recruiter" element={<RecruiterDashboard />} />
                    <Route path="/recruiter/listings" element={<ManageListings />} />
                    <Route path="/recruiter/listings/new" element={<NewListing />} />
                    <Route path="/recruiter/listings/:id" element={<ListingApplicants />} />
                    <Route path="/recruiter/applications/:id" element={<ApplicationReview />} />
                    <Route path="/recruiter/applications/:id/chat" element={<RecruiterApplicationChat />} />
                    <Route path="/recruiter/reports" element={<Reports />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute role="job_seeker" />}>
                  <Route element={<AppShell />}>
                    <Route path="/job_seeker" element={<JobSeekerDashboard />} />
                    <Route path="/job_seeker/listings" element={<BrowseListings />} />
                    <Route path="/job_seeker/listings/:id" element={<ListingDetail />} />
                    <Route path="/job_seeker/applications" element={<MyApplications />} />
                    <Route path="/job_seeker/applications/:id" element={<ApplicationDetail />} />
                    <Route path="/job_seeker/applications/:id/chat" element={<JobSeekerApplicationChat />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </ChatProvider>
          </ListingsProvider>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  )
}
