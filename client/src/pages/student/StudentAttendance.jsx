import { useEffect, useState } from "react";
import { fetchStudentAttendance } from "../../services/studentService";

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    fetchStudentAttendance().then(setAttendance);
  }, []);

  if (!attendance) return <div className="page-loader">Loading attendance...</div>;

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <article className="stat-card">
          <p>Overall Attendance</p>
          <h3>{attendance.overallPercentage}%</h3>
        </article>
        <article className="stat-card">
          <p>Present</p>
          <h3>{attendance.totalPresent}</h3>
        </article>
        <article className="stat-card">
          <p>Absent</p>
          <h3>{attendance.totalAbsent}</h3>
        </article>
        <article className="stat-card">
          <p>Total Classes</p>
          <h3>{attendance.totalClasses}</h3>
        </article>
      </section>

      <section className="panel">
        <h3>Subject-wise Attendance</h3>
        {attendance.subjects.map((item) => (
          <article key={item._id} className="attendance-line">
            <div className="row-between">
              <p>
                {item.subject?.code} - {item.subject?.name}
              </p>
              <p>{item.percentage}%</p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${item.percentage}%` }} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default StudentAttendance;
