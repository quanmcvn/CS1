const rate_limit = (options) => {
	const { window_ms, max_request } = options;
	const requests = {};

	return (req, res, next) => {
		const ip = req.ip;
		const now = Date.now();

		if (!requests[ip]) {
			requests[ip] = { count: 1, timestamp: now };
			next();
			return;
		}
		const timeElapsed = now - requests[ip].timestamp;
		if (timeElapsed > window_ms) {
			requests[ip] = { count: 1, timestamp: now };
			next();
			return;
		}
		if (requests[ip].count < max_request) {
			requests[ip].count++;
			next();
			return;
		}
		res.status(429).send(`Too many requests, only ${max_request} per ${window_ms}`);
		return;
	};
};

const rate_limitter = rate_limit({
	window_ms: 5 * 1000,
	max_request: 2,
});

export { rate_limitter };