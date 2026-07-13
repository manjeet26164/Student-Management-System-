import { useState } from "react";
import { aiQueryStudents } from "../services/adminService";

const AiSearchPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await aiQueryStudents(query);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || "AI search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h3>AI Student Search</h3>
      <p className="muted">
        Ask in plain English — e.g. "CGPA below 6 in CSE" or "students in semester 4 with backlogs"
      </p>

      <form className="form-grid compact" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Ask about students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error ? <p className="form-message error">{error}</p> : null}

      {results ? (
        <div className="ai-results">
          <p className="muted">{results.count} student(s) found</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>University ID</th>
                <th>Branch</th>
                <th>Semester</th>
                <th>CGPA</th>
                <th>Backlogs</th>
              </tr>
            </thead>
            <tbody>
              {results.students.map((s) => (
                <tr key={s._id}>
                  <td>{s.user?.fullName}</td>
                  <td>{s.user?.universityId}</td>
                  <td>{s.branch}</td>
                  <td>{s.semester}</td>
                  <td>{s.cgpa}</td>
                  <td>{s.backlogs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default AiSearchPanel;