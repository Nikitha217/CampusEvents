import API from "./api";

/**
 * registrationService – all /api/registrations endpoints.
 *
 * FIX: Added missing cancelRegistration method (was called directly
 *      via API.delete in MyRegistrations without going through the service).
 */
const registrationService = {
  getStudentRegistrations: async (email) => {
    const response = await API.get(`/registrations/student/${email}`);
    return response.data;
  },

  getRegistrationsByEventId: async (eventId) => {
    const response = await API.get(`/registrations/event/${eventId}`);
    return response.data;
  },

  registerForEvent: async (registrationData) => {
    const response = await API.post("/registrations", registrationData);
    return response.data;
  },

  cancelRegistration: async (id) => {
    const response = await API.delete(`/registrations/${id}`);
    return response.data;
  },

  approveRegistration: async (id) => {
    const response = await API.put(`/registrations/${id}/approve`);
    return response.data;
  },

  rejectRegistration: async (id) => {
    const response = await API.put(`/registrations/${id}/reject`);
    return response.data;
  },

  markAttendance: async (id, status) => {
    const response = await API.put(`/registrations/${id}/attendance`, null, {
      params: { status },
    });
    return response.data;
  },

  getAllRegistrations: async () => {
    const response = await API.get("/registrations");
    return response.data;
  },

  searchCoordinatorRegistrations: async (params) => {
    const response = await API.get("/registrations/coordinator/search", { params });
    return response.data;
  }
};

export default registrationService;
