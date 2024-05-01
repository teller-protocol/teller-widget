import { Loan } from "../../hooks/queries/useGetActiveLoansForUser";
import external from "../../assets/external.svg";

import { useChainData } from "../../hooks/useChainName";

import "./loanLink.scss";

interface LoanLinkProps {
  loan: Loan;
}

const LoanLink: React.FC<LoanLinkProps> = ({ loan }) => {
  const { chainName } = useChainData();
  const loanUrl = `https://app.teller.org/${chainName?.toLowerCase()}/loan/${
    loan.bidId
  }`;

  return (
    <a target="_blank" href={loanUrl} rel="noreferrer" className="loan-link">
      Loan #{loan.bidId}
      <img src={external} />
    </a>
  );
};

export default LoanLink;
