import { useMemo } from "react";

import { useContracts } from "./useContracts";
import { useReadContract } from "wagmi";

export const useGetProtocolFee = () => {
  const contracts = useContracts();

  const protocolFeeData = useReadContract({
    ...contracts?.TellerV2,
    functionName: "protocolFee",
    staleTime: Infinity,
  });

  const protocolFeePercent = (protocolFeeData.data as number) ?? 0;

  return useMemo(() => ({ protocolFeePercent }), [protocolFeePercent]);
};
