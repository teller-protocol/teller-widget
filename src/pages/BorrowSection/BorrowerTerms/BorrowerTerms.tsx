import { useMemo, useState } from "react";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Checkbox from "../../../components/Checkbox";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";

import "./borrowerTerms.scss";
import { setItemInLocalStorage } from "../../../helpers/localStorageUtils";

const BorrowerTerms: React.FC = () => {
  const { setCurrentStep } = useGetBorrowSectionContext();

  const [checkboxes, setCheckboxes] = useState({
    0: {
      key: "0",
      label: (
        <div>
          Once my cash advance repayment is made in full, my collateral will be
          transferred back to my wallet.
        </div>
      ),
      checked: false,
    },
    1: {
      key: "1",
      label: (
        <div>
          I understand that Teller is a decentralized protocol, operating as
          open source software.
        </div>
      ),
      checked: false,
    },
    2: {
      key: "2",
      label: (
        <div>
          All my collateral will be <b>liquidated</b> if I do not repay my cash
          advance on time.
        </div>
      ),
      checked: false,
    },
    3: {
      key: "3",
      label: (
        <div>
          If my cash advance includes multiple repayments, my collateral will be{" "}
          <b>liquidated</b> if any payment is late.
        </div>
      ),
      checked: false,
    },
  });

  const allChecked = useMemo(
    () =>
      Object.values(checkboxes).every((c: { checked: boolean }) => c.checked),
    [checkboxes]
  );

  const handleOnClick = () => {
    setItemInLocalStorage("borrowTermsAccepted", "true");
    setCurrentStep(BorrowSectionSteps.OPPORTUNITY_DETAILS);
  };

  return (
    <div className="borrower-terms">
      <BackButton
        onClick={() => setCurrentStep(BorrowSectionSteps.OPPORTUNITY_DETAILS)}
      />
      <h1 className="borrower-terms-title">Borrower Terms:</h1>
      {Object.values(checkboxes).map((checkbox) => (
        <Checkbox
          key={checkbox.key}
          checked={checkbox.checked}
          label={checkbox.label}
          setChecked={() => {
            setCheckboxes((prev) => ({
              ...prev,
              [checkbox.key]: { ...checkbox, checked: !checkbox.checked },
            }));
          }}
        />
      ))}
      <Button
        isFullWidth
        label="I understand how it works"
        onClick={handleOnClick}
        disabled={!allChecked}
      />
      <div className="paragraph">
        <a
          href="https://docs.teller.org/teller-lite/borrowing-on-teller"
          target="_blank"
          rel="noreferrer"
        >
          Read more here
        </a>
      </div>
    </div>
  );
};

export default BorrowerTerms;
