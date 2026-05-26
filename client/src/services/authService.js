import api from "./api";

export const loginRequest = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const meRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const changePasswordRequest = async (payload) => {
  const { data } = await api.put("/auth/change-password", payload);
  return data;
};
