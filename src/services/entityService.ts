
import { fetchData, postData, updateData, deleteData } from './api';

// Generic CRUD operations for entities (groups, teachers, rooms, subjects)
export const fetchEntities = async (entityType: string) => {
  return await fetchData(`/${entityType}`);
};

export const createEntity = async (entityType: string, data: any) => {
  return await postData(`/${entityType}`, data);
};

export const updateEntity = async (entityType: string, id: string, data: any) => {
  return await updateData(`/${entityType}`, id, data);
};

export const deleteEntity = async (entityType: string, id: string) => {
  return await deleteData(`/${entityType}`, id);
};
