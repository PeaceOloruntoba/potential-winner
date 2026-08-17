import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute, homeForRole } from "./components/ProtectedRoute";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

import { ParentDashboard } from "./pages/parent/ParentDashboard";
import { ApplyAdmissionPage } from "./pages/parent/ApplyAdmissionPage";
import { ChildDetailPage } from "./pages/parent/ChildDetailPage";
import { PaymentCallbackPage } from "./pages/parent/PaymentCallbackPage";

import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { ScoreEntryPage } from "./pages/teacher/ScoreEntryPage";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ApprovalsPage } from "./pages/admin/ApprovalsPage";
import { AdmissionsPage } from "./pages/admin/AdmissionsPage";
import { StudentsPage } from "./pages/admin/StudentsPage";
import { TeachersPage } from "./pages/admin/TeachersPage";
import { ClassroomsPage } from "./pages/admin/ClassroomsPage";
import { AssessmentsPage } from "./pages/admin/AssessmentsPage";
import { FeesPage } from "./pages/admin/FeesPage";
import { BillingPage } from "./pages/admin/BillingPage";
import { SettingsPage } from "./pages/admin/SettingsPage";

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/payment-callback" element={<PaymentCallbackPage />} />

      <Route element={<ProtectedRoute allowedRoles={["PARENT"]} />}>
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/apply" element={<ApplyAdmissionPage />} />
        <Route path="/parent/children/:studentId" element={<ChildDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/scores/:classroomId/:subjectId" element={<ScoreEntryPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/approvals" element={<ApprovalsPage />} />
        <Route path="/admin/admissions" element={<AdmissionsPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/teachers" element={<TeachersPage />} />
        <Route path="/admin/classrooms" element={<ClassroomsPage />} />
        <Route path="/admin/assessments" element={<AssessmentsPage />} />
        <Route path="/admin/fees" element={<FeesPage />} />
        <Route path="/admin/billing" element={<BillingPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
