import { getSession } from "next-auth/client";
import { useEffect, useState } from "react";
import ProfileForm from "./profile-form";
import classes from "./user-profile.module.css";

function UserProfile() {
	// Redirect away if NOT auth
	// const [session, loading] = useSession();
	// useSession's loading 's kinda buggy
	// we create our own loading state
	// const [loadedSession, setLoadedSession] = useSession();
	// const [isLoading, setIsLoading] = useState(true);

	// useEffect(() => {
	// 	getSession().then((session) => {
	// 		console.log("session", session);
	// 		// setLoadedSession(session);
	// 		// setIsLoading(session);
	// 		if (!session) {
	// 			window.location.href = "/auth";
	// 		} else {
	// 			setIsLoading(false);
	// 		}
	// 	});
	// }, []);

	// if (isLoading) {
	// 	// own loading state to conditonnaly render messages
	// 	return <p className={classes.profile}>Loading...</p>;
	// }

	async function changePasswordHandler(passwordData) {
		const response = await fetch("/api/user/change-password", {
			method: "PATCH",
			body: JSON.stringify(passwordData),
			headers: { "Content-Type": "application/json" },
		});
		const data = await response.json();
	}

	return (
		<section className={classes.profile}>
			<h1>Your User Profile</h1>
			<ProfileForm onChangePassword={changePasswordHandler} />
		</section>
	);
}

export default UserProfile;
