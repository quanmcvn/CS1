import axios from "axios";

const BASE_URL = "http://localhost:6968";

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 5000,
});

export const createShortUrlApi = async (
	url: string
): Promise<string> => {
	const response = await axiosInstance.post(`/create?url="${url}"`, {
		validateStatus: null
	});
	if (200 <= response.status && response.status < 300) {
		return response.data;
	}
	throw response.data;
};

export const getOriginalUrlApi = async (shortId: string): Promise<string> => {
	if (shortId.includes(' ')) return "";
	const response = await axiosInstance.get(`/short/${shortId}`, {
		validateStatus: null
	});
	if (response.status === 200) {
		return response.data;
	}
	throw response.data;
};
