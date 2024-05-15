import Button from "../../../components/Button";
import Loader from "../../../components/Loader";
import {
  Loan,
  useGetActiveLoansForUser,
} from "../../../hooks/queries/useGetActiveLoansForUser";
import { useGetTokenMetadata } from "../../../hooks/useGetTokenMetadata";
import { LoanRow } from "./LoanRow";
import "./loans.scss";

const Loans = () => {
  const { allActiveLoans, isLoading } = useGetActiveLoansForUser();
  return (
    <div className="loans">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {allActiveLoans?.length ? (
            <>
              <div className="loans-table">
                <div className="loans-table-header">
                  <div className="loans-table-header-item">Status</div>
                  <div className="loans-table-header-item">Owed</div>
                  <div className="loans-table-header-item">Due</div>
                </div>
                <div className="loans-table-body">
                  {allActiveLoans?.map((loan: Loan) => (
                    <LoanRow loan={loan} key={loan.bidId} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="paragraph no-loans">
              You currently do not have any active loans
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Loans;
