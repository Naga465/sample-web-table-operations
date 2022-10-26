import { useCallback, useEffect, useRef, useState } from "react";
import { ApiInfoType, APIRequestInfo, callApi, PageData } from "../api";

type Props = {
  initData: ApiInfoType[];
  enablePagination?: boolean;
  itemsPerPage?: number;
};

function useTable({ initData = [], itemsPerPage = 10 }: Props) {
  const [data, setData] = useState(initData);
  const [paginatedData, setPaginatedData] = useState<PageData>({});
  const totalPages = useRef<number>(1);
  const apiData = useRef<ApiInfoType[]>(initData);
  
  useEffect(() => {
    async function fetchApisInfo() {
      try {
        const RequestInfo: APIRequestInfo = {
          method: "GET",
          endpoint: "/apis",
        };
        const data = await callApi(RequestInfo);
        setData(data);
        apiData.current = [...data];
      } catch (err) {
        throw err;
      }
    }
    fetchApisInfo();
  }, []);

  useEffect(() => {
    let page = 1;
    let pageData: PageData = {};
    data.forEach((ele, index) => {
      if (page * itemsPerPage === index) {
        page += 1;
      }
      if (!pageData[page]) {
        pageData[page] = [ele];
      } else {
        pageData[page].push(ele);
      }
    });
    setPaginatedData(pageData);
    totalPages.current = page;
  }, [itemsPerPage, data]);

  const deleteRow = useCallback(async (id: number) => {
    try {
      const RequestInfo: APIRequestInfo = {
        method: "DELETE",
        endpoint: `/apis/${id}`,
      };
      await callApi(RequestInfo);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  const updateRow = useCallback(
    async (id: number, payload: Pick<ApiInfoType, "description">) => {},
    []
  );

  return {
    apiData:apiData.current,
    data,
    paginatedData,
    totalPages: totalPages.current,
    deleteRow,
    setData,
  };
}

export default useTable;
