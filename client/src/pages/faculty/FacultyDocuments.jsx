import { useEffect, useMemo, useState } from "react";
import { fetchFacultyDocuments, verifyFacultyDocument } from "../../services/facultyService";

const DOC_LABELS = {
  aadhaar: "Aadhaar Card",
  migration: "Migration Certificate",
  marksheet_10: "10th Marksheet",
  marksheet_12: "12th Marksheet",
  bonafide: "Bonafide Certificate",
  nptel: "NPTEL Certificate",
};

const FacultyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");

  const serverBase = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return apiUrl.replace(/\/api\/?$/, "");
  }, []);

  const load = async () => {
    const data = await fetchFacultyDocuments();
    setDocuments(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onVerify = async (documentId) => {
    await verifyFacultyDocument(documentId);
    setMessage("Document verified successfully.");
    await load();
  };

  return (
    <section className="panel">
      <h2>Verify Student Documents</h2>
      <p className="muted">Verify uploaded PDFs. Student sees Verified only after your approval.</p>
      {message ? <p className="form-message success">{message}</p> : null}

      <table className="erp-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Roll Number</th>
            <th>Document</th>
            <th>Status</th>
            <th>File</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc._id}>
              <td>{doc.student?.user?.fullName}</td>
              <td>{doc.student?.rollNumber}</td>
              <td>{DOC_LABELS[doc.docType] || doc.docType}</td>
              <td>{doc.status}</td>
              <td>
                <a className="table-link" href={`${serverBase}${doc.fileUrl}`} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
              </td>
              <td>
                {doc.status === "pending" ? (
                  <button className="btn-primary" type="button" onClick={() => onVerify(doc._id)}>
                    Verify
                  </button>
                ) : (
                  <span className="status-badge verified">Verified</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default FacultyDocuments;
