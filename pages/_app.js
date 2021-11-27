import { Provider } from "next-auth/client";
import Layout from "../components/layout/layout";
import "../styles/globals.css";

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

export default MyApp;
