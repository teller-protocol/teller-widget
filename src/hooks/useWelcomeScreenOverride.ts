import { useEffect, useState } from "react";
import { getItemFromLocalStorage } from "../helpers/localStorageUtils";

const useWelcomeScreen = (showWelcomeScreenOverride?: boolean) => {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(() => {
    if (typeof showWelcomeScreenOverride === "boolean") {
      return showWelcomeScreenOverride;
    }

    const storedValue = JSON.parse(
      getItemFromLocalStorage("showTellerWidgetWelcomeScreen") || "true"
    );
    return storedValue;
  });

  useEffect(() => {
    if (typeof showWelcomeScreenOverride === "boolean") {
      setShowWelcomeScreen(showWelcomeScreenOverride);
    }
  }, [showWelcomeScreenOverride]);

  return [showWelcomeScreen, setShowWelcomeScreen] as const;
};

export default useWelcomeScreen;