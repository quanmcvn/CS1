import { Urls } from './database.js';

function make_id(length) {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	return Array.from(
		{ length },
		() => characters[Math.floor(Math.random() * charactersLength)]
	).join("");
}

function validate_url(url) {
	const regex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;
	return regex.test(url);
}

async function get_new_id() {
	const attemptSize = 10;
	for (let attempt = 0; attempt < attemptSize; attempt++) {
		const new_id = make_id(5);
		const url = await get_url(new_id);
		if (url === null) {
			return new_id;
		}
	}
	throw new Error(`whar, (total/62^5)^${attemptSize} chance to collide all ${attemptSize} attemps and still collide`);
}

async function create_short_url(url) {
	if (!validate_url(url)) {
		throw `Not an appropiate URL: ${url}`;
	}

	const id = await get_new_id();

	const newUrl = new Urls({
		id: id,
		url: url,
	});

	return newUrl.save()
		.then((url_obj) => {
			if (url_obj === null) throw "idk can't 1";
			return id;
		})
		.catch((err) => {
			throw 'Error saving URL:' + err;
		});
}

async function get_url(id) {
	return Urls.findOne({
		id: id
	})
		.then(url_obj => {
			if (url_obj === null) return null;
			return url_obj.url;
		})
		.catch((err) => {
			console.error(err)
			return null;
		});
}

async function get_id(url) {
	return Urls.findOne({
		url: url
	})
		.then(url_obj => {
			if (url_obj === null) return null;
			return url_obj.id;
		})
		.catch((err) => {
			console.error(err)
			return null;
		});
}

export { create_short_url, get_url, get_id }