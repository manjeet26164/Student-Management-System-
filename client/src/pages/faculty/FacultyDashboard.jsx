import { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import AiClassInsightsCard from "../../components/AiClassInsightsCard";
import { fetchFacultyClasses, fetchFacultyStudents } from "../../services/facultyService";

const FacultyDashboard = () => {
  const [summary, setSummary] = useState({ subjects: 0, students: 0, department: "-", designation: "-" });

  useEffect(() => {
    const load = async () => {
      const [classes, students] = await Promise.all([fetchFacultyClasses(), fetchFacultyStudents()]);
      setSummary({
        subjects: classes.subjects.length,
        students: students.length,
        department: classes.faculty.department,
        designation: classes.faculty.designation,
      });
    };

    load();
  }, []);

  return (
    <div className="page-grid">
      <section className="panel welcome-panel">
        <h2>Faculty Dashboard</h2>
        <p>
          {summary.department} | {summary.designation}
        </p>
      </section>
      <section className="stats-grid">
        <StatCard label="Assigned Subjects" value={summary.subjects} />
        <StatCard label="Assigned Students" value={summary.students} />
      </section>
      <AiClassInsightsCard />
    </div>
  );
};

export default FacultyDashboard;