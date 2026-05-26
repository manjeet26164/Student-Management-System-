import { useEffect, useState } from "react";
import { fetchFacultyStudents } from "../../services/facultyService";

const FacultyStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchFacultyStudents().then(setStudents);
  }, []);

  return (
    <section className="panel">
      <h2>Assigned Students</h2>
      <table className="erp-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>University ID</th>
            <th>Roll No</th>
            <th>Semester</th>
            <th>Branch</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.user?.fullName}</td>
              <td>{s.user?.universityId}</td>
              <td>{s.rollNumber}</td>
              <td>{s.semester}</td>
              <td>{s.branch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default FacultyStudents;
