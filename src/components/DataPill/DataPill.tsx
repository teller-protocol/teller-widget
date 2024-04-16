import "./dataPill.scss";

interface DataPillProps {
  label?: string;
  logo?: string;
}

const DataPill: React.FC<DataPillProps> = ({ logo, label }) => (
  <div className="data-pill">
    <div className="label">{label}</div>
    {logo && <img src={logo} alt={label} />}
  </div>
);

export default DataPill;
