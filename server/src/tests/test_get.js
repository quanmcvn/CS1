import axios from 'axios';
import { performance, PerformanceObserver } from 'perf_hooks';
import fs from 'fs';
import { setTimeout } from 'timers/promises';

// Configuration
const CONFIG = {
	BASE_URL: 'http://localhost:6968',
	CONCURRENCY: 1,
	TOTAL_REQUESTS: 1000,
	TEST_DURATION: 0,
	ERROR_THRESHOLD: 0.05,
	REQUEST_TIMEOUT: 5000,
	OUTPUT_FILE: 'results/get_results.json',
	IDS_FILE: 'ids_output.txt'  // File containing short IDs (one per line)
};

// Statistics
const stats = {
	requests: 0,
	successes: 0,
	errors: 0,
	durations: [],
	statusCodes: {},
	startTime: 0,
	endTime: 0
};

// Read short IDs from file
function loadShortIds() {
	try {
		const data = fs.readFileSync(CONFIG.IDS_FILE, 'utf8');
		return data
			.split('\n')
			.map(id => id.trim())
			.filter(id => id.length > 0);  // Remove empty lines
	} catch (err) {
		console.error(`Error reading IDs file: ${err.message}`);
		process.exit(1);
	}
}

const shortIds = loadShortIds();

// Performance observer
const perfObserver = new PerformanceObserver((items) => {
	items.getEntries().forEach((entry) => {
		stats.durations.push(entry.duration);
	});
});
perfObserver.observe({ entryTypes: ['measure'], buffered: true });

// Get a random short ID from the loaded list
function getRandomShortId() {
	return shortIds[Math.floor(Math.random() * shortIds.length)];
}

// Test a single redirect
async function testGet() {
	const shortId = getRandomShortId();
	const startMark = `start-${stats.requests}`;
	performance.mark(startMark);

	try {
		const response = await axios.get(`${CONFIG.BASE_URL}/short/${shortId}`, {
			timeout: CONFIG.REQUEST_TIMEOUT,
			maxRedirects: 0,
			validateStatus: null
		});

		stats.requests++;
		const status = response.status;
		stats.statusCodes[status] = (stats.statusCodes[status] || 0) + 1;

		if (status === 200) {
			stats.successes++;
		} else {
			stats.errors++;
			console.error(`Unexpected status code: ${status} for ID: ${shortId}`);
		}
	} catch (error) {
		stats.requests++;
		stats.errors++;

		if (error.response) {
			const status = error.response.status;
			stats.statusCodes[status] = (stats.statusCodes[status] || 0) + 1;
			console.error(`Error response (${status}) for ID: ${shortId}:`, error.message);
		} else if (error.request) {
			console.error(`No response for ID: ${shortId}:`, error.message);
		} else {
			console.error('Request setup error:', error.message);
		}
	} finally {
		const endMark = `end-${stats.requests}`;
		performance.mark(endMark);
		performance.measure(`request-${stats.requests}`, startMark, endMark);
	}
}

// Run the performance test
async function runPerformanceTest() {
	console.log('Starting redirect performance test...');
	stats.startTime = performance.now();

	const testDurationMs = CONFIG.TEST_DURATION * 1000;
	const startTime = Date.now();
	let completedRequests = 0;

	while (true) {
		const batchPromises = [];

		for (let i = 0; i < CONFIG.CONCURRENCY; i++) {
			if (CONFIG.TOTAL_REQUESTS > 0 && completedRequests >= CONFIG.TOTAL_REQUESTS) {
				break;
			}

			if (CONFIG.TEST_DURATION > 0 && Date.now() - startTime > testDurationMs) {
				break;
			}

			batchPromises.push(testGet());
			completedRequests++;
		}

		if (batchPromises.length === 0) break;

		await Promise.all(batchPromises);

		// Throttle slightly to avoid overwhelming the system
		await setTimeout(100);
	}

	stats.endTime = performance.now();
	printResults();
	saveResults();
}

// Calculate and print test results
function printResults() {
	const totalTime = (stats.endTime - stats.startTime) / 1000; // seconds
	const rps = stats.requests / totalTime;
	const errorRate = stats.errors / stats.requests;

	// Calculate percentiles
	stats.durations.sort((a, b) => a - b);
	const p50 = stats.durations[Math.floor(stats.durations.length * 0.5)];
	const p90 = stats.durations[Math.floor(stats.durations.length * 0.9)];
	const p99 = stats.durations[Math.floor(stats.durations.length * 0.99)];

	console.log('\n=== Redirect Test Results ===');
	console.log(`Total requests: ${stats.requests}`);
	console.log(`Successful redirects: ${stats.successes}`);
	console.log(`Error rate: ${(errorRate * 100).toFixed(2)}%`);
	console.log(`Requests per second: ${rps.toFixed(2)}`);
	console.log(`Total test time: ${totalTime.toFixed(2)}s`);

	console.log('\nStatus code distribution:');
	Object.entries(stats.statusCodes).forEach(([code, count]) => {
		console.log(`  ${code}: ${count} (${((count / stats.requests) * 100).toFixed(1)}%)`);
	});

	console.log('\nResponse times (ms):');
	console.log(`Average: ${(stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length).toFixed(2)}`);
	console.log(`p50: ${p50.toFixed(2)}`);
	console.log(`p90: ${p90.toFixed(2)}`);
	console.log(`p99: ${p99.toFixed(2)}`);

	if (errorRate > CONFIG.ERROR_THRESHOLD) {
		console.warn('\nWARNING: Error rate exceeds threshold!');
	}
}

// Save results to file
function saveResults() {
	const resultData = {
		config: CONFIG,
		stats: {
			...stats,
			totalTime: (stats.endTime - stats.startTime) / 1000,
			rps: stats.requests / ((stats.endTime - stats.startTime) / 1000),
			errorRate: stats.errors / stats.requests
		},
		timestamps: {
			start: new Date(stats.startTime).toISOString(),
			end: new Date(stats.endTime).toISOString()
		}
	};

	fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(resultData, null, 2));
	console.log(`\nResults saved to ${CONFIG.OUTPUT_FILE}`);
}

// Run the test
runPerformanceTest().catch(console.error);