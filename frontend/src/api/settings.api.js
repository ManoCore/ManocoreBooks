import api from "./api";

export const getCompanyDetails = (orgId) => {
  return api.get(`/company/${orgId}`);
};


export const updateCompanyDetails = (orgId, data) => {
  return api.patch(`/company/${orgId}`, data);
};


export const updateCompanyLogo = (orgId, logoFile) => {
  const formData = new FormData();
  formData.append("logo", logoFile);

  return api.patch(`/company/${orgId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
