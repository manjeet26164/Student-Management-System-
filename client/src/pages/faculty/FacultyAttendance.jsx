import { useEffect, useState } from "react";
import {
  fetchFacultyClasses,
  fetchFacultyStudents,
  markFacultyAttendance,
} from "../../services/facultyService";

const FacultyAttendance = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ studentId: "", subjectId: "", present: 0, absent: 0 });
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([fetchFacultyStudents(), fetchFacultyClasses()]).then(([std, cls]) => {
      setStudents(std);
      setSubjects(cls.subjects);
    });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    await markFacultyAttendance(form);
    setMessage("Attendance marked successfully.");
  };

  return (
    <section className="panel panel-narrow">
      <h2>Mark Attendance</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <select required onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}>
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.user.fullName}
            </option>
          ))}
        </select>
        <select required onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}>
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.code}
            </option>
          ))}
        </select>
        <input type="number" placeholder="Present" required onChange={(e) => setForm((p) => ({ ...p, present: Number(e.target.value) }))} />
        <input type="number" placeholder="Absent" required onChange={(e) => setForm((p) => ({ ...p, absent: Number(e.target.value) }))} />
        <button className="btn-primary" type="submit">Submit Attendance</button>
      </form>
      {message ? <p className="form-message success">{message}</p> : null}
    </section>
  );
};

export default FacultyAttendance;
