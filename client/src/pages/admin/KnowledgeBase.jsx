import { useEffect, useState } from "react";
import {
  fetchKnowledgeDocs,
  uploadKnowledgeDoc,
  updateKnowledgeDocRoles,
  removeKnowledgeDoc,
} from "../../services/adminService";

const ALL_ROLES = ["student", "faculty", "admin"];

const RoleCheckboxes = ({ selected, onChange }) => (
  <div className="row-actions">
    {ALL_ROLES.map((role) => (
      <label key={role} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type="checkbox"
          checked={selected.includes(role)}
          onChange={(event) => {
            const next = event.target.checked
              ? [...selected, role]
              : selected.filter((r) => r !== role);
            onChange(next);
          }}
        />
        {role}
      </label>
    ))}
  </div>
);

const KnowledgeBase = () => {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [newRoles, setNewRoles] = useState(["student", "faculty", "admin"]);
  const [editRoles, setEditRoles] = useState({}); // { sourceFile: [roles] }
  const [status, setStatus] = useState("");

  const load = async () => {
    const data = await fetchKnowledgeDocs();
    setDocs(data);
    setEditRoles(Object.fromEntries(data.map((d) => [d.sourceFile, d.roles])));
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setStatus("Uploading and embedding...");
    try {
      const result = await uploadKnowledgeDoc(file, newRoles);
      setStatus(result.message);
      setFile(null);
      event.target.reset();
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || "Upload failed");
    }
  };

  const onSaveRoles = async (sourceFile) => {
    await updateKnowledgeDocRoles(sourceFile, editRoles[sourceFile]);
    setStatus(`Roles updated for ${sourceFile}`);
    load();
  };

  const onDelete = async (sourceFile) => {
    await removeKnowledgeDoc(sourceFile);
    load();
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>Upload Rulebook PDF</h2>
        <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>
          Roles are assigned here explicitly and stored in the database — not guessed from the
          filename. You can rename or delete the file later and access control stays correct.
        </p>
        <form className="form-grid compact" onSubmit={onUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files[0])}
            required
          />
          <RoleCheckboxes selected={newRoles} onChange={setNewRoles} />
          <button className="btn-primary" type="submit">
            Upload &amp; Ingest
          </button>
        </form>
        {status && <p style={{ marginTop: "8px" }}>{status}</p>}
      </section>

      <section className="panel">
        <h2>Rulebook Documents</h2>
        <table className="erp-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Chunks</th>
              <th>Visible to</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.sourceFile}>
                <td>{doc.sourceFile}</td>
                <td>{doc.chunkCount}</td>
                <td>
                  <RoleCheckboxes
                    selected={editRoles[doc.sourceFile] || []}
                    onChange={(roles) =>
                      setEditRoles((prev) => ({ ...prev, [doc.sourceFile]: roles }))
                    }
                  />
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn-outline"
                      type="button"
                      onClick={() => onSaveRoles(doc.sourceFile)}
                    >
                      Save Roles
                    </button>
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={() => onDelete(doc.sourceFile)}
                    >
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

export default KnowledgeBase;