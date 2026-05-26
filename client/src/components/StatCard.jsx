const StatCard = ({ label, value, subText }) => (
  <article className="stat-card">
    <p>{label}</p>
    <h3>{value}</h3>
    {subText ? <small>{subText}</small> : null}
  </article>
);

export default StatCard;
