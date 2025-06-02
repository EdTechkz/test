const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Base API service for making requests
// This is a placeholder since there's no backend integration yet
export const fetchData = async (endpoint: string) => {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const postData = async (endpoint: string, data: any) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const updateData = async (endpoint: string, id: string, data: any) => {
  const res = await fetch(`${API_URL}${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const deleteData = async (endpoint: string, id: string) => {
  const res = await fetch(`${API_URL}${endpoint}/${id}`, {
    method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};
