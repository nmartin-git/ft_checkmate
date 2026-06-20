export async function redirectAuthGoogle()
{
	const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
	const options = {
		client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
		redirect_uri: "http://localhost:3000/api/auth/callback/google",
		response_type: "code",
		scope: "openid email profile"
	};
	const queryString = new URLSearchParams(options).toString();
	window.location.href = `${rootUrl}?${queryString}`;
}