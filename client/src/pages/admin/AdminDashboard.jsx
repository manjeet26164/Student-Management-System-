import { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import { fetchStudents, fetchSubjects } from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, subjects: 0, branches: 0, semesters: 0 });

  useEffect(() => {
    const load = async () => {
      // limit=1000 here just for dashboard aggregate stats; real listing pages use small page sizes
      const [studentsRes, subjects] = await Promise.all([fetchStudents(1, 1000), fetchSubjects()]);
      const students = studentsRes.students;
      setStats({
        students: studentsRes.pagination.total,
        subjects: subjects.length,
        branches: new Set(students.map((s) => s.branch)).size,
        semesters: new Set(students.map((s) => s.semester)).size,
      });
    };

    load();
  }, []);

  return (
    <div className="page-grid">
      <section className="panel welcome-panel">
        <h2>Admin Control Dashboard</h2>
        <p>Monitor and manage university academic operations.</p>
      </section>
      <section className="stats-grid">
        <StatCard label="Total Students" value={stats.students} />
        <StatCard label="Total Subjects" value={stats.subjects} />
        <StatCard label="Branches" value={stats.branches} />
        <StatCard label="Active Semesters" value={stats.semesters} />
      </section>
    </div>
  );
};

export default AdminDashboard;
