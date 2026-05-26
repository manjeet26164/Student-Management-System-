import { useEffect, useState } from "react";
import {
  createSubject,
  fetchSubjects,
  removeSubject,
  updateSubject,
} from "../../services/adminService";

const subjectInitial = {
  code: "",
  name: "",
  credits: 3,
  semester: 1,
  branch: "",
};

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(subjectInitial);

  const load = async () => {
    const data = await fetchSubjects();
    setSubjects(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    await createSubject(form);
    setForm(subjectInitial);
    load();
  };

  const onDelete = async (id) => {
    await removeSubject(id);
    load();
  };

  const increaseCredits = async (subject) => {
    await updateSubject(subject._id, { credits: Number(subject.credits) + 1 });
    load();
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>Add Subject</h2>
        <form className="form-grid compact" onSubmit={onSubmit}>
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              name={key}
              value={value}
              onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
              placeholder={key}
              required
            />
          ))}
          <button className="btn-primary" type="submit">
            Create Subject
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Subject List</h2>
        <table className="erp-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject._id}>
                <td>{subject.code}</td>
                <td>{subject.name}</td>
                <td>{subject.credits}</td>
                <td>{subject.semester}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn-outline" type="button" onClick={() => increaseCredits(subject)}>
                      + Credit
                    </button>
                    <button className="btn-danger" type="button" onClick={() => onDelete(subject._id)}>
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

export default ManageSubjects;
