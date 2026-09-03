// Step 2 of the Decap CMS GitHub OAuth flow: GitHub redirects here with a
// `code`, which we exchange for an access token, then hand back to the CMS
// admin tab via postMessage (this is the exact protocol Decap's client JS
// listens for -- see https://decapcms.org/docs/backends-overview/).
function renderBody(status, content) {
	const html = `
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
	return new Blob([html]);
}

export async function onRequest(context) {
	const { request, env } = context;
	const clientId = env.GITHUB_CLIENT_ID;
	const clientSecret = env.GITHUB_CLIENT_SECRET;

	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const response = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'user-agent': 'nitic-pro-decap-oauth',
				accept: 'application/json',
			},
			body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
		});
		const result = await response.json();

		if (result.error) {
			return new Response(renderBody('error', result), {
				headers: { 'content-type': 'text/html;charset=UTF-8' },
				status: 401,
			});
		}

		const body = renderBody('success', { token: result.access_token, provider: 'github' });
		return new Response(body, {
			headers: { 'content-type': 'text/html;charset=UTF-8' },
			status: 200,
		});
	} catch (error) {
		console.error(error);
		return new Response(error.message, {
			headers: { 'content-type': 'text/html;charset=UTF-8' },
			status: 500,
		});
	}
}
