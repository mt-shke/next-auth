import { getSession } from "next-auth/client";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

async function handler(req, res) {
	if (req.method !== "PATCH") {
		res.status(201).json({ message: "Only method PATCH is supported" });
		return;
	}

	const session = await getSession({ req: req });
	if (!session) {
		res.status(401).json({ message: "Not authenticated" });
		return;
	}

	const email = session.user.email;
	const oldPassword = req.body.oldPassword;
	const newPassword = req.body.newPassword;

	const client = await connectToDatabase();
	const usersCollection = client.db().collection("users");
	const user = await usersCollection.findOne({ email: email });
	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}

	const currentPassword = user.password;
	const passwordsMatch = await verifyPassword(oldPassword, currentPassword);

	if (!passwordsMatch) {
		res.status(403).json({ message: "Password does not match" });
		// or 422
		client.close();
		return;
	}

	const hashNewPassword = await hashPassword(newPassword);

	const result = await usersCollection.updateOne({ email: email }, { $set: { password: hashNewPassword } });
	client.close();
	res.status(200).json({ message: "Password updated" });
}

export default handler;
