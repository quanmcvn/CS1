import http from 'http';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:6968';
const TEST_URL_BASE = 'https://example.com/campaign';
const CREATE_COUNT = 100;
const READ_COUNT = 1000;

function makeRequest(path, callback) {
	const start = performance.now();
	http.get(`${BASE_URL}${path}`, res => {
		let data = '';
		res.on('data', chunk => (data += chunk));
		res.on('end', () => {
			const duration = performance.now() - start;
			callback(null, { data, duration });
		});
	}).on('error', err => {
		callback(err);
	});
}

async function createShortLinks() {
	return Promise.all(
		Array.from({ length: CREATE_COUNT }, (_, i) => {
			const url = `${TEST_URL_BASE}/${i}`;
			return new Promise(resolve => {
				makeRequest(`/create?url=${encodeURIComponent(url)}`, (err, result) => {
					if (err) resolve(null);
					else resolve(result.data);
				});
			});
		})
	);
}

async function simulateTraffic(ids) {
	let timings = [];

	await Promise.all(
		Array.from({ length: READ_COUNT }, () => {
			const randomId = ids[Math.floor(Math.random() * ids.length)];
			return new Promise(resolve => {
				makeRequest(`/short/${randomId}`, (err, result) => {
					if (!err) timings.push(result.duration);
					resolve();
				});
			});
		})
	);

	return timings;
}

(async () => {
	console.log("Phase 1: Creating short links...");
	const ids = (await createShortLinks()).filter(Boolean);
	console.log(`Created ${ids.length} links`);

	console.log("Phase 2: Simulating access traffic...");
	const timings = await simulateTraffic(ids);

	const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
	const max = Math.max(...timings);
	const min = Math.min(...timings);
	console.log(`Traffic Simulation Complete`);
	console.log(`Requests: ${timings.length}, Avg: ${avg.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
})();
