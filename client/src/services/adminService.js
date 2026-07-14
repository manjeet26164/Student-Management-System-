import api from "./api";

export const fetchStudents = async (page = 1, limit = 20) =>
  (await api.get("/admin/students", { params: { page, limit } })).data;
export const createStudent = async (payload) => (await api.post("/admin/students", payload)).data;
export const updateStudent = async (id, payload) => (await api.put(`/admin/students/${id}`, payload)).data;
export const removeStudent = async (id) => (await api.delete(`/admin/students/${id}`)).data;

export const fetchFaculties = async (page = 1, limit = 20) =>
  (await api.get("/admin/faculties", { params: { page, limit } })).data;
export const createFaculty = async (payload) => (await api.post("/admin/faculties", payload)).data;
export const updateFaculty = async (id, payload) => (await api.put(`/admin/faculties/${id}`, payload)).data;
export const removeFaculty = async (id) => (await api.delete(`/admin/faculties/${id}`)).data;

export const fetchSubjects = async (page = 1, limit = 20) =>
  (await api.get("/admin/subjects", { params: { page, limit } })).data;
export const createSubject = async (payload) => (await api.post("/admin/subjects", payload)).data;
export const updateSubject = async (id, payload) => (await api.put(`/admin/subjects/${id}`, payload)).data;
export const removeSubject = async (id) => (await api.delete(`/admin/subjects/${id}`)).data;

export const uploadMarksByAdmin = async (payload) => (await api.post("/admin/marks", payload)).data;
export const updateAttendanceByAdmin = async (payload) => (await api.post("/admin/attendance", payload)).data;
export const updateFeeByAdmin = async (payload) => (await api.post("/admin/fees", payload)).data;
export const aiQueryStudents = async (query) => (await api.post("/admin/ai/query", { query })).data;