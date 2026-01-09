// src/api/profile.api.js
import api from "./api";

export const getProfile = () => {
  return api.get("/profile");
};


export const updateProfile = (data) => {
  return api.patch("/profile", data);
};


export const changePassword = (data) => {
  return api.post("/profile/change-password", data);
};
