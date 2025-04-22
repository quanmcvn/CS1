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
		let url = null; //cache_get(id);
		if (url === null) {
			url = await get_url(id);
		}
		if (url === null) {
			res.status(404).send("Short Id not found");
		} else {
			res.status(200).send(url);
		}
	} catch (err) {
		res.status(404).send(err);
	}
})

app.post('/create', async (req, res) => {
	try {
		const url = req.query.url;
		const existing_id = await get_id(url);
		if (existing_id) {
			res.status(200).send(existing_id);
			return;
		}
		let id = await create_short_url(url);
		if (id === null) {
			res.status(400).send("idk can't create_short_url");
			return;
		}
		// cache_set(id, url);
		res.status(201).send(id);
		return;
	} catch (err) {
		res.status(400).send(err);
		return;
	}
});

app.listen(port, () => {
	console.log(`CS1 app listening on port ${port}`);
})
