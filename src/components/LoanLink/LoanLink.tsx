import { Loan } from "../../hooks/queries/useGetActiveLoansForUser";
import external from "../../assets/external.svg";

import { useChainData } from "../../hooks/useChainData";

import "./loanLink.scss";
import { normalizeChainName } from "../../constants/chains";

interface LoanLinkProps {
  loan: Loan;
}

const LoanLink: React.FC<LoanLinkProps> = ({ loan }) => {
  const { chainName } = useChainData();
  const loanUrl = `https://app.teller.org/${normalizeChainName(
    chainName
  )}/loan/${loan.bidId}`;

  return (
    <a target="_blank" href={loanUrl} rel="noreferrer" className="loan-link">
      Loan #{loan.bidId}
      <img src={external} />
    </a>
  );
};

export default LoanLink;
