import { AppProps } from "next/app";
import Head from "next/head";
import "./styles.css";
import { AuthProvider } from "react-oidc-context";
import Authentication from "../components/Authentication/Authentication";
const cognitoAuthConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY || "",
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
  redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI || "",
  response_type: process.env.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE || "",
  scope: process.env.NEXT_PUBLIC_COGNITO_SCOPE || "",
  logout_uri: process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI || "",
  cognito_domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "",
};
function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      <Head>
       
      </Head>
      <main>
        <Authentication {...cognitoAuthConfig} />
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}
export default CustomApp;