import "./App.css";
import useTable from "./hooks/useTable";
import Table from "./components/Table";
import { ITEMS_PER_PAGE } from "./constants";
import SnackBar from "./components/SnackBar";
import { useState } from "react";
import { SnackBarContext, SnackBarPropsType } from "./context";

function App() {
  const { data, paginatedData, totalPages, deleteRow } = useTable({
    initData: [],
    itemsPerPage: ITEMS_PER_PAGE,
  });
  const [snackBarState, setSnackBarState] = useState<SnackBarPropsType>({
    message: "",
    show:false,
    error :false
  });

  console.log(snackBarState,"snackBarState")

  return (
    <div className="App">
      <div className="App-content">
        <SnackBarContext.Provider
          value={{
            ...snackBarState,
            showAlert: (message: string, error?: boolean) => {
              setSnackBarState((prev) => ({ ...prev, message, error, show:!prev.show }));
            },
          }}
        >
          <Table
            data={data}
            paginatedData={paginatedData}
            totalPages={totalPages}
            deleteRow={deleteRow}
          />
        </SnackBarContext.Provider>
      </div>
      <SnackBar message={snackBarState.message} timeLapse={1} show ={snackBarState.show} error={snackBarState.error} />
    </div>
  );
}

export default App;
