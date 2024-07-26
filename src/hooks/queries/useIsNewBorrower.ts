import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useAccount } from "wagmi";

import { useGraphURL } from "../useGraphURL";
import { getItemFromLocalStorage } from "../../helpers/localStorageUtils";

export const useIsNewBorrower = () => {
  const graphURL = useGraphURL();
  const borrowTermsAccepted = getItemFromLocalStorage("borrowTermsAccepted");

  const { address } = useAccount();

  const isNewBorrower = useMemo(
    () => gql`
        query isNewBorrower_${address} {
          borrowers(
            where: { borrowerAddress: "${address}" }
            first: 1
          ) {
            id
          }
        }
      `,
    [address]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["isNewBorrower", address],
    queryFn: () => request(graphURL, isNewBorrower),
    enabled: !!address || !!borrowTermsAccepted,
  }) as { data: { borrowers: { id: string }[] }; isLoading: boolean };

  return {
    isNewBorrower: !data?.borrowers.length && !borrowTermsAccepted,
    isLoading,
  };
};
