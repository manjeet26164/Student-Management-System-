import api from "./api";

export const fetchStudentDashboard = async () => {
  const { data } = await api.get("/student/dashboard");
  return data;
};

export const fetchStudentProfile = async () => {
  const { data } = await api.get("/student/profile");
  return data;
};

export const fetchStudentResults = async () => {
  const { data } = await api.get("/student/results");
  return data;
};

export const fetchStudentAttendance = async () => {
  const { data } = await api.get("/student/attendance");
  return data;
};

export const fetchStudentFees = async () => {
  const { data } = await api.get("/student/fees");
  return data;
};

export const fetchStudentNotifications = async () => {
  const { data } = await api.get("/student/notifications");
  return data;
};

export const fetchStudentDocuments = async () => {
  const { data } = await api.get("/student/documents");
  return data;
};

export const uploadStudentDocument = async (docType, file) => {
  const formData = new FormData();
  formData.append("docType", docType);
  formData.append("document", file);

  const { data } = await api.post("/student/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
