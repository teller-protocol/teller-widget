
import { memo } from 'react';
import { useGetBorrowSectionContext } from "../../pages/BorrowSection/BorrowSectionContext";
import { BORROW_TOKEN_TYPE_ENUM } from "../../pages/BorrowSection/CollateralTokenList/CollateralTokenList";

const ModalTitle = memo(() => {
  const { tokenTypeListView } = useGetBorrowSectionContext();
  
  return (
    <div className="modal-title">
      {tokenTypeListView === BORROW_TOKEN_TYPE_ENUM.STABLE ? "Cash Advance" : "Borrow tokens"}
    </div>
  );
});

ModalTitle.displayName = 'ModalTitle';

export default ModalTitle;
