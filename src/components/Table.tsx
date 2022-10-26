import {
  FC,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ApiInfoType, PageData } from "../api";
import { ITEMS_PER_PAGE } from "../constants";
import { SnackBarContext } from "../context";
import useTable from "../hooks/useTable";
import "../styles/table.css";
import { debounce } from "../utils";
import TextInput from "./TextInput";

type Props = {};

enum SortBy {
  "ID" = "id",
  "NAME" = "name",
}

const headers: { label: string; apiKey: keyof ApiInfoType }[] = [
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

const extraContent: { label: string; apiKey: keyof ApiInfoType }[] = [
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

const TableRow = ({
  row,
  index,
  handleDelete,
  handleEdit,
}: {
  row: ApiInfoType;
  index: number;
  handleDelete?: (id: number) => void;
  handleEdit?: (id: number) => void;
}): JSX.Element => {
  const [viewMore, setViewMore] = useState<boolean>(false);
  const handleRowActions = async (event: any) => {
    if (!event.target.id) return;
    switch (event.target.id) {
      case "view": {
        setViewMore((prev) => !prev);
        break;
      }
      case "edit": {
        if (!handleEdit) return;
        handleEdit(row.id);
        break;
      }
      case "delete": {
        if (!handleDelete) return;
        try {
          await handleDelete(row.id);
        } catch (err) {
          alert(err);
        }
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
            <img id="edit" src="/icons/edit.png" />
            <img id="delete" src="/icons/delete.png" />
            <span id="view">View more</span>
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
}: {
  data: ApiInfoType[];
  handleDelete?: (event: any) => void;
  handleEdit?: (event: any) => void;
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
        />
      ))}
    </>
  );
};

const RenderTableHead = (): JSX.Element => {
  return (
    <tr>
      {headers.map(({ label }) => (
        <td key={label}>{label}</td>
      ))}
      <td></td>
    </tr>
  );
};

const Table: FC<Props> = () => {
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

  const switchPage = (event: any) => {
    if (event.target.id === "forward") {
      setPage((page) => page + 1);
      return;
    }
    if (event.target.id === "back") {
      setPage((page) => page - 1);
      return;
    }
  };

  const DisplayPageInfo = (): JSX.Element => {
    const pageLength = paginatedData[page]?.length || 1;
    const startCount = ITEMS_PER_PAGE * (page - 1) + 1;
    const endCount = startCount + pageLength - 1;
    return (
      <div className="page-info">
        <label>{`${startCount}-${endCount} of ${data.length}`}</label>
        <div onClick={switchPage} className="page-action">
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

  const handleDeleteRow = async (id: number) => {
    try {
      await deleteRow(id);
      showAlert(`${id} deleted successfully.`);
    } catch (err) {
      showAlert(err, true);
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

  const handleEdit = async (id: number) => {
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

  useEffect(() => {
    if (timer) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      filterByKey();
    }, 500);
    return () => {
      clearTimeout(timer.current);
    };
  }, [searchKey]);

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
          <RenderTableHead />
        </thead>
        <tbody>
          <RenderTableBody
            data={paginatedData[page]}
            handleDelete={handleDeleteRow}
            handleEdit={handleEdit}
          />
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
