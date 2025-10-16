import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type SubgraphType = "og" | "v1" | "v2" | "uniswap";

type SubgraphEndpointsResponse = Record<string, string>;

export const useGetGraphEndpoint = (
  chainId: string | number,
  type: SubgraphType
) => {
  const [endpoints, setEndpoints] = useState<SubgraphEndpointsResponse | null>(
    null
  );

  useEffect(() => {
    const item = localStorage.getItem(`graph_endpoints--${type}`);
    if (!item) return;
    try {
      const parsed = JSON.parse(item) as SubgraphEndpointsResponse;
      setEndpoints(parsed);
    } catch (error: any) {
      console.error(
        `❌ Error parsing graph endpoints cache for endpoint type=${type}: ${error.message}`
      );
    }
  }, [type]);

  const { isFetched } = useQuery({
    queryKey: ["teller-widget", "getGraphEndpoint", type],
    queryFn: async () => {
      try {
        const res = await fetch(
          `https://subgraph-endpoints-middleware-production.up.railway.app/endpoint?type=${type}`
        );
        const json = (await res.json()) as SubgraphEndpointsResponse;
        if (!json) return null;

        setEndpoints(json);
        localStorage.setItem(`graph_endpoints--${type}`, JSON.stringify(json));

        return json[chainId.toString()] || null;
      } catch (error: any) {
        console.error(
          `❌ Error fetching graph endpoints for endpoint type=${type}: ${error.message}`
        );
        return null;
      }
    },
    enabled: !!chainId && !!type,
  });

  return {
    endpoint: endpoints && endpoints[chainId] ? endpoints[chainId] : null,
    isFetched: !!(endpoints && endpoints[chainId]) || isFetched,
  };
};
