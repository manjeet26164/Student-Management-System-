import api from "./api";

export const askChatbot = async (message) => (await api.post("/chatbot/query", { message })).data;