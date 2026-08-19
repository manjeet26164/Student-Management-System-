import { useEffect, useState } from "react";
import {
  createFaculty,
  fetchFaculties,
  fetchSubjects,
  removeFaculty,
  updateFaculty,
} from "../../services/adminService";
import PaginationControls from "../../components/PaginationControls";

const initialForm = {
  fullName: "",
  email: "",
  universityId: "",
  password: "",
  employeeId: "",
  department: "",
  designation: "",
  assignedSubjects: [],
};

const mapFacultyToForm = (faculty) => ({
  fullName: faculty.user?.fullName || "",
  email: faculty.user?.email || "",
  universityId: faculty.user?.universityId || "",
  password: "",
  employeeId: faculty.employeeId || "",
  department: faculty.department || "",
  designation: faculty.designation || "",
  assignedSubjects: (faculty.assignedSubjects || []).map((subject) => subject._id),
});

const ManageFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const loadFaculties = async (targetPage = page) => {
    const data = await fetchFaculties(targetPage, 20);
    setFaculties(data.faculties);
    setPagination(data.pagination);
  };

  const loadSubjectOptions = async () => {
    const data = await fetchSubjects(1, 100);
    setSubjects(data.subjects);
  };

  useEffect(() => {
    loadFaculties(page);
  }, [page]);

  useEffect(() => {
    loadSubjectOptions();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onToggleSubject = (subjectId) => {
    setForm((prev) => ({
      ...prev,
      assignedSubjects: prev.assignedSubjects.includes(subjectId)
        ? prev.assignedSubjects.filter((id) => id !== subjectId)
        : [...prev.assignedSubjects, subjectId],
    }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form };

    if (editingId) {
      await updateFaculty(editingId, payload);
      setMessage("Faculty updated successfully.");
    } else {
      await createFaculty(payload);
      setMessage("Faculty created successfully.");
    }

    resetForm();
    await loadFaculties();
  };

  const onEdit = (faculty) => {
    setEditingId(faculty._id);
    setForm(mapFacultyToForm(faculty));
    setMessage("");
  };

  const onDelete = async (facultyId) => {
    await removeFaculty(facultyId);
    setMessage("Faculty removed successfully.");
    if (editingId === facultyId) resetForm();
    await loadFaculties();
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>{editingId ? "Update Faculty" : "Add Faculty"}</h2>
        <form className="form-grid compact" onSubmit={onSubmit}>
          <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Full name" required />
          <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" required />
          <input name="universityId" value={form.universityId} onChange={onChange} placeholder="University ID" required />
          <input
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder={editingId ? "Password (optional)" : "Password"}
            type="password"
            required={!editingId}
          />
          <input name="employeeId" value={form.employeeId} onChange={onChange} placeholder="Employee ID" required />
          <input name="department" value={form.department} onChange={onChange} placeholder="Department" required />
          <input name="designation" value={form.designation} onChange={onChange} placeholder="Designation" required />

          <div className="subject-tags">
            {subjects.map((subject) => (
              <button
                type="button"
                key={subject._id}
                className={`tag-btn ${form.assignedSubjects.includes(subject._id) ? "active" : ""}`}
                onClick={() => onToggleSubject(subject._id)}
              >
                {subject.code}
              </button>
            ))}
          </div>

          <div className="row-actions">
            <button className="btn-primary" type="submit">
              {editingId ? "Update Faculty" : "Create Faculty"}
            </button>
            {editingId ? (
              <button className="btn-outline" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
        {message ? <p className="form-message success">{message}</p> : null}
      </section>

      <section className="panel">
        <h2>Faculty Records</h2>
        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Assigned Subjects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty._id}>
                  <td>{faculty.user?.fullName}</td>
                  <td>{faculty.employeeId}</td>
                  <td>{faculty.department}</td>
                  <td>{faculty.designation}</td>
                  <td>{(faculty.assignedSubjects || []).map((subject) => subject.code).join(", ") || "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-outline" type="button" onClick={() => onEdit(faculty)}>
                        Edit
                      </button>
                      <button className="btn-danger" type="button" onClick={() => onDelete(faculty._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls pagination={pagination} onPageChange={setPage} />
      </section>
    </div>
  );
};

export default ManageFaculty;