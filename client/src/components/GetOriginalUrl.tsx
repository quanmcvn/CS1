import { useState } from "react";
import { getOriginalUrl } from "@service/urlShortenerService"

export default function GetOriginalUrl() {
	const [shortId, setShortId] = useState("");
	const [originalUrl, setOriginalUrl] = useState("");
	const [error, setError] = useState("");

	const handleGetOriginalUrl = async () => {
		if (!shortId) {
			setError("Please enter a short ID");
			return;
		}

		setError("");

		try {
			const url = await getOriginalUrl(shortId);
			if (!url) {
				setError("URL not found");
				setOriginalUrl("");
				return;
			}
			setOriginalUrl(url);
			// window.open(originalUrl, "_blank");
		} catch (err: any) {
			setError(err);
			setOriginalUrl("");
		}
	};

	return (
		<div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
			<h2 className="text-xl font-semibold text-gray-700 mb-4">
				Get Original URL
			</h2>
			<div className="flex flex-col gap-4">
				<input
					type="text"
					placeholder="Enter Short ID"
					value={shortId}
					onChange={(e) => setShortId(e.target.value)}
					className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					onClick={handleGetOriginalUrl}
					className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
				>
					Get Original URL
				</button>
			</div>

			{originalUrl && (
				<div className="mt-4 bg-green-100 text-green-700 p-3 rounded-md">
					<h2 className="font-medium">Your Original URL:</h2>
					<a href={originalUrl}>
						{originalUrl}
					</a>
				</div>
			)}

			{error && (
				<p className="text-red-500 mt-4 text-center font-medium">{error}</p>
			)}
		</div>
	);
};