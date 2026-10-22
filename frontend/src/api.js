// import axios from "axios";
// const api = axios.create({ baseURL: "http://127.0.0.1:8000/api", timeout: 120000 });
// export const uploadCsv = async (file) => { const form = new FormData(); form.append("file", file); return (await api.post("/upload", form)).data; };
// export const loadSample = async () => (await api.post("/sample")).data;
// export const analyze = async (payload) => (await api.post("/analyze", payload)).data;
// export const repair = async (actions) => (await api.post("/repair", { actions })).data;
// export const repairedUrl = "http://127.0.0.1:8000/api/download/repaired";
// export const reportUrl = "http://127.0.0.1:8000/api/download/report";


import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 120000,
});

export const uploadCsv = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const response = await api.post("/upload", form);
  return response.data;
};

export const loadSample = async () => {
  const response = await api.post("/sample");
  return response.data;
};

export const analyze = async (payload = {}) => {
  const response = await api.post("/analyze", payload);
  return response.data;
};

export const repair = async (actions = []) => {
  const response = await api.post("/repair", { actions });
  return response.data;
};

export const repairedUrl =
  "http://127.0.0.1:8000/api/download/repaired";

export const reportUrl =
  "http://127.0.0.1:8000/api/download/report";