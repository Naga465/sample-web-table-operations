import "./App.css";
import useTable from "./hooks/useTable";
import Table from "./components/Table";
import { ITEMS_PER_PAGE } from "./constants";
import SnackBar from "./components/SnackBar";
import { useState } from "react";
import { SnackBarContext, SnackBarPropsType } from "./context";

function App() {
 
  const [snackBarState, setSnackBarState] = useState<SnackBarPropsType>({
    message: "",
    show:false,
    error :false
  });

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
          <Table/>
        </SnackBarContext.Provider>
      </div>
      <SnackBar message={snackBarState.message} timeLapse={1} show ={snackBarState.show} error={snackBarState.error} />
    </div>
  );
}

export default App;
