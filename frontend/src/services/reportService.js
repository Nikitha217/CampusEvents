import API from "./api";

/**
 * reportService – /api/reports endpoint.
 *
 * Generated: Was missing. Reports.jsx and admin analytics called
 * API directly inline. Centralised here.
 */
const reportService = {
  getReports: async () => {
    const response = await API.get("/reports");
    return response.data;
  },
};

export default reportService;
