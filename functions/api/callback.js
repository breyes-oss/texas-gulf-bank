export async function onRequest(context) {
  const { request, env } = context;
  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "cloudflare-functions-github-oauth",
          accept: "application/json",
        },
        body: JSON.stringify({ client_id, client_secret, code }),
      }
    );

    const result = await response.json();

    if (result.error) {
      return new Response(
        "<html><body>Auth error</body></html>",
        { headers: { "content-type": "text/html;charset=UTF-8" }, status: 401 }
      );
    }

    const token = result.access_token;

    const html =
      "<!DOCTYPE html><html><body><script>" +
      // Signal to the parent that we're ready
      'window.opener.postMessage("authorizing:github", "*");' +
      // Wait for parent to acknowledge, then send the token
      "var handler = function(event) {" +
      'window.opener.postMessage("authorization:github:' + token + '", event.origin);' +
      "window.removeEventListener('message', handler, false);" +
      "window.close();" +
      "};" +
      "window.addEventListener('message', handler, false);" +
      "</script></body></html>";

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Error: " + error.message, {
      headers: { "content-type": "text/plain" },
      status: 500,
    });
  }
}
