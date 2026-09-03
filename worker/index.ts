// Single Worker entry point: serves the static Astro build via the ASSETS
// binding, and handles the two routes Decap CMS's GitHub OAuth flow needs
// (/api/auth and /api/callback) before falling through to static assets.
//
// Requires two secrets, set with `wrangler secret put <NAME>` (or in the
// Cloudflare dashboard under Workers & Pages -> this Worker -> Settings ->
// Variables and Secrets):
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

interface Env {
	ASSETS: Fetcher;
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
}

// The repo Decap CMS commits to. Only GitHub users with push (write) access
// to this repo are allowed to complete login.
const REPO_OWNER = 'nitic-pro';
const REPO_NAME = 'ibakosen-pro.club';

function renderCallbackBody(status: 'success' | 'error', content: unknown): string {
	return `
	<script>
	  const receiveMessage = (message) => {
		window.opener.postMessage(
		  'authorization:github:${status}:${JSON.stringify(content)}',
		  message.origin
		);
		window.removeEventListener("message", receiveMessage, false);
	  }
	  window.addEventListener("message", receiveMessage, false);
	  window.opener.postMessage("authorizing:github", "*");
	</script>
	`;
}

// Step 1: redirect the popup window to GitHub's authorize screen.
function handleAuth(request: Request, env: Env): Response {
	const url = new URL(request.url);
	const redirectUrl = new URL('https://github.com/login/oauth/authorize');
	redirectUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
	redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
	redirectUrl.searchParams.set('scope', 'repo user');
	redirectUrl.searchParams.set('state', crypto.getRandomValues(new Uint8Array(12)).join(''));
	return Response.redirect(redirectUrl.href, 301);
}

// Step 2: GitHub redirects here with a `code`; exchange it for an access
// token and hand it back to the CMS admin tab via postMessage (the exact
// protocol Decap's client JS listens for).
async function handleCallback(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');

	const response = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'user-agent': 'ibakosen-pro-club-decap-oauth',
			accept: 'application/json',
		},
		body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
	});
	const result = (await response.json()) as { error?: string; access_token?: string };

	if (result.error) {
		return new Response(renderCallbackBody('error', result), {
			headers: { 'content-type': 'text/html;charset=UTF-8' },
			status: 401,
		});
	}

	// Gate login on write access to the content repo -- this endpoint works for
	// any authenticated user (the repo is public), and the "permissions" field
	// it returns reflects *this* user's own access level, so no special
	// privilege is needed just to check.
	const repoResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
		headers: {
			authorization: `Bearer ${result.access_token}`,
			'user-agent': 'ibakosen-pro-club-decap-oauth',
			accept: 'application/vnd.github+json',
		},
	});
	const repoData = (await repoResponse.json()) as { permissions?: { push?: boolean } };

	if (!repoData.permissions?.push) {
		return new Response(
			renderCallbackBody('error', {
				error: 'access_denied',
				error_description: 'このリポジトリへの書き込み権限がありません。管理者に追加を依頼してください。',
			}),
			{
				headers: { 'content-type': 'text/html;charset=UTF-8' },
				status: 403,
			},
		);
	}

	const body = renderCallbackBody('success', { token: result.access_token, provider: 'github' });
	return new Response(body, {
		headers: { 'content-type': 'text/html;charset=UTF-8' },
		status: 200,
	});
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { pathname } = new URL(request.url);

		try {
			if (pathname === '/api/auth') return handleAuth(request, env);
			if (pathname === '/api/callback') return handleCallback(request, env);
		} catch (error) {
			console.error(error);
			return new Response(error instanceof Error ? error.message : 'Internal error', { status: 500 });
		}

		return env.ASSETS.fetch(request);
	},
};
