import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const dbURI = process.env.MONGODB_URI;

// test first
mongoose
	.connect(dbURI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Failed to connect to MongoDB:", err));

const urlSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	url: {
		type: String,
		required: true,
		unique: true,
	},
});

urlSchema.index({ id: 'hashed' });

urlSchema.index({ url: 'hashed' });

const Urls = mongoose.model('urls', urlSchema);

export { Urls };

// const connectDB = async (callback) => {
// 	try {
// 		// Wait for the MongoDB connection to establish
// 		await mongoose.connect(dbURI);
// 		return await callback();
// 	} catch (err) {
// 		console.error('Error:', err);  // Will catch errors from both the connection and saving
// 	}
// };

// module.exports = connectDB;
