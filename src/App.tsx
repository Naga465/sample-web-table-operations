import "./App.css";
import Table, { TableHeaders } from "./components/Table";
import SnackBar from "./components/SnackBar";
import { useState } from "react";
import { SnackBarContext, SnackBarPropsType } from "./context";

const headers: TableHeaders[] = [
  {
    label: "ID",
    apiKey: "id",
  },
  {
    label: "NAME",
    apiKey: "name",
  },
  {
    label: "DESCRIPTION",
    apiKey: "description",
  },
];

const extraContent: TableHeaders[] = [
  {
    label: "Create At",
    apiKey: "createdAt",
  },
  {
    label: "Updated At",
    apiKey: "updatedAt",
  },
  {
    label: "Type",
    apiKey: "type",
  },
  {
    label: "Operation Name",
    apiKey: "operationName",
  },
  {
    label: "Query",
    apiKey: "query",
  },
];

function App() {
  const [snackBarState, setSnackBarState] = useState<SnackBarPropsType>({
    message: "",
    show: false,
    error: false,
  });

  return (
    <div className="App">
      <div className="App-content">
        <SnackBarContext.Provider
          value={{
            ...snackBarState,
            showAlert: (message: string, error?: boolean) => {
              setSnackBarState((prev) => ({
                ...prev,
                message,
                error,
                show: !prev.show,
              }));
            },
          }}
        >
          <Table headers={headers} extraContent={extraContent} />
        </SnackBarContext.Provider>
      </div>
      <SnackBar
        message={snackBarState.message}
        timeLapse={1}
        show={snackBarState.show}
        error={snackBarState.error}
      />
    </div>
  );
}

export default App;
