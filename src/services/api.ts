const API_URL = ""; // теперь используем относительный путь

// Base API service for making requests
// This is a placeholder since there's no backend integration yet
export const fetchData = async (endpoint: string) => {
  const res = await fetch(`/api${endpoint}`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const postData = async (endpoint: string, data: any) => {
  const res = await fetch(`/api${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const updateData = async (endpoint: string, id: string, data: any) => {
  const res = await fetch(`/api${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const deleteData = async (endpoint: string, id: string) => {
  const res = await fetch(`/api${endpoint}/${id}`, {
    method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};
