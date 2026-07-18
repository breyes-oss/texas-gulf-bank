var PREFIX = "authorization:";

function renderHtml(token, hasError) {
  var tag = hasError ? "error" : "success";
  var data = hasError
    ? '{"message":"' + token + '"}'
    : JSON.stringify({ token: token, provider: "github" });

  return (
    "<!DOCTYPE html><html><body><script>" +
    "var p=window.opener;" +
    "p.postMessage('authorizing:github','*');" +
    "var h=function(e){" +
    "p.postMessage('" +
    PREFIX +
    "github:" +
    tag +
    ":" +
    data +
    "',e.origin);" +
    "window.removeEventListener('message',h,false);window.close()};" +
    "window.addEventListener('message',h,false);" +
    "</script></body></html>"
  );
}

export async function onRequest(context) {
  const { request, env } = context;
  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    const ghResponse = await fetch(
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

    const result = await ghResponse.json();

    if (result.error) {
      var msg = result.error_description || result.error;
      return new Response(renderHtml(msg, true), {
        headers: { "content-type": "text/html;charset=UTF-8" },
        status: 401,
      });
    }

    return new Response(renderHtml(result.access_token, false), {
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
