import { useAccount, useBalance, useReadContract } from "wagmi";
import { UserToken } from "../../hooks/useGetUserTokens";
import { AddressStringType } from "../../types/addressStringType";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { SubgraphTokenType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";

import "./tokenInput.scss";
import TokenLogo from "../TokenLogo";
import { useState } from "react";

export type TokenInputType = {
  value?: number;
  token?: SubgraphTokenType;
  valueBI?: bigint;
};

interface TokenInputProps {
  tokenValue: TokenInputType;
  imageUrl: string | null;
  label?: React.ReactNode;
  sublabel?: string;
  maxAmount?: number;
  showMaxButton?: boolean;
  onChange?: (value: TokenInputType) => void;
  readonly?: boolean;
  limitToMax?: boolean;
  min?: boolean;
  minAmount?: bigint;
}

const TokenInput: React.FC<TokenInputProps> = ({
  tokenValue,
  label,
  maxAmount,
  imageUrl,
  sublabel,
  onChange,
  readonly,
  showMaxButton = true,
  limitToMax = false,
  min = false,
  minAmount,
}) => {
  const [isMin, setIsMin] = useState(false);

  const maxValueBigInt = parseUnits(
    (maxAmount ?? 0)?.toString(),
    tokenValue.token?.decimals ?? 0
  );

  const setMaxValue = () => {
    if (isMin) {
      onChange?.({
        ...tokenValue,
        value: Number(
          formatUnits(minAmount ?? 0n, tokenValue.token?.decimals ?? 0)
        ),
        valueBI: minAmount,
      });
    } else {
      onChange?.({
        ...tokenValue,
        value: maxAmount,
        valueBI: maxValueBigInt,
      });
    }
    min && setIsMin(!isMin);
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    if (!e.currentTarget.value) {
      onChange?.({
        ...tokenValue,
        value: undefined,
        valueBI: BigInt(0),
      });
      return;
    }
    if (limitToMax && maxAmount) {
      if (Number(e.currentTarget.value) > maxAmount) {
        setMaxValue();
        return;
      }
    }
    onChange?.({
      ...tokenValue,
      value: Number(e.currentTarget.value),
      valueBI: parseUnits(
        e.currentTarget.value,
        tokenValue.token?.decimals ?? 0
      ),
    });
  };

  return (
    <div className="token-input-container">
      {label && <label className="section-title">{label}</label>}
      <div className="token-input">
        <input
          type="number"
          value={tokenValue?.value}
          max={Number(tokenValue.value)}
          onChange={handleChange}
          readOnly={readonly}
        />
        {showMaxButton && !!maxAmount && (
          <div className="max-button" onClick={setMaxValue}>
            {isMin ? "MIN" : "MAX"}
          </div>
        )}
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
