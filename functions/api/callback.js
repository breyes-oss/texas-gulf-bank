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
      const errJson = JSON.stringify({ message: result.error_description || result.error });
      const html =
        "<!DOCTYPE html><html><body><script>" +
        'window.opener.postMessage("authorizing:github", "*");' +
        "var h=function(e){" +
        'window.opener.postMessage("authorization:github:error:' + errJson + '", e.origin);' +
        "window.removeEventListener('message',h,false);window.close()};" +
        "window.addEventListener('message',h,false);" +
        "</script></body></html>";

      return new Response(html, {
        headers: { "content-type": "text/html;charset=UTF-8" },
        status: 401,
      });
    }

    const data = JSON.stringify({ token: result.access_token, provider: "github" });
    const html =
      "<!DOCTYPE html><html><body><script>" +
      // Signal readiness to the parent window
      'window.opener.postMessage("authorizing:github", "*");' +
      // Wait for parent to respond, then send token as JSON
      "var h=function(e){" +
      'window.opener.postMessage("authorization:github:success:' + data + '", e.origin);' +
      "window.removeEventListener('message',h,false);window.close()};" +
      "window.addEventListener('message',h,false);" +
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
