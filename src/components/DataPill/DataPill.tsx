import "./dataPill.scss";
import externalLink from "../../assets/external.svg";

interface DataPillProps {
  label?: string;
  logo?: string;
  linkOut?: string;
}

const DataPill: React.FC<DataPillProps> = ({ logo, label, linkOut }) => (
  <div className="data-pill">
    <div className="label">{label}</div>
    {!!logo && <img src={logo} alt={label} />}
    {!!linkOut && (
      <a href={linkOut} target="_blank" rel="noopener noreferrer">
        <img src={externalLink} alt="External link icon" />
      </a>
    )}
  </div>
);

export default DataPill;
