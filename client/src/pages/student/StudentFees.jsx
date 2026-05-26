import { useEffect, useState } from "react";
import { fetchStudentFees } from "../../services/studentService";

const StudentFees = () => {
  const [fees, setFees] = useState(null);

  useEffect(() => {
    fetchStudentFees().then(setFees);
  }, []);

  if (!fees) return <div className="page-loader">Loading fee details...</div>;

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Fee</p>
          <h3>INR {fees.summary.total}</h3>
        </article>
        <article className="stat-card">
          <p>Paid</p>
          <h3>INR {fees.summary.paid}</h3>
        </article>
        <article className="stat-card">
          <p>Pending</p>
          <h3>INR {fees.summary.pending}</h3>
        </article>
      </section>

      <section className="panel">
        <h3>Semester Fee Breakdown</h3>
        <table className="erp-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {fees.records.map((fee) => (
              <tr key={fee._id}>
                <td>{fee.semester}</td>
                <td>{fee.totalAmount}</td>
                <td>{fee.paidAmount}</td>
                <td>{fee.status}</td>
                <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Transaction History</h3>
        <div className="list-rows">
          {fees.records.flatMap((fee) =>
            fee.transactions.map((txn, idx) => (
              <div className="list-row" key={`${fee._id}-${idx}`}>
                <p>
                  Sem {fee.semester} | {txn.mode} | {txn.reference}
                </p>
                <strong>
                  INR {txn.amount} on {new Date(txn.paidOn).toLocaleDateString()}
                </strong>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentFees;
