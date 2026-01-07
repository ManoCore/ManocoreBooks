import { signupapi, loginapi } from "../../api/api";

export const signupService = async (data) => {
  const res = await signupapi(data);
  return res.data;
};

export const loginService = async (data) => {
  const res = await loginapi(data);
  return res.data;
};