import { useEffect, useState } from "react";
import { fetchAiClassInsights } from "../services/facultyService";

const healthLabel = { low: "Needs Attention", medium: "Moderate", high: "Healthy" };

const AiClassInsightsCard = () => {
  const [insight, setInsight] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAiClassInsights();
        setInsight(data.insight);
        setStats(data.stats);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load AI class insights right now.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="panel">
      <h3>AI Class Performance Insight</h3>

      {loading ? <p className="muted">Analyzing your class performance...</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      {insight ? (
        <div>
          <span className={`risk-badge risk-${insight.classHealth}`}>
            {healthLabel[insight.classHealth] || insight.classHealth}
          </span>
          <p>{insight.summary}</p>
          <ul>
            {insight.recommendations?.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
          {stats ? (
            <p className="muted">
              {stats.totalStudents} students · avg CGPA {stats.avgCgpa} · avg attendance{" "}
              {stats.avgAttendancePercent}% · {stats.atRiskStudentCount} at risk
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default AiClassInsightsCard;