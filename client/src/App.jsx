import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentDocuments from "./pages/student/StudentDocuments";
import StudentResults from "./pages/student/StudentResults";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentFees from "./pages/student/StudentFees";
import ChangePasswordPage from "./pages/shared/ChangePasswordPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageFaculty from "./pages/admin/ManageFaculty";
import ManageSubjects from "./pages/admin/ManageSubjects";
import AcademicOperations from "./pages/admin/AcademicOperations";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyStudents from "./pages/faculty/FacultyStudents";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyMarks from "./pages/faculty/FacultyMarks";
import FacultyRecords from "./pages/faculty/FacultyRecords";
import FacultyDocuments from "./pages/faculty/FacultyDocuments";

const App = () => (
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
);

export default App;
