function renderBody(status, content) {
  const provider = content.provider;
  const token = content.token;
  const html =
    "<html><body><script>" +
    'const receiveMessage = (message) => {' +
    "window.opener.postMessage('authorization:" + provider + ":" + token + "', message.origin);" +
    'window.removeEventListener("message", receiveMessage, false);' +
    "};" +
    'window.addEventListener("message", receiveMessage, false);' +
    'window.opener.postMessage("authorizing:' + provider + '", "*");' +
    "</script></body></html>";
  return new Blob([html], { type: "text/html" });
}

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
      return new Response(renderBody("error", result), {
        headers: { "content-type": "text/html;charset=UTF-8" },
        status: 401,
      });
    }

    const provider = "github";

    return new Response(renderBody("success", { token: result.access_token, provider }), {
      headers: { "content-type": "text/html;charset=UTF-8" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(error.message, {
      headers: { "content-type": "text/html;charset=UTF-8" },
      status: 500,
    });
  }
}
