import API from "./api";

/**
 * eventService – all /api/events endpoints.
 *
 * FIX: Added missing methods: updateEvent, deleteEvent, activateEvent,
 *      completeEvent, searchEvents, getEventsByCategory.
 *      These were called directly via API.put/delete in ManageEvents
 *      without a service layer.
 */
const eventService = {
  getAllEvents: async () => {
    const response = await API.get("/events");
    return response.data;
  },

  getApprovedEvents: async () => {
    const response = await API.get("/events/approved");
    return response.data;
  },

  getPendingEvents: async () => {
    const response = await API.get("/events/pending");
    return response.data;
  },

  getMyEvents: async () => {
    const response = await API.get("/events/my-events");
    return response.data;
  },

  getEventById: async (id) => {
    const response = await API.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await API.post("/events", eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await API.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await API.delete(`/events/${id}`);
    return response.data;
  },

  approveEvent: async (id) => {
    const response = await API.put(`/events/${id}/approve`);
    return response.data;
  },

  rejectEvent: async (id) => {
    const response = await API.put(`/events/${id}/reject`);
    return response.data;
  },

  activateEvent: async (id) => {
    const response = await API.put(`/events/${id}/activate`);
    return response.data;
  },

  completeEvent: async (id) => {
    const response = await API.put(`/events/${id}/complete`);
    return response.data;
  },

  searchEvents: async ({ title, category } = {}) => {
    const params = {};
    if (title) params.title = title;
    if (category) params.category = category;
    const response = await API.get("/events/search", { params });
    return response.data;
  },

  getEventsByCategory: async (categoryId) => {
    const response = await API.get(`/events/category/${categoryId}`);
    return response.data;
  },
};

export default eventService;
