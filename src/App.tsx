import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";

export function App() {
  const { data: employees, loading: loadingEmployees, fetchAll: fetchAllEmployees } = useEmployees();
  const { data: paginatedTransactions, loading: loadingPaginatedTransactions, fetchAll: fetchAllPaginatedTransactions, invalidateData: invalidatePaginatedTransactions } = usePaginatedTransactions();
  const { data: transactionsByEmployee, loading: loadingTransactionsByEmployee, fetchById: fetchTransactionsByEmployee, invalidateData: invalidateTransactionsByEmployee } = useTransactionsByEmployee();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const transactions = useMemo(() => {
    if (selectedEmployee && selectedEmployee.id !== EMPTY_EMPLOYEE.id) {
      return transactionsByEmployee;
    }
    return paginatedTransactions?.data ?? null;
  }, [paginatedTransactions, transactionsByEmployee, selectedEmployee]);

  const loadAllTransactions = useCallback(async () => {
    console.log("Loading all transactions...");
    invalidateTransactionsByEmployee();
    await fetchAllPaginatedTransactions();
    console.log("Loaded transactions:", paginatedTransactions?.data);
  }, [fetchAllPaginatedTransactions, invalidateTransactionsByEmployee, paginatedTransactions]);

  const loadTransactionsByEmployee = useCallback(async (employeeId: string) => {
    console.log(`Loading transactions for employee ${employeeId}...`);
    invalidatePaginatedTransactions();
    await fetchTransactionsByEmployee(employeeId);
    console.log("Loaded transactions for employee:", transactionsByEmployee);
  }, [fetchTransactionsByEmployee, invalidatePaginatedTransactions, transactionsByEmployee]);

  useEffect(() => {
    if (employees === null && !loadingEmployees) {
      console.log("Fetching employees...");
      fetchAllEmployees();
    }
  }, [loadingEmployees, employees, fetchAllEmployees]);

  useEffect(() => {
    if (!loadingEmployees && employees !== null) {
      console.log("Employees fetched:", employees);
      loadAllTransactions();
    }
  }, [loadingEmployees, employees, loadAllTransactions]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={loadingEmployees}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return;
            }

            console.log("Selected employee:", newValue);
            setSelectedEmployee(newValue);
            if (newValue.id === EMPTY_EMPLOYEE.id) {
              // Load all transactions when "All Employees" is selected
              await loadAllTransactions();
            } else {
              // Load transactions by employee
              await loadTransactionsByEmployee(newValue.id);
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          {transactions !== null && (
            <Transactions transactions={transactions} />
          )}

          {transactions !== null && paginatedTransactions?.nextPage !== null && (
            <button
              className="RampButton"
              disabled={loadingPaginatedTransactions}
              onClick={async () => {
                await fetchAllPaginatedTransactions();
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
