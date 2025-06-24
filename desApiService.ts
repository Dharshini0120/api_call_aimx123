import axios from "axios";
import { createApiClient } from '../lib/createApiClient';


const DES_BASE_URL = process.env.NEXT_PUBLIC_DES_API_BASE_URL;
// const DES_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
if (!DES_BASE_URL) {
	throw new Error("DES_BASE_URL is not defined");
}
const DesApi = createApiClient(DES_BASE_URL);


const safeRequest = async <T>(promise: Promise<T>) => {
	try {
		const response = await promise;
		return response;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			const responseData = error.response?.data;

			const message =
				responseData?.message ||
				responseData?.error ||
				error.message ||
				"Something went wrong.";

			throw new Error(message);
		}
		throw new Error("Something went wrong. Please try again.");
	}
};


export const desFormGet = (payload: { type: number }) =>
	safeRequest(DesApi.get("/template", { params: payload }));

export const desFormCreate = (payload) =>
	safeRequest(DesApi.post("/template/create", payload));

export const desFormUpdate = (payload) =>
	safeRequest(DesApi.put("/template/update", payload));

export const organizationList = async (payload: { type: number, page: number, pageSize: number, status: number }) => {
	const response = await DesApi.get("/listform", { params: payload });
	return response;
};
export const organizationUpdate = async (payload) => {
	const response = await DesApi.put("/update", payload);
	return response;
};


export const registerCreate = async (payload: unknown) => {
	const response = await DesApi.post("/create", payload);
	return response;
}

export const templateGetList = async () => {
	const response = await DesApi.get("/formtype/list",);
	return response;
};

export const addRating = async (payload: unknown) => {
	const response = await DesApi.post("/docket/rating", payload);
	return response;
}

// export const deactivateOrganization = async (payload) => {
// 	const response = await DesApi.put(`organization/deactivate/${payload}`);
// 	return response;
// };
export const deactivateOrganization = async (
	organizationId: string,
	status: "DEACTIVATED" | string
  ) => {
	return await DesApi.put("/organization/deactivate", undefined, {
	  params: {
		organizationId,
		status,
	  },
	});
  };
export const addlike = async (payload: unknown) => {
	const response = await DesApi.post("/docket/shortlist", payload);
	return response;
}
export const getRatingList = async (payload: { interactionId: string }) => {
	const response = await DesApi.get("/docket/comments", { params: payload });
	return response;
};


export const updateStatusDocket = async (payload) => {
	const response = await DesApi.put("/status/update", payload);
	return response;
};
export const sendforEvaluation = async (payload: unknown) => {
	const response = await DesApi.post("/docket/sendforevaluation", payload);
	return response;
}
export const getDocketMetrics = async (id) => {
	const response = await DesApi.get(`/docketMetrics/${id}`);
	return response;
};

