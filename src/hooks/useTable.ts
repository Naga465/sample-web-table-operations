import { useCallback, useEffect, useState } from "react";
import { ApiInfoType, APIRequestInfo, callApi, PageData } from "../api";

type Props = {
  initData: ApiInfoType[];
  enablePagination?: boolean;
  itemsPerPage?: number;
};

function useTable({ initData = [], itemsPerPage }: Props) {
  const [data, setData] = useState(initData);
  const [paginatedData, setPaginatedData] = useState<PageData>({});
  const [totalPages, setTotalPages] = useState<number>(1);
  useEffect(() => {
    async function fetchApisInfo() {
      try {
        const RequestInfo: APIRequestInfo = {
          method: "GET",
          endpoint: "/apis",
        };
        const data = await callApi(RequestInfo);
        setData(data);
      } catch (err) {
        throw err;
      }
    }
    fetchApisInfo();
  }, []);

  useEffect(() => {
    if (!itemsPerPage || !data.length) return;
    let page = 1;
    let pageData: PageData = {};
    data.forEach((ele, index) => {
      if (page * itemsPerPage === index) {
        page += 1;
      }
      if (!pageData[page]) {
        pageData[page] = [ele];
        return;
      }
      pageData[page].push(ele);
    });
    setPaginatedData(pageData);
    setTotalPages(page);
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

  return { data, paginatedData, totalPages, deleteRow };
}

export default useTable;
