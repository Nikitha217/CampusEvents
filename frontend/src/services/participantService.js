import API from "./api";

/**
 * participantService – /api/coordinator/participants endpoints.
 */
const participantService = {
  getParticipants: async (params) => {
    const response = await API.get("/coordinator/participants", { params });
    return response.data;
  },

  getParticipantStats: async (params) => {
    const response = await API.get("/coordinator/participants/stats", { params });
    return response.data;
  },

  exportParticipants: async (params) => {
    const response = await API.get("/coordinator/participants/export", { params });
    return response.data;
  }
};

export default participantService;
