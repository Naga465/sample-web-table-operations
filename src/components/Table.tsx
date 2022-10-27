import {
  FC,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ApiInfoType } from "../api";
import { ITEMS_PER_PAGE } from "../constants";
import { SnackBarContext } from "../context";
import useTable from "../hooks/useTable";
import "../styles/table.css";
import TextInput from "./TextInput";

export type TableHeaders = { label: string; apiKey: keyof ApiInfoType };

export type TableProps = {
  headers: TableHeaders[];
  extraContent: TableHeaders[];
};
enum SortBy {
  "ID" = "id",
  "NAME" = "name",
}
enum RowActions {
  View = "view",
  Edit = "edit",
  Delete = "delete",
}

const TableRow = ({
  row,
  index,
  handleDelete,
  handleEdit,
  headers,
  extraContent,
}: {
  row: ApiInfoType;
  index: number;
  handleDelete?: (id: number) => Promise<void>;
  handleEdit?: (id: number) => void;
  headers: TableHeaders[];
  extraContent: TableHeaders[];
}): JSX.Element => {
  const [viewMore, setViewMore] = useState<boolean>(false);

  const handleRowActions = async (event: any) => {
    if (!event.target.id) return;
    switch (event.target.id) {
      case RowActions.View: {
        setViewMore((prev) => !prev);
        break;
      }
      case RowActions.Edit: {
        if (!handleEdit) return;
        handleEdit(row.id);
        break;
      }
      case RowActions.Delete: {
        if (!handleDelete) return;
        await handleDelete(row.id);
        break;
      }
      default: {
      }
    }
  };

  return (
    <>
      <tr key={index}>
        {headers.map(({ apiKey }) => (
          <td key={apiKey}>{row[apiKey].toString()}</td>
        ))}
        <td>
          <div onClick={handleRowActions} className="row-actions">
            <img id={RowActions.Edit} src="/icons/edit.png" />
            <img id={RowActions.Delete} src="/icons/delete.png" />
            <span id={RowActions.View}>View more</span>
          </div>
        </td>
      </tr>
      {viewMore && (
        <tr key={`${index}-collapse`}>
          <td colSpan={headers.length + 1}>
            <div className="row-collapse">
              {extraContent.map((ele, index) => (
                <div>
                  <p className="field-label">{ele.label}</p>
                  <p key={index}>{row[ele.apiKey]?.toString()}</p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const RenderTableBody = ({
  data,
  handleDelete,
  handleEdit,
  headers,
  extraContent,
}: {
  data: ApiInfoType[];
  handleDelete?: (event: any) => Promise<void>;
  handleEdit?: (event: any) => void;
  headers: TableHeaders[];
  extraContent: TableHeaders[];
}): JSX.Element => {
  if (!data) return <Fragment />;

  return (
    <>
      {data.map((row, index) => (
        <TableRow
          key={index}
          row={row}
          index={index}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          headers={headers}
          extraContent={extraContent}
        />
      ))}
    </>
  );
};

const RenderTableHead = ({
  headers,
}: Pick<TableProps, "headers">): JSX.Element => {
  return (
    <tr>
      {headers.map(({ label }) => (
        <td key={label}>{label}</td>
      ))}
      <td></td>
    </tr>
  );
};

const Table: FC<TableProps> = ({ headers, extraContent }) => {
  const [page, setPage] = useState<number>(1);
  const [searchKey, setSearchKey] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.ID);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [rowDetails, setRowDetails] = useState<ApiInfoType | null>(null);

  const {
    data,
    paginatedData,
    totalPages,
    deleteRow,
    setData,
    apiData,
    updateRow,
  } = useTable({
    initData: [],
    itemsPerPage: ITEMS_PER_PAGE,
  });
  const timer = useRef<NodeJS.Timeout>();
  const { showAlert } = useContext(SnackBarContext);

  useEffect(() => {
    if (timer) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      filterByKey();
    }, 500);
    return () => {
      clearTimeout(timer.current);
    };
  }, [searchKey]);

  const onSwitchPage = (event: any) => {
    if (event.target.id === "forward") {
      setPage((page) => page + 1);
      return;
    }
    if (event.target.id === "back") {
      setPage((page) => page - 1);
      return;
    }
  };

  const onUpdateDetails = async () => {
    onToggleModal();
    if (!rowDetails) {
      showAlert("something went wrong", true);
      return;
    }
    try {
      await updateRow(rowDetails.id, { description: rowDetails.description });
      showAlert(`Description for the ${rowDetails.id} updated successfully.`);
    } catch (err) {
      showAlert(err, true);
    }
  };

  const onDeleteRow = async (id: number) => {
    try {
      await deleteRow(id);
      showAlert(`${id} deleted successfully.`);
    } catch (err) {
      showAlert(err, true);
    }
  };

  const onEditRow = (id: number) => {
    const row = paginatedData[page].find((ele) => id === ele.id);
    setRowDetails(row || null);
    onToggleModal();
  };

  const onToggleModal = () => setShowModal((value) => !value);

  const onSearch = (e: any) => {
    setSearchKey(e.target.value);
  };

  const filterByKey = () => {
    setPage(1);
    if (!searchKey) {
      setData(apiData);
      return;
    }
    const _data = apiData.filter((row) => {
      return row.name?.toLowerCase()?.includes(searchKey?.toLowerCase());
    });
    setData(_data);
  };

  const onSort = (e: any) => {
    const value: SortBy = e.target.value;
    let _data = [...data];
    setSortBy(value);
    switch (value) {
      case SortBy.ID: {
        _data.sort((a, b) => a.id - b.id);

        setData(_data);
        break;
      }
      case SortBy.NAME: {
        _data.sort((a, b) => {
          const val1 = a.name.toLowerCase();
          const val2 = b.name.toLowerCase();
          if (val1 < val2) return -1;
          if (val1 > val2) return 1;
          return 0;
        });
        setData(_data);
        break;
      }
      default: {
        console.log("default");
      }
    }
  };
  const onEditDetails = (key: keyof ApiInfoType) => (event: any) => {
    setRowDetails((row) => {
      if (!row) return null;
      return { ...row, [key]: event.target.value };
    });
  };

  const DisplayPageInfo = (): JSX.Element => {
    const pageLength = paginatedData[page]?.length || 1;
    const startCount = ITEMS_PER_PAGE * (page - 1) + 1;
    const endCount = startCount + pageLength - 1;
    return (
      <div className="page-info">
        <label>{`${startCount}-${endCount} of ${data.length}`}</label>
        <div onClick={onSwitchPage} className="page-action">
          <img
            className={page === 1 ? "page-action--disabled" : ""}
            id="back"
            src="/icons/page-back.png"
          />
          <img
            className={page >= totalPages ? "page-action--disabled" : ""}
            id="forward"
            src="/icons/page-forward.png"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="api-table">
      <div className="table-actions">
        <div className="table-action-filters">
          <TextInput
            value={searchKey}
            onChange={onSearch}
            placeholder="Search by name"
          />
          <div className="filter-by-name">
            <label>Sort By : </label>
            <select onChange={onSort} value={sortBy}>
              <option value={SortBy.ID}>ID</option>
              <option value={SortBy.NAME}>Name</option>
            </select>
          </div>
        </div>
        <DisplayPageInfo />
      </div>
      <table>
        <thead>
          <RenderTableHead headers={headers} />
        </thead>
        <tbody>
          {!!paginatedData[page]?.length ? (
            <RenderTableBody
              data={paginatedData[page]}
              handleDelete={onDeleteRow}
              handleEdit={onEditRow}
              extraContent={extraContent}
              headers={headers}
            />
          ) : (
            <tr>
              <td className="table-empty" colSpan={6}>
                {" "}
                {!!searchKey ? `No match found '${searchKey}'` : "Loading..."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showModal && (
        <div className="dialog">
          <div className="dialog-content">
            <h3>{`#${rowDetails?.id} - Update`}</h3>
            <div className="dialog-fields">
              <p>Description</p>
              <TextInput
                value={rowDetails?.description}
                onChange={onEditDetails("description")}
                placeholder="Description"
              />
            </div>
            <div className="dialog-actions">
              <button onClick={onUpdateDetails}>Update</button>
              <button onClick={onToggleModal} className="close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
