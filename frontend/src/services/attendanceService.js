import API from "./api";

/**
 * attendanceService – /api/coordinator/attendance endpoints.
 */
const attendanceService = {
  getEvents: async () => {
    const response = await API.get("/coordinator/attendance/events");
    return response.data;
  },

  getParticipants: async (eventId) => {
    const response = await API.get("/coordinator/attendance/participants", { params: { eventId } });
    return response.data;
  },

  getStats: async (eventId) => {
    const response = await API.get("/coordinator/attendance/stats", { params: { eventId } });
    return response.data;
  },

  bulkMarkAttendance: async (registrationIds, status) => {
    const response = await API.put("/coordinator/attendance/bulk", { registrationIds, status });
    return response.data;
  }
};

export default attendanceService;
