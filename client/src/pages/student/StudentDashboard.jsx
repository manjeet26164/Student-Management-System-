import { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import AiInsightsCard from "../../components/AiInsightsCard";
import { fetchStudentDashboard } from "../../services/studentService";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchStudentDashboard();
        setData(response);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };

    load();
  }, []);

  if (error) return <p className="form-message error">{error}</p>;
  if (!data) return <div className="page-loader">Loading dashboard...</div>;

  return (
    <div className="page-grid">
      <section className="panel welcome-panel">
        <h2>Welcome back, {data.welcome.name}</h2>
        <p>
          Semester {data.welcome.semester} | {data.welcome.branch}
        </p>
      </section>

      <section className="stats-grid">
        <StatCard label="CGPA" value={data.summary.cgpa} />
        <StatCard label="Attendance" value={`${data.summary.attendancePercent}%`} />
        <StatCard label="Total Credits" value={data.summary.totalCredits} />
        <StatCard label="Backlogs" value={data.summary.backlogs} />
      </section>

      <AiInsightsCard />

      <section className="panel">
        <h3>Subject Attendance</h3>
        <div className="attendance-list">
          {data.subjectAttendance.map((item) => (
            <article key={item._id}>
              <div className="row-between">
                <p>
                  {item.subject?.code} - {item.subject?.name}
                </p>
                <span>{item.percentage}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${item.percentage}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Today's Schedule</h3>
        <div className="schedule-list">
          {data.todaySchedule.length ? (
            data.todaySchedule.map((cls, idx) => (
              <div className="schedule-item" key={`${cls.time}-${idx}`}>
                <strong>{cls.time}</strong>
                <p>{cls.subject}</p>
                <small>
                  {cls.room} | {cls.faculty}
                </small>
              </div>
            ))
          ) : (
            <p className="muted">No classes scheduled for today.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;