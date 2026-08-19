import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));

// Student Pages
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));
const StudentDocuments = lazy(() => import("./pages/student/StudentDocuments"));
const StudentResults = lazy(() => import("./pages/student/StudentResults"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const StudentFees = lazy(() => import("./pages/student/StudentFees"));
const ChangePasswordPage = lazy(() => import("./pages/shared/ChangePasswordPage"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageFaculty = lazy(() => import("./pages/admin/ManageFaculty"));
const ManageSubjects = lazy(() => import("./pages/admin/ManageSubjects"));
const AcademicOperations = lazy(() => import("./pages/admin/AcademicOperations"));
const KnowledgeBase = lazy(() => import("./pages/admin/KnowledgeBase"));

// Faculty Pages
const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));
const FacultyStudents = lazy(() => import("./pages/faculty/FacultyStudents"));
const FacultyAttendance = lazy(() => import("./pages/faculty/FacultyAttendance"));
const FacultyMarks = lazy(() => import("./pages/faculty/FacultyMarks"));
const FacultyRecords = lazy(() => import("./pages/faculty/FacultyRecords"));
const FacultyDocuments = lazy(() => import("./pages/faculty/FacultyDocuments"));

const App = () => (
  <Suspense fallback={<div className="page-loader">Loading page...</div>}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["student", "faculty", "admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/documents" element={<ProtectedRoute allowedRoles={["student"]}><StudentDocuments /></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute allowedRoles={["student"]}><StudentResults /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["student"]}><StudentAttendance /></ProtectedRoute>} />
        <Route path="/student/fees" element={<ProtectedRoute allowedRoles={["student"]}><StudentFees /></ProtectedRoute>} />
        <Route path="/student/change-password" element={<ProtectedRoute allowedRoles={["student"]}><ChangePasswordPage /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><ManageStudents /></ProtectedRoute>} />
        <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={["admin"]}><ManageFaculty /></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={["admin"]}><ManageSubjects /></ProtectedRoute>} />
        <Route path="/admin/operations" element={<ProtectedRoute allowedRoles={["admin"]}><AcademicOperations /></ProtectedRoute>} />
        <Route path="/admin/knowledge" element={<ProtectedRoute allowedRoles={["admin"]}><KnowledgeBase /></ProtectedRoute>} />
        <Route path="/admin/change-password" element={<ProtectedRoute allowedRoles={["admin"]}><ChangePasswordPage /></ProtectedRoute>} />

        <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyStudents /></ProtectedRoute>} />
        <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyAttendance /></ProtectedRoute>} />
        <Route path="/faculty/marks" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyMarks /></ProtectedRoute>} />
        <Route path="/faculty/documents" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDocuments /></ProtectedRoute>} />
        <Route path="/faculty/records" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyRecords /></ProtectedRoute>} />
        <Route path="/faculty/change-password" element={<ProtectedRoute allowedRoles={["faculty"]}><ChangePasswordPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Suspense>
);

export default App;