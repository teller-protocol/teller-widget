interface DataFieldsProps {
  label?: string;
  value?: React.ReactNode;
}

import "./dataField.scss";

const DataField: React.FC<DataFieldsProps> = ({ label, value }) => (
  <div>
    {label && <label className="section-title">{label}</label>}
    <div className="data-field">
      <div>{value}</div>
    </div>
  </div>
);

export default DataField;
