import { useEffect, useState } from "react";
import {
  fetchStudents,
  fetchSubjects,
  updateAttendanceByAdmin,
  updateFeeByAdmin,
  uploadMarksByAdmin,
} from "../../services/adminService";

const AcademicOperations = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");

  const [attendanceForm, setAttendanceForm] = useState({ studentId: "", subjectId: "", present: 0, absent: 0 });
  const [feeForm, setFeeForm] = useState({ studentId: "", semester: 1, totalAmount: 0, paidAmount: 0 });
  const [marksForm, setMarksForm] = useState({ studentId: "", semester: 1, sgpa: 0, cgpa: 0, subjectCode: "", subjectName: "", credits: 0, grade: "", marks: 0 });

  useEffect(() => {
    Promise.all([fetchStudents(1, 1000), fetchSubjects(1, 1000)]).then(([std, sub]) => {
      setStudents(std.students);
      setSubjects(sub.subjects);
    });
  }, []);

  const submitAttendance = async (event) => {
    event.preventDefault();
    await updateAttendanceByAdmin(attendanceForm);
    setMessage("Attendance updated.");
  };

  const submitFee = async (event) => {
    event.preventDefault();
    await updateFeeByAdmin(feeForm);
    setMessage("Fee record updated.");
  };

  const submitMarks = async (event) => {
    event.preventDefault();
    const payload = {
      studentId: marksForm.studentId,
      semester: Number(marksForm.semester),
      sgpa: Number(marksForm.sgpa),
      cgpa: Number(marksForm.cgpa),
      subjects: [
        {
          subjectCode: marksForm.subjectCode,
          subjectName: marksForm.subjectName,
          credits: Number(marksForm.credits),
          grade: marksForm.grade,
          marks: Number(marksForm.marks),
        },
      ],
    };

    await uploadMarksByAdmin(payload);
    setMessage("Marks uploaded.");
  };

  return (
    <div className="page-grid two-col">
      <section className="panel">
        <h3>Update Attendance</h3>
        <form className="form-grid compact" onSubmit={submitAttendance}>
          <select required onChange={(e) => setAttendanceForm((p) => ({ ...p, studentId: e.target.value }))}>
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.user.fullName}
              </option>
            ))}
          </select>
          <select required onChange={(e) => setAttendanceForm((p) => ({ ...p, subjectId: e.target.value }))}>
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code}
              </option>
            ))}
          </select>
          <input placeholder="Present" type="number" onChange={(e) => setAttendanceForm((p) => ({ ...p, present: Number(e.target.value) }))} required />
          <input placeholder="Absent" type="number" onChange={(e) => setAttendanceForm((p) => ({ ...p, absent: Number(e.target.value) }))} required />
          <button className="btn-primary" type="submit">Save Attendance</button>
        </form>
      </section>

      <section className="panel">
        <h3>Update Fee</h3>
        <form className="form-grid compact" onSubmit={submitFee}>
          <select required onChange={(e) => setFeeForm((p) => ({ ...p, studentId: e.target.value }))}>
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.user.fullName}
              </option>
            ))}
          </select>
          <input placeholder="Semester" type="number" onChange={(e) => setFeeForm((p) => ({ ...p, semester: Number(e.target.value) }))} required />
          <input placeholder="Total Amount" type="number" onChange={(e) => setFeeForm((p) => ({ ...p, totalAmount: Number(e.target.value) }))} required />
          <input placeholder="Paid Amount" type="number" onChange={(e) => setFeeForm((p) => ({ ...p, paidAmount: Number(e.target.value) }))} required />
          <button className="btn-primary" type="submit">Save Fee</button>
        </form>
      </section>

      <section className="panel">
        <h3>Upload Marks</h3>
        <form className="form-grid compact" onSubmit={submitMarks}>
          <select required onChange={(e) => setMarksForm((p) => ({ ...p, studentId: e.target.value }))}>
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.user.fullName}
              </option>
            ))}
          </select>
          <input placeholder="Semester" type="number" onChange={(e) => setMarksForm((p) => ({ ...p, semester: Number(e.target.value) }))} required />
          <input placeholder="Subject Code" onChange={(e) => setMarksForm((p) => ({ ...p, subjectCode: e.target.value }))} required />
          <input placeholder="Subject Name" onChange={(e) => setMarksForm((p) => ({ ...p, subjectName: e.target.value }))} required />
          <input placeholder="Credits" type="number" onChange={(e) => setMarksForm((p) => ({ ...p, credits: Number(e.target.value) }))} required />
          <input placeholder="Grade" onChange={(e) => setMarksForm((p) => ({ ...p, grade: e.target.value }))} required />
          <input placeholder="Marks" type="number" onChange={(e) => setMarksForm((p) => ({ ...p, marks: Number(e.target.value) }))} required />
          <input placeholder="SGPA" type="number" step="0.01" onChange={(e) => setMarksForm((p) => ({ ...p, sgpa: Number(e.target.value) }))} required />
          <input placeholder="CGPA" type="number" step="0.01" onChange={(e) => setMarksForm((p) => ({ ...p, cgpa: Number(e.target.value) }))} required />
          <button className="btn-primary" type="submit">Upload Marks</button>
        </form>
      </section>

      {message ? <p className="form-message success">{message}</p> : null}
    </div>
  );
};

export default AcademicOperations;