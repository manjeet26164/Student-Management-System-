import { useEffect, useState } from "react";
import { fetchFacultyRecords } from "../../services/facultyService";

const FacultyRecords = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchFacultyRecords().then(setRecords);
  }, []);

  return (
    <section className="panel">
      <h2>Class Records</h2>
      <table className="erp-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr key={row._id}>
              <td>{row.student?.rollNumber}</td>
              <td>
                {row.subject?.code} - {row.subject?.name}
              </td>
              <td>{row.present}</td>
              <td>{row.absent}</td>
              <td>{row.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default FacultyRecords;
