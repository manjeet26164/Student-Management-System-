import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchStudentProfile, fetchStudentResults } from "../../services/studentService";

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [profile, setProfile] = useState(null);
  const [semesterInput, setSemesterInput] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    Promise.all([fetchStudentResults(), fetchStudentProfile()]).then(([resultsData, profileData]) => {
      const sorted = [...resultsData].sort((a, b) => Number(a.semester) - Number(b.semester));
      setResults(sorted);
      setProfile(profileData);
    });
  }, []);

  const handleSearch = () => {
    const semester = Number(semesterInput);
    if (!semester) {
      setHasSearched(true);
      setFilteredResults([]);
      return;
    }

    const matched = results.filter((item) => item.semester === semester);
    setFilteredResults(matched);
    setHasSearched(true);
  };

  const handleDownloadPdf = (semesterResult) => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text("Report Card", 105, 10, { align: "center" });
    doc.setFontSize(11);
    doc.text("J.C. Bose University of Science and Technology YMCA", 105, 15, { align: "center" });
    doc.setFont("times", "normal");
    doc.text("Faridabad", 105, 20, { align: "center" });
    doc.setFont("times", "bold");
    doc.text("RESULT-CUM-DETAILED MARKS CARD", 105, 26, { align: "center" });
    doc.text("BACHELOR OF TECHNOLOGY", 105, 31, { align: "center" });
    doc.setFont("times", "normal");
    doc.text(`${profile?.branch || "Information Technology"}`, 105, 36, { align: "center" });
    doc.setFont("times", "bold");
    doc.text(`Semester ${semesterResult.semester} Examination`, 105, 41, { align: "center" });

    doc.setFont("times", "bold");
    doc.text(`Name: ${profile?.user?.fullName || "-"}`, 14, 50);
    doc.text(`Roll Number: ${profile?.rollNumber || "-"}`, 145, 50);
    doc.text(`Branch: ${profile?.branch || "-"}`, 14, 56);
    doc.text(`Batch: ${profile?.batch || "-"}`, 80, 56);
    doc.text(`Section: ${profile?.section || "-"}`, 145, 56);
    doc.setDrawColor(90, 90, 90);
    doc.line(14, 60, 196, 60);

    autoTable(doc, {
      startY: 63,
      styles: { font: "times", fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [232, 232, 232], textColor: [0, 0, 0] },
      theme: "grid",
      head: [["Sr.No.", "Course Code", "Course Title", "Credits", "Marks", "Grade"]],
      body: semesterResult.subjects.map((subject) => [
        semesterResult.subjects.indexOf(subject) + 1,
        subject.subjectCode,
        subject.subjectName,
        subject.credits,
        subject.marks,
        subject.grade,
      ]),
    });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFont("times", "bold");
    doc.text(`SGPA: ${semesterResult.sgpa}`, 14, finalY);
    doc.text(`CGPA: ${semesterResult.cgpa}`, 70, finalY);
    doc.text("Date of Publication: Portal Generated", 120, finalY);

    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.text(
      "Disclaimer: This report card is system generated for portal use. Contact university office for official verification.",
      14,
      finalY + 8
    );

    const safeName = (profile?.user?.fullName || "student").replace(/\s+/g, "_").toLowerCase();
    doc.save(`${safeName}-semester-${semesterResult.semester}-report-card.pdf`);
  };

  const displayResults = hasSearched ? filteredResults : results;

  return (
    <div className="page-grid">
      <section className="panel">
        <h3>Search Semester Result</h3>
        <div className="result-search-row">
          <input
            type="number"
            min="1"
            placeholder="Enter semester number"
            value={semesterInput}
            onChange={(event) => setSemesterInput(event.target.value)}
          />
          <button className="btn-primary" type="button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </section>

      {hasSearched && filteredResults.length === 0 ? (
        <section className="panel">
          <p className="muted">No result found for this semester.</p>
        </section>
      ) : null}

      {displayResults.map((semester) => (
        <section className="panel" key={semester._id}>
          <div className="row-between">
            <h3>Semester {semester.semester} Results</h3>
            <p>
              SGPA: {semester.sgpa} | CGPA: {semester.cgpa}
            </p>
          </div>
          <div className="result-actions">
            <button className="btn-outline" type="button" onClick={() => handleDownloadPdf(semester)}>
              Download PDF
            </button>
          </div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Credits</th>
                  <th>Grade</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {semester.subjects.map((subject, idx) => (
                  <tr key={`${subject.subjectCode}-${idx}`}>
                    <td>{subject.subjectCode}</td>
                    <td>{subject.subjectName}</td>
                    <td>{subject.credits}</td>
                    <td>{subject.grade}</td>
                    <td>{subject.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
};

export default StudentResults;
