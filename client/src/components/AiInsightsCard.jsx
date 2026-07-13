import { useEffect, useState } from "react";
import { fetchAiInsights } from "../services/studentService";

const riskLabel = { low: "Low Risk", medium: "Medium Risk", high: "High Risk" };

const AiInsightsCard = () => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAiInsights();
        setInsight(data.insight);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load AI insights right now.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="panel">
      <h3>AI Performance Insight</h3>

      {loading ? <p className="muted">Analyzing your academic record...</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      {insight ? (
        <div>
          <span className={`risk-badge risk-${insight.riskLevel}`}>
            {riskLabel[insight.riskLevel] || insight.riskLevel}
          </span>
          <p>{insight.summary}</p>
          <ul>
            {insight.recommendations?.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};

export default AiInsightsCard;