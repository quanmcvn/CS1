import { useState } from "react";
import { createShortUrl } from "@service/urlShortenerService"

export default function CreateShortUrl() {
	const [url, setUrl] = useState("");
	const [shortId, setShortId] = useState("");
	const [error, setError] = useState("");

	const handleCreateShortUrl = async () => {
		try {
			const response = await createShortUrl(encodeURIComponent(url))
			setShortId(`${response}`);
			setError("")
		} catch (error: any) {
			console.error("Error creating short URL:", error);
			setShortId("");
			setError(error.response.data)
		}
	};

	return (
		<div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full max-w-md">
			<h2 className="text-xl font-semibold text-gray-700 mb-4">
				Create Short URL
			</h2>
			<div className="flex flex-col gap-4">
				<input
					type="text"
					placeholder="Enter URL to shorten"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					className="border rounded-md border-gray-300"
				/>
				<button
					onClick={handleCreateShortUrl}
					className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
				>
					Create Short URL
				</button>
			</div>

			{shortId && (
				<div className="mt-4 bg-green-100 text-green-700 p-3 rounded-md">
					<h2 className="font-medium">Your Short URL:</h2>
					<p>
						{shortId}
					</p>
				</div>
			)}

			{error && (
				<p className="text-red-500 mt-4 text-center font-medium">{error}</p>
			)}
		</div>
	);
};