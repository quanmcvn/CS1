import express from 'express';
import cors from 'cors';
import { cache_get, cache_set } from './memcached.js';
import { create_short_url, get_url, get_id } from './utils.js'
import { rate_limitter } from './rate_limiter.js'

const app = express()
const port = 6968

app.use(cors())
app.use(rate_limitter)

app.get('/short/:id', async (req, res) => {
	try {
		const id = req.params.id;
		let url = cache_get(id);
		if (url === null) {
			url = await get_url(id);
		}
		if (url === null) {
			res.status(404).json(null);
		} else {
			res.status(200).json(url);
		}
	} catch (err) {
		res.send(err)
	}
})

app.post('/create', async (req, res) => {
	try {
		const url = req.query.url;

		const existing_id = await get_id(url);
		let id;
		if (existing_id) {
			id = existing_id;
		} else {
			id = await create_short_url(url);
		}
		if (id === null) {
			res.status(400).json("idk can't create_short_url");
		} else {
			cache_set(id, url);
			res.status(201).json(id);
		}
	} catch (err) {
		res.send(err);
	}
});

app.listen(port, () => {
	console.log(`CS1 app listening on port ${port}`);
})
