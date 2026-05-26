import { useEffect, useState } from "react";
import {
  fetchFacultyClasses,
  fetchFacultyStudents,
  uploadFacultyMarks,
} from "../../services/facultyService";

const subjectRowTemplate = {
  subjectCode: "",
  subjectName: "",
  credits: 0,
  grade: "",
  marks: 0,
};

const FacultyMarks = () => {
  const [students, setStudents] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    semester: 1,
    subjects: [{ ...subjectRowTemplate }],
    sgpa: 0,
    cgpa: 0,
  });

  useEffect(() => {
    Promise.all([fetchFacultyStudents(), fetchFacultyClasses()]).then(([studentsData, classesData]) => {
      setStudents(studentsData);
      setAssignedSubjects(classesData.subjects || []);
    });
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubjectRowChange = (index, key, value) => {
    setForm((prev) => {
      const rows = [...prev.subjects];
      rows[index] = { ...rows[index], [key]: value };
      return { ...prev, subjects: rows };
    });
  };

  const onSubjectSelect = (index, subjectId) => {
    const selected = assignedSubjects.find((subject) => subject._id === subjectId);
    if (!selected) return;

    setForm((prev) => {
      const rows = [...prev.subjects];
      rows[index] = {
        ...rows[index],
        subjectCode: selected.code,
        subjectName: selected.name,
        credits: selected.credits,
      };
      return { ...prev, subjects: rows };
    });
  };

  const addSubjectRow = () => {
    setForm((prev) => ({ ...prev, subjects: [...prev.subjects, { ...subjectRowTemplate }] }));
  };

  const removeSubjectRow = (index) => {
    setForm((prev) => {
      if (prev.subjects.length === 1) return prev;
      return { ...prev, subjects: prev.subjects.filter((_, rowIndex) => rowIndex !== index) };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const validSubjects = form.subjects.filter((subject) => subject.subjectCode && subject.subjectName);
    if (!validSubjects.length) {
      setError("Add at least one valid subject before uploading marks.");
      return;
    }

    const payload = {
      studentId: form.studentId,
      semester: Number(form.semester),
      subjects: validSubjects.map((subject) => ({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        credits: Number(subject.credits),
        grade: subject.grade,
        marks: Number(subject.marks),
      })),
      sgpa: Number(form.sgpa),
      cgpa: Number(form.cgpa),
    };

    await uploadFacultyMarks(payload);
    setMessage("Marks uploaded successfully for selected semester.");
    setForm((prev) => ({ ...prev, subjects: [{ ...subjectRowTemplate }] }));
  };

  return (
    <section className="panel">
      <h2>Upload Marks</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <select required name="studentId" value={form.studentId} onChange={onChange}>
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.user.fullName}
            </option>
          ))}
        </select>
        <input
          placeholder="Semester"
          type="number"
          name="semester"
          value={form.semester}
          onChange={onChange}
          required
        />

        <h3 className="section-title">Subject Entries</h3>
        <div className="multi-subject-list">
          {form.subjects.map((subject, index) => (
            <article className="subject-row" key={`subject-row-${index}`}>
              <select value="" onChange={(event) => onSubjectSelect(index, event.target.value)}>
                <option value="">Pick assigned subject</option>
                {assignedSubjects.map((assigned) => (
                  <option key={assigned._id} value={assigned._id}>
                    {assigned.code} - {assigned.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Subject Code"
                value={subject.subjectCode}
                onChange={(event) => onSubjectRowChange(index, "subjectCode", event.target.value)}
                required
              />
              <input
                placeholder="Subject Name"
                value={subject.subjectName}
                onChange={(event) => onSubjectRowChange(index, "subjectName", event.target.value)}
                required
              />
              <input
                placeholder="Credits"
                type="number"
                value={subject.credits}
                onChange={(event) => onSubjectRowChange(index, "credits", event.target.value)}
                required
              />
              <input
                placeholder="Grade"
                value={subject.grade}
                onChange={(event) => onSubjectRowChange(index, "grade", event.target.value)}
                required
              />
              <input
                placeholder="Marks"
                type="number"
                value={subject.marks}
                onChange={(event) => onSubjectRowChange(index, "marks", event.target.value)}
                required
              />
              <button className="btn-outline" type="button" onClick={() => removeSubjectRow(index)}>
                Remove
              </button>
            </article>
          ))}
        </div>
        <button className="btn-outline" type="button" onClick={addSubjectRow}>
          Add Another Subject
        </button>

        <h3 className="section-title">Semester Summary</h3>
        <input
          placeholder="SGPA"
          type="number"
          step="0.01"
          name="sgpa"
          value={form.sgpa}
          onChange={onChange}
          required
        />
        <input
          placeholder="CGPA"
          type="number"
          step="0.01"
          name="cgpa"
          value={form.cgpa}
          onChange={onChange}
          required
        />
        <button className="btn-primary" type="submit">Upload Semester Marks</button>
      </form>
      {error ? <p className="form-message error">{error}</p> : null}
      {message ? <p className="form-message success">{message}</p> : null}
    </section>
  );
};

export default FacultyMarks;
