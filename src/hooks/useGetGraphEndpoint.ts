import { useQuery } from "@tanstack/react-query";

type SubgraphType = "og" | "v1" | "v2" | "uniswap";

type SubgraphEndpointsResponse = Record<string, string>;

export const useGetGraphEndpoint = (
  chainId: string | number,
  type: SubgraphType
) => {
  const { data, isFetched } = useQuery({
    queryKey: ["teller-widget", "getGraphEndpoint", type],
    queryFn: async () => {
      try {
        const res = await fetch(
          `https://subgraph-endpoints-middleware-production.up.railway.app/endpoint?type=${type}`
        );
        const json = (await res.json()) as SubgraphEndpointsResponse;

        return json[chainId.toString()] || null;
      } catch (error: any) {
        console.error(
          `❌ Error fetching graph endpoint with type=${type} for chain=${chainId}: ${error.message}`
        );
        return null;
      }
    },
    enabled: !!chainId && !!type,
  });

  return { endpoint: data || null, isFetched };
};
