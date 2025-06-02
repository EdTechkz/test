
import { fetchData, postData } from './api';

export const fetchSchedule = async () => {
  return await fetchData('/schedule');
};

export const generateSchedule = async (constraints: any) => {
  return await postData('/schedule/generate', constraints);
};

export const saveSchedule = async (schedule: any) => {
  return await postData('/schedule/save', schedule);
};
