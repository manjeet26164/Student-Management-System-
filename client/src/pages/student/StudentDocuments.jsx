import { useEffect, useMemo, useState } from "react";
import { fetchStudentDocuments, uploadStudentDocument } from "../../services/studentService";

const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const serverBase = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return apiUrl.replace(/\/api\/?$/, "");
  }, []);

  const loadDocuments = async () => {
    const data = await fetchStudentDocuments();
    setDocuments(data);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const onFileSelect = (docType, file) => {
    setSelectedFiles((prev) => ({ ...prev, [docType]: file }));
  };

  const onUpload = async (docType) => {
    const file = selectedFiles[docType];
    setMessage("");
    setError("");

    if (!file) {
      setError("Please choose a PDF file before uploading.");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }

    try {
      await uploadStudentDocument(docType, file);
      setMessage("Document uploaded successfully. Awaiting faculty verification.");
      await loadDocuments();
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || "Failed to upload document");
    }
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>Document Details</h2>
        <p className="muted">
          Upload required documents in PDF format. Status will show Verified only after faculty verification.
        </p>
        {message ? <p className="form-message success">{message}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <div className="document-list">
          {documents.map((doc) => (
            <article className="document-card" key={doc.docType}>
              <div className="row-between">
                <h3>{doc.label}</h3>
                <span className={`status-badge ${doc.status || "not_uploaded"}`}>
                  {doc.status === "verified"
                    ? "Verified"
                    : doc.status === "pending"
                    ? "Uploaded - Pending Verification"
                    : "Not Uploaded"}
                </span>
              </div>

              <p className="muted small-text">Type: PDF</p>

              {doc.uploaded ? (
                <div className="row-actions">
                  <a className="btn-outline" href={`${serverBase}${doc.fileUrl}`} target="_blank" rel="noreferrer">
                    View PDF
                  </a>
                  <label className="btn-outline file-label">
                    Replace PDF
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => onFileSelect(doc.docType, event.target.files?.[0])}
                      hidden
                    />
                  </label>
                  <button className="btn-primary" type="button" onClick={() => onUpload(doc.docType)}>
                    Upload
                  </button>
                </div>
              ) : (
                <div className="row-actions">
                  <label className="btn-outline file-label">
                    Choose PDF
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => onFileSelect(doc.docType, event.target.files?.[0])}
                      hidden
                    />
                  </label>
                  <button className="btn-primary" type="button" onClick={() => onUpload(doc.docType)}>
                    Upload Document
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentDocuments;
