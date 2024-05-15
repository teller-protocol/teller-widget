import cx from "classnames";
import { LoanStatus } from "../../hooks/queries/useGetActiveLoansForUser";

import "./statusBadge.scss";

interface StatusBadgeProps {
  status: LoanStatus | "due soon";
}

const mapStatusToDisplay: { [key: string]: string } = {
  [LoanStatus.DEFAULTED]: "Defaulted",
  [LoanStatus.ACCEPTED]: "On Time",
  ["due soon"]: "Due Soon",
  [LoanStatus.LATE]: "Late",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClass = status === "due soon" ? "dueSoon" : status;
  console.log("TCL ~ file: StatusBadge.tsx:19 ~ statusClass:", statusClass);
  return (
    <div className={cx("status-badge", statusClass)}>
      {mapStatusToDisplay[status]}
    </div>
  );
};

export default StatusBadge;
