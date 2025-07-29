import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { getItemFromLocalStorage } from "../../helpers/localStorageUtils";
import { useGraphURL } from "../useGraphURL";

export const useIsNewBorrower = () => {
  const graphURL = useGraphURL();
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const borrowTermsAccepted = JSON.parse(
      getItemFromLocalStorage("borrowTermsAccepted") || "false"
    ) as boolean;
    setShowTerms(!borrowTermsAccepted);
  }, []);

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
    queryKey: ["teller-widget", "isNewBorrower", address],
    queryFn: () => request(graphURL, isNewBorrower),
    enabled: !!address,
  }) as { data: { borrowers: { id: string }[] }; isLoading: boolean };

  return {
    isNewBorrower: !data?.borrowers.length && showTerms,
    isLoading,
  };
};
