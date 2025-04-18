import mongoose from 'mongoose';
import fs from 'fs';
import { Urls } from '../database.js';

async function exportIdsToFile() {
	try {
		const writeStream = fs.createWriteStream('ids_output.txt');

		// Find documents and stream results
		const query = Urls.find({}).select('id -_id'); // Only select id, exclude _id
		const stream = query.cursor();

		stream.on('data', (doc) => {
			writeStream.write(`${doc.id}\n`);
		});

		stream.on('end', () => {
			writeStream.end();
			console.log('All IDs have been written to the file');
			mongoose.connection.close();
		});

		stream.on('error', (err) => {
			console.error('Error:', err);
			mongoose.connection.close();
		});

	} catch (err) {
		console.error('Connection error:', err);
	}
}

exportIdsToFile();