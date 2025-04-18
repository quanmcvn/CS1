import { createShortUrlApi, getOriginalUrlApi } from "@api/api";

export const createShortUrl = async (url: string): Promise<string> => {
	return await createShortUrlApi(url);
};

export const getOriginalUrl = async (shortId: string): Promise<string> => {
	return await getOriginalUrlApi(shortId);
};
