import { getSession } from "next-auth/client";
import { useEffect, useState } from "react";
import ProfileForm from "./profile-form";
import classes from "./user-profile.module.css";

function UserProfile() {
	// Redirect away if NOT auth
	// const [session, loading] = useSession();
	// useSession's loading 's kinda buggy
	// we create our own loading state
	const [isLoading, setIsLoading] = useState(true);
	// const [loadedSession, setLoadedSession] = useSession();

	useEffect(() => {
		getSession().then((session) => {
			console.log("session", session);
			// setLoadedSession(session);
			// setIsLoading(session);
			if (!session) {
				window.location.href = "/auth";
			} else {
				setIsLoading(false);
			}
		});
	}, []);

	if (isLoading) {
		// own loading state to conditonnaly render messages
		return <p className={classes.profile}>Loading...</p>;
	}

	return (
		<section className={classes.profile}>
			<h1>Your User Profile</h1>
			<ProfileForm />
		</section>
	);
}

export default UserProfile;
