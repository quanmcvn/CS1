import Memcached from 'memcached'
import dotenv from "dotenv";

dotenv.config();
const memcached_port = process.env.MEMCACHED_PORT;

const memcached = new Memcached(`localhost:${memcached_port}`);

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