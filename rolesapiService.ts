import { createApiClient } from '../lib/createApiClient';

const ROLE_BASE_URL = process.env.NEXT_PUBLIC_ROLE_BASE_URL;
const rolesApi = createApiClient(ROLE_BASE_URL);

export const roleAdd = async (payload) => {
	const response = await rolesApi.post("/", payload);
	return response;
};
export const roleUpdate = async (payload) => {
	const response = await rolesApi.put("/", payload);
	return response;
};
export const roleList = async () => {
	const response = await rolesApi.get("/");
	return response;
};
export const roleDelete = async (id: string) => {
	const response = await rolesApi.delete(`/${id}`);
	return response;
}
export const moduleList = async () => {
	const response = await rolesApi.get("/modules");
	return response;
}
export const permissionList = async () => {
	const response = await rolesApi.get("/permissions");
	return response;
}
export const addPermission = async (payload) => {
	const response = await rolesApi.post("/rolePermission/bulk", payload);
	return response;
}

export const getPermissionData = async (id: string) => {
	const response = await rolesApi.get(`/getRoleDetails/${id}`);
	return response;
}

export const updatePermissionData = async (payload) => {
	const response = await rolesApi.post("/rolePermission/bulk-update", payload);
	return response;
}




