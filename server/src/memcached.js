import Memcached from 'memcached'
import dotenv from "dotenv";

dotenv.config();
const memcached_url = process.env.MEMCACHED_URL;

const memcached = new Memcached(memcached_url);

function cache_get(key) {
	let ret = null;
	memcached.get(key, function (err, data) {
		if (err) throw err;
		if (data) {
			ret = data;
		} else {
		}
	});
	return ret;
}

function cache_set(key, value) {
	memcached.set(key, value, 3600, function (err) {
		if (err) throw err;
	});
}

export { cache_get, cache_set }