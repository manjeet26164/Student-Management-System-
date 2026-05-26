import api from "./api";

export const fetchFacultyClasses = async () => (await api.get("/faculty/classes")).data;
export const fetchFacultyStudents = async () => (await api.get("/faculty/students")).data;
export const markFacultyAttendance = async (payload) => (await api.post("/faculty/attendance", payload)).data;
export const uploadFacultyMarks = async (payload) => (await api.post("/faculty/marks", payload)).data;
export const fetchFacultyRecords = async () => (await api.get("/faculty/records")).data;
export const fetchFacultyNotifications = async () => (await api.get("/faculty/notifications")).data;
export const fetchFacultyDocuments = async () => (await api.get("/faculty/documents")).data;
export const verifyFacultyDocument = async (documentId) =>
	(await api.put(`/faculty/documents/${documentId}/verify`)).data;
