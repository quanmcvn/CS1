import CreateShortUrl from "@components/CreateShortUrl";
import GetOriginalUrl from "@components/GetOriginalUrl";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<h1 className="text-4xl font-bold text-gray-800 mb-8">
				Short URL Service
			</h1>
			<CreateShortUrl />
			<GetOriginalUrl />
		</div>
	);
};