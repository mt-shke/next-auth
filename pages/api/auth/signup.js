import { hashPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

async function handler(req, res) {
	if (req.method !== "POST") return;
	const data = req.body;
	const { email, password } = data;

	// Validation...
	if (!email || !password || password.length < 6) {
		res.status(422).json({ message: "Incorrect credentials" });
	}

	const client = await connectToDatabase();
	const db = client.db();

	const userExist = await db.collection("users").findOne({ email: email });

	if (userExist) {
		res.status(422).json({ message: "User already exist" });
		client.close();
		return;
	}

	const hashedPassword = await hashPassword(password);

	const result = await db.collection("users").insertOne({
		email: email,
		password: hashedPassword,
	});

	res.status(201).json({ message: "User created" });
	client.close();
}

export default handler;
