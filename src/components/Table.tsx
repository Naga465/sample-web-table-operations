import { FC, Fragment, useContext, useState } from "react";
import { ApiInfoType, PageData } from "../api";
import { ITEMS_PER_PAGE } from "../constants";
import { SnackBarContext } from "../context";
import "../styles/table.css";
import TextInput from "./TextInput";

type Props = {
  data: ApiInfoType[];
  paginatedData: PageData;
  totalPages: number;
  deleteRow:(id:number) => void
};

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
  handleDelete
}: {
  row: ApiInfoType;
  index: number;
  handleDelete?:(id:number) => void
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
        break;
      }
      case "delete": {
          if(!handleDelete) return;
          try{
            await handleDelete(row.id)
          }catch(err){
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
  handleDelete
}: {
  data: ApiInfoType[];
  handleDelete?: (event: any) => void;
}): JSX.Element => {
  if (!data) return <Fragment />;

  return (
    <>
      {data.map((row, index) => (
        <TableRow key={index} row={row} index={index} handleDelete={handleDelete} />
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

const Table: FC<Props> = ({ data, paginatedData, totalPages,deleteRow }: Props) => {
  const [page, setPage] = useState<number>(1);
  const _context =  useContext(SnackBarContext);
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

  const  handleDeleteRow = async (id:number) => { 
    try{
      await deleteRow(id);
    }catch(err){
      _context.showAlert(err, true)
    }
  }

  return (
    <div className="api-table">
      <div className="table-actions">
        <TextInput />
        <DisplayPageInfo />
      </div>
      <table>
        <thead>
          <RenderTableHead />
        </thead>
        <tbody>
          <RenderTableBody data={paginatedData[page]} handleDelete={handleDeleteRow} />
        </tbody>
      </table>
    </div>
  );
};

export default Table;
