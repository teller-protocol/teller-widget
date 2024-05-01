import { formatUnits } from "viem";
import ConfirmationLayout from "../../../components/ConfirmationLayout";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useGetRepaySectionContext } from "../RepaySectionContext";

export const PaymentConfirmation = () => {
  const { paidTokenInput, succesfulTxHash, loan } = useGetRepaySectionContext();

  const title = `Repaid ${numberWithCommasAndDecimals(
    formatUnits(paidTokenInput?.valueBI, paidTokenInput?.token?.decimals)
  )} ${paidTokenInput?.token?.symbol}`;

  return (
    <ConfirmationLayout
      title={title}
      bidId={loan.bidId}
      txHash={succesfulTxHash}
    />
  );
};
