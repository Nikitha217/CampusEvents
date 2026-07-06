import API from "./api";

const certificateService = {
  getStudentCertificates: async (studentId) => {
    const response = await API.get(`/certificates/student/${studentId}`);
    return response.data;
  },

  generateCertificate: async (certificateData) => {
    const response = await API.post("/certificates/generate", certificateData);
    return response.data;
  },

  getCoordinatorCertificates: async () => {
    const response = await API.get("/coordinator/certificates");
    return response.data;
  },

  getCoordinatorCertificateStats: async () => {
    const response = await API.get("/coordinator/certificates/stats");
    return response.data;
  },

  issueCertificateByToken: async (registrationId) => {
    const response = await API.post(`/coordinator/certificates/issue/${registrationId}`);
    return response.data;
  },

  downloadCertificateByToken: async (registrationId) => {
    const response = await API.get(`/coordinator/certificates/download/${registrationId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default certificateService;
