export type APIRequestInfo = {
  endpoint: string;
  method: string;
  reqBody?: any;
};
export async function callApi({ endpoint, method, reqBody }: APIRequestInfo) {
  const DEFAULT_HEADERS: HeadersInit = {
    "Content-Type": "application/json",
    accept: "application/json",
  };
  try {
    const response = await fetch(endpoint, {
      method,
      headers: DEFAULT_HEADERS,
      body: !!reqBody ? JSON.stringify(reqBody) : undefined,
    });
    if (response.status > 200) {
      console.log(response);
      throw response.statusText;
    }
    const data = await response.json();
    return data;
  } catch (err: any) {
    throw err;
  }
}
export type ApiInfoType = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  operationName: string;
  query: string;
};
export type PageData = { [page: number]: ApiInfoType[] };
