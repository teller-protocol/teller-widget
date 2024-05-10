export const convertSecondsToDays = (seconds?: number) => {
  return (seconds ?? 0) / 86400;
};

export const formatTimestampToShortDate = (timestamp: string) => {
  const timestampInDate = new Date(+timestamp * 1000);
  return timestampInDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
