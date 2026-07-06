import API from "./api";

export const getAuditLogs = async () => {

  const response =
    await API.get("/audit-logs");

  return response.data;
};