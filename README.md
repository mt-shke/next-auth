## NextAuth

```js
// npm i next
// npm i next-auth
// npm i bcryptjs
// npm i mongoDb
```

<details>
<summary>[...nextauth].js - Provider - lib/auth(hash) - lib/db</summary>

```js
export default NextAuth({
	session: {
		jwt: true,
	},

	providers: [
		Providers.Credentials({
			async authorize(credentials) {
				const client = await connectToDatabase();

				const usersCollection = client.db().collection("users");
				const user = await usersCollection.findOne({ email: credentials.email });

				if (!user) {
					client.close();
					throw new Error("No user found");
				}

				const isValid = verifyPassword(credentials.password, user.password);

				if (!isValid) {
					client.close();
					throw new Error("Could not log you in!");
				}
				client.close();
				return { email: user.email };
			},
		}),
	],
});
```

```js
function MyApp({ Component, pageProps }) {
	return (
		// Provider =>  set session data to childs components
		// Avoid more auth requests && better performance
		<Provider session={pageProps.session}>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</Provider>
	);
}
```

```js
export async function hashPassword(password) {
	const hashedPassword = await hash(password, 12);
	return hashedPassword;
}

export async function verifyPassword(password, hashedPassword) {
	const isValid = await compare(password, hashedPassword);
	return isValid;
}
```

```js
export const connectToDatabase = async () => {
	const client = await MongoClient.connect(
		"mongodb+srv://user:user@cluster0.chfbj.mongodb.net/project?retryWrites=true&w=majority"
	);
	return client;
};
```

</details>

<details>
<summary>Register component</summary>

```js
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
	const userExist = db.collection("users").findOne({ email: email });

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
```

</details>

<details>
<summary>signIn - Login form component</summary>

```js
async function createUser(email, password) {
	const response = await fetch("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify({ email, password }),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Something went wrong");
	}
	return data;
}

function AuthForm() {
	const emailRef = useRef();
	const passwordRef = useRef();
	const [isLogin, setIsLogin] = useState(true);

	function switchAuthModeHandler() {
		setIsLogin((prevState) => !prevState);
	}


	async function submitHandler(event) {
		try {
			event.preventDefault();
			const email = emailRef.current.value;
			const password = passwordRef.current.value;
			if (isLogin) {
				const result = await signIn("credentials", {
					redirect: false,
					email: email,
					password: password,
				});

				if (!result.error) {
					// login logic
				}
			} else {
				const response = await createUser(email, password);
				console.log(response);
			}
		} catch (err) {
			console.log(err);
		}
	}

```

</details>

<details>
<summary>useSession - session && conditionnal rendering</summary>

```js
	const [session, loading] = useSession();

	return (
					{!session && !loading && (
						<li>
							<Link href="/auth">Login</Link>
						</li>
					)}
```

</details>

## Route Protection

<details>
<summary>Client side</summary>

profile page

```js
// redirect if !session + set loading during session search
function UserProfile() {
	// Redirect away if NOT auth
	// const [session, loading] = useSession();
	// useSession's loading 's kinda buggy
	// we create our own loading state
	const [isLoading, setIsLoading] = useState(true);
	// const [loadedSession, setLoadedSession] = useSession();

	useEffect(() => {
		getSession().then((session) => {
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

```

auth/login page

```js
// redirect if session
function AuthPage() {
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		getSession().then((session) => {
			if (session) {
				router.replace("/");
			} else {
				setIsLoading(false);
			}
		});
	}, [router]);

	if (isLoading) {
		return <p>Loading...</p>;
	}

	return <AuthForm />;
}
```

</details>

<details>
<summary>Server side</summary>

profil page - server side getSession

```js
function ProfilePage() {
	return <UserProfile />;
}

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });

	if (!session) {
		return { redirect: { destination: "/auth", permanent: false } };
	}
	return {
		props: { session },
	};
}

export default ProfilePage;
```

</details>
