import { useEffect, useState } from "react";
import {
  createSubject,
  fetchSubjects,
  removeSubject,
  updateSubject,
} from "../../services/adminService";
import PaginationControls from "../../components/PaginationControls";

const subjectInitial = {
  code: "",
  name: "",
  credits: 3,
  semester: 1,
  branch: "",
};

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(subjectInitial);

  const load = async (targetPage = page) => {
    const data = await fetchSubjects(targetPage, 20);
    setSubjects(data.subjects);
    setPagination(data.pagination);
  };

  useEffect(() => {
    load(page);
  }, [page]);

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
        <div className="table-responsive">
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
        </div>
        <PaginationControls pagination={pagination} onPageChange={setPage} />
      </section>
    </div>
  );
};

export default ManageSubjects;