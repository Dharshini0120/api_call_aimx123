import { createApiClient } from '../lib/createApiClient';

const DATA_SET_BASE_URL = process.env.NEXT_PUBLIC_DATASET_BASE_URL; 
const datasetApi = createApiClient(DATA_SET_BASE_URL);

export const dataSetFileUpload = async (payload: FormData) => {
 
  return await datasetApi.post("/fileupload", payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const dataSetFileDelete = async (payload: { filepath: string }) => {
  const response = await datasetApi.delete("/file/delete", {
    data: payload,
  });
  return response;
};

export const dataSetFilePreview = async (payload: string) => {
  const response = await datasetApi.get(`/file/preview?filepath=${encodeURIComponent(payload)}`)
  return response;
};

export const taggingDatasetList= async () => {
  const response = await datasetApi.get("/sampledatasets")
  return response;
};

