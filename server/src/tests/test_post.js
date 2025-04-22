import axios from 'axios';
import { performance, PerformanceObserver } from 'perf_hooks';
import { URL } from 'url';
import fs from 'fs';
import { setTimeout } from 'timers/promises';

// Configuration
const CONFIG = {
	BASE_URL: 'http://localhost:6968',
	CONCURRENCY: 1,               // Parallel requests
	TOTAL_REQUESTS: 1000,          // Total requests to make
	TEST_DURATION: 0,             
	ERROR_THRESHOLD: 0.05,         
	REQUEST_TIMEOUT: 5000,         // ms
	OUTPUT_FILE: 'results/post_results.json'    // File to save results
};

// Statistics
const stats = {
	requests: 0,
	successes: 0,
	errors: 0,
	results: {

	},
	durations: [],
	startTime: 0,
	endTime: 0,
};

// Performance observer
const perfObserver = new PerformanceObserver((items) => {
	items.getEntries().forEach((entry) => {
		stats.durations.push(entry.duration);
	});
});
perfObserver.observe({ entryTypes: ['measure'], buffered: true });

// Generate random URL with different paths and parameters
function generateRandomUrl() {
	const paths = ['', 'shop', 'blog', 'about', 'contact'];
	const params = ['utm_source=test', 'ref=perftest', `sessionId=${Math.random().toString(36).substring(7)}`];

	const url = new URL(`https://example.com/${paths[Math.floor(Math.random() * paths.length)]}`);
	url.search = params[Math.floor(Math.random() * params.length)];
	return url.toString();
}

// Test a single URL shortening and redirection
async function testPost(url) {
	const startMark = `start-${stats.requests}`;
	performance.mark(startMark);

	try {
		// Shorten the URL
		const shortUrl = `${CONFIG.BASE_URL}/create?url=${encodeURIComponent(url)}`;
		const shortenResponse = await axios.post(shortUrl, {
			timeout: CONFIG.REQUEST_TIMEOUT,
			maxRedirects: 0,
			validateStatus: (status) => status >= 200 && status < 500
		});

		stats.requests++;

		if (shortenResponse.status !== 201) {
			stats.errors++;
			throw new Error(`Shorten failed with status ${shortenResponse.status}`);
		}

		// Verify the response contains a URL
		if (!shortenResponse.data || typeof shortenResponse.data !== 'string') {
			stats.errors++;
			throw new Error('Invalid response format');
		}

		stats.successes++;

	} catch (error) {
		stats.errors++;
		console.error(`Error processing URL ${url}:`, error.message);
	} finally {
		const endMark = `end-${stats.requests}`;
		performance.mark(endMark);
		performance.measure(`request-${stats.requests}`, startMark, endMark);
	}
}

// Run the performance test
async function runPerformanceTest() {
	console.log('Starting performance test...');
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

			const url = generateRandomUrl();
			batchPromises.push(testPost(url));
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
	const average = (stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length);
	const p50 = stats.durations[Math.floor(stats.durations.length * 0.5)];
	const p90 = stats.durations[Math.floor(stats.durations.length * 0.9)];
	const p99 = stats.durations[Math.floor(stats.durations.length * 0.99)];

	stats.results['average'] = average;
	stats.results['p50'] = p50;
	stats.results['p90'] = p90;
	stats.results['p99'] = p99;

	console.log('\n=== Redirect Test Results ===');
	console.log(`Total requests: ${stats.requests}`);
	console.log(`Successful redirects: ${stats.successes}`);
	console.log(`Error rate: ${(errorRate * 100).toFixed(2)}%`);
	console.log(`Requests per second: ${rps.toFixed(2)}`);
	console.log(`Total test time: ${totalTime.toFixed(2)}s`);

	console.log('\nStatus code distribution:');

	console.log('\nResponse times (ms):');
	console.log(`Average: ${average.toFixed(2)}`);
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