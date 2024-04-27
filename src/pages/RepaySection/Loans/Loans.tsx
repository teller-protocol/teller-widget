import { useGetActiveLoansForUser } from "../../../hooks/queries/useGetActiveLoansForUser";
import "./loans.scss";

const LoanRow = () => {
  return <div>LoanRow</div>;
};

const Loans = () => {
  const { allActiveLoans, isLoading } = useGetActiveLoansForUser();
  console.log(
    "TCL ~ file: Loans.tsx:10 ~ Loans ~ allActiveLoans:",
    allActiveLoans
  );
  return (
    <div className="loans">
      <div className="loans-table">div</div>
    </div>
  );
};

export default Loans;
