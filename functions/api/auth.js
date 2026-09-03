// Step 1 of the Decap CMS GitHub OAuth flow: redirect the popup window to
// GitHub's authorize screen. GitHub then sends the user back to /api/callback.
//
// Requires two Cloudflare Pages environment variables (set in the dashboard
// under Settings -> Environment variables, or via `wrangler pages secret put`):
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET (used in callback.js, not here)
export async function onRequest(context) {
	const { request, env } = context;
	const clientId = env.GITHUB_CLIENT_ID;

	try {
		const url = new URL(request.url);
		const redirectUrl = new URL('https://github.com/login/oauth/authorize');
		redirectUrl.searchParams.set('client_id', clientId);
		redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
		redirectUrl.searchParams.set('scope', 'repo user');
		redirectUrl.searchParams.set('state', crypto.getRandomValues(new Uint8Array(12)).join(''));
		return Response.redirect(redirectUrl.href, 301);
	} catch (error) {
		console.error(error);
		return new Response(error.message, { status: 500 });
	}
}
