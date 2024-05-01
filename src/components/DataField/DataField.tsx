import cx from "classnames";

interface DataFieldsProps {
  label?: string;
  classNames?: string;
  children?: React.ReactNode;
}

import "./dataField.scss";

const DataField: React.FC<DataFieldsProps> = ({
  label,
  children,
  classNames,
}) => (
  <div className={cx("data-field-container", classNames)}>
    {label && <label className="section-title">{label}</label>}
    <div className="data-field">{children}</div>
  </div>
);

export default DataField;
