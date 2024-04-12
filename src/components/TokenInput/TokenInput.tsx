import { useAccount, useBalance, useReadContract } from "wagmi";
import { UserToken } from "../../hooks/useGetUserTokens";
import { AddressStringType } from "../../types/addressStringType";
import { erc20Abi } from "viem";
import { SubgraphTokenType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";

import "./tokenInput.scss";
import TokenLogo from "../TokenLogo";

export type TokenInputType = {
  value?: number;
  token?: SubgraphTokenType;
  valueBI?: bigint;
};

interface TokenInputProps {
  tokenValue: TokenInputType;
  imageUrl: string;
  label?: string;
  showMaxButton?: boolean;
  sublabel?: string;
}

const TokenInput: React.FC<TokenInputProps> = ({
  tokenValue,
  label,
  showMaxButton,
  imageUrl,
  sublabel,
}) => {
  const { address } = useAccount();
  const { data } = useReadContract({
    address: tokenValue.token?.address as AddressStringType,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? "0x"],
  });

  console.log("TCL ~ file: TokenInput.tsx:30 ~ tokenBalance:", data);

  return (
    <div className="token-input-container">
      <label className="section-title">{label}</label>
      <div className="token-input">
        <input type="number" value={tokenValue?.value} /* max={} */ />
        {showMaxButton && <div className="max-button">MAX</div>}
        <div className="token-info">
          <TokenLogo logoUrl={imageUrl} size={20} />
          <span className="token-info-symbol">{tokenValue.token?.symbol}</span>
        </div>
      </div>
      {sublabel && <div className="sublabel section-sub-title">{sublabel}</div>}
    </div>
  );
};

export default TokenInput;
