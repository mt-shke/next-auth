import { MongoClient } from "mongodb";

export const connectToDatabase = async () => {
	const client = await MongoClient.connect(
		"mongodb+srv://user:user@cluster0.chfbj.mongodb.net/project?retryWrites=true&w=majority"
	);
	return client;
};
