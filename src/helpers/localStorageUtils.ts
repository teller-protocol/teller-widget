export const getItemFromLocalStorage = (key: string) => {
  let value = "";
  if (typeof window !== "undefined") {
    value = localStorage.getItem(key) || "";
  }
  return value;
};

export const setItemInLocalStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage?.setItem(key, value);
  }
};
