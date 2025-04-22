import http from 'http';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:6968';
const TEST_URL_BASE = 'https://example.com/campaign';
const CREATE_COUNT = 100;
const READ_COUNT = 1000;
const BATCH_SIZE = 1000; // Number of concurrent requests in each batch

function makeRequest(path) {
	return new Promise(resolve => {
		const start = performance.now();
		http.get(`${BASE_URL}${path}`, res => {
			let data = '';
			res.on('data', chunk => (data += chunk));
			res.on('end', () => {
				const duration = performance.now() - start;
				resolve({ data, duration });
			});
		}).on('error', () => resolve(null));
	});
}

async function createShortLinks() {
	const tasks = Array.from({ length: CREATE_COUNT }, (_, i) => {
		const url = `${TEST_URL_BASE}/${i}`;
		return makeRequest(`/create?url=${encodeURIComponent(url)}`);
	});

	const results = await Promise.all(tasks);
	return results.map(r => r?.data).filter(Boolean);
}

async function simulateTraffic(ids) {
	let timings = [];

	const batches = Math.ceil(READ_COUNT / BATCH_SIZE);
	for (let i = 0; i < batches; i++) {
		const batch = Array.from({ length: BATCH_SIZE }, () => {
			const randomId = ids[Math.floor(Math.random() * ids.length)];
			return makeRequest(`/short/${randomId}`);
		});

		const results = await Promise.all(batch);
		results.forEach(r => {
			if (r) timings.push(r.duration);
		});
		console.log(`Batch ${i + 1}/${batches} complete`);
	}

	return timings;
}

(async () => {
	console.log("Phase 1: Creating short links...");
	const ids = await createShortLinks();
	console.log(`Created ${ids.length} links`);

	console.log("Phase 2: Simulating access traffic with concurrency...");
	const timings = await simulateTraffic(ids);

	const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
	const max = Math.max(...timings);
	const min = Math.min(...timings);
	console.log(`Traffic Simulation Complete`);
	console.log(`Requests: ${timings.length}, Avg: ${avg.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
})();
