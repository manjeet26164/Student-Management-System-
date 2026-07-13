import { useEffect, useState } from "react";
import { createStudent, fetchStudents, removeStudent, updateStudent } from "../../services/adminService";

const defaultForm = {
  fullName: "",
  email: "",
  universityId: "",
  password: "",
  rollNumber: "",
  branch: "",
  semester: 1,
  section: "A",
  batch: "",
  cgpa: 0,
  totalCredits: 0,
  backlogs: 0,
  phone: "",
  dob: "",
  bloodGroup: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
};

const mapStudentToForm = (student) => ({
  fullName: student.user?.fullName || "",
  email: student.user?.email || "",
  universityId: student.user?.universityId || "",
  password: "",
  rollNumber: student.rollNumber || "",
  branch: student.branch || "",
  semester: student.semester || 1,
  section: student.section || "A",
  batch: student.batch || "",
  cgpa: student.cgpa || 0,
  totalCredits: student.totalCredits || 0,
  backlogs: student.backlogs || 0,
  phone: student.personalInfo?.phone || "",
  dob: student.personalInfo?.dob || "",
  bloodGroup: student.personalInfo?.bloodGroup || "",
  addressLine1: student.address?.line1 || "",
  city: student.address?.city || "",
  state: student.address?.state || "",
  pincode: student.address?.pincode || "",
  guardianName: student.guardian?.name || "",
  guardianRelation: student.guardian?.relation || "",
  guardianPhone: student.guardian?.phone || "",
});

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const data = await fetchStudents();
    setStudents(data.students);
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      await updateStudent(editingId, form);
      setMessage("Student details updated successfully.");
    } else {
      await createStudent(form);
      setMessage("Student created successfully.");
    }

    resetForm();
    await load();
  };

  const onEdit = (student) => {
    setEditingId(student._id);
    setForm(mapStudentToForm(student));
    setMessage("");
  };

  const onDelete = async (id) => {
    await removeStudent(id);
    setMessage("Student removed successfully.");
    if (editingId === id) resetForm();
    await load();
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>{editingId ? "Update Student" : "Add Student"}</h2>
        <form className="form-grid compact" onSubmit={onSubmit}>
          <h3 className="section-title">Login Credentials</h3>
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

          <h3 className="section-title">Academic Information</h3>
          <input name="rollNumber" value={form.rollNumber} onChange={onChange} placeholder="Roll number" required />
          <input name="branch" value={form.branch} onChange={onChange} placeholder="Branch" required />
          <input name="semester" value={form.semester} onChange={onChange} placeholder="Semester" type="number" required />
          <input name="section" value={form.section} onChange={onChange} placeholder="Section" required />
          <input name="batch" value={form.batch} onChange={onChange} placeholder="Batch" required />
          <input name="cgpa" value={form.cgpa} onChange={onChange} placeholder="CGPA" type="number" step="0.01" required />
          <input name="totalCredits" value={form.totalCredits} onChange={onChange} placeholder="Total credits" type="number" required />
          <input name="backlogs" value={form.backlogs} onChange={onChange} placeholder="Backlogs" type="number" required />

          <h3 className="section-title">Personal Information</h3>
          <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" />
          <input name="dob" value={form.dob} onChange={onChange} placeholder="Date of birth (YYYY-MM-DD)" />
          <input name="bloodGroup" value={form.bloodGroup} onChange={onChange} placeholder="Blood group" />

          <h3 className="section-title">Address</h3>
          <input name="addressLine1" value={form.addressLine1} onChange={onChange} placeholder="Address line" />
          <input name="city" value={form.city} onChange={onChange} placeholder="City" />
          <input name="state" value={form.state} onChange={onChange} placeholder="State" />
          <input name="pincode" value={form.pincode} onChange={onChange} placeholder="Pincode" />

          <h3 className="section-title">Guardian Details</h3>
          <input name="guardianName" value={form.guardianName} onChange={onChange} placeholder="Guardian name" />
          <input name="guardianRelation" value={form.guardianRelation} onChange={onChange} placeholder="Relation" />
          <input name="guardianPhone" value={form.guardianPhone} onChange={onChange} placeholder="Guardian phone" />

          <div className="row-actions">
            <button className="btn-primary" type="submit">
              {editingId ? "Update Student" : "Create Student"}
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
        <h2>Student Records</h2>
        <table className="erp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No.</th>
              <th>Branch</th>
              <th>Semester</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.user?.fullName}</td>
                <td>{student.rollNumber}</td>
                <td>{student.branch}</td>
                <td>{student.semester}</td>
                <td>{student.personalInfo?.phone || "-"}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn-outline" type="button" onClick={() => onEdit(student)}>
                      Edit
                    </button>
                    <button className="btn-danger" type="button" onClick={() => onDelete(student._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ManageStudents;
