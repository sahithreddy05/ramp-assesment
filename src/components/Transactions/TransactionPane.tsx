import { useState } from "react";
import { InputCheckbox } from "../InputCheckbox";
import { TransactionPaneComponent } from "./types";

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  const [approved, setApproved] = useState(transaction.approved);

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved} // Pass the approved state to the checkbox
        disabled={loading} // Disable the checkbox when loading
        // Handle the change event of the checkbox
        onChange={async (newValue) => {
        // Persist the new approval state by calling the parent function
          await consumerSetTransactionApproval({
            transactionId: transaction.id,
            newValue,
          });
          
          // Update the local state to reflect the new approval state
          setApproved(newValue);
        }}
      />
    </div>
  );
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
