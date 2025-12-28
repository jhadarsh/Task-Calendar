import { apiRequest } from "./api";

export const createTask = (payload) =>
  apiRequest("/tasks", "POST", payload);

export const getAvailableDates = () =>
  apiRequest("/tasks/available-dates");
