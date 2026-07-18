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
      const errMsg = btoa(result.error_description || result.error);
      return new Response(
        "<!DOCTYPE html><html><body><script>" +
        "var e=atob('" + errMsg + "');" +
        "var p=window.opener;" +
        "p.postMessage('authorizing:github','*');" +
        "var h=function(f){" +
        "p.postMessage('authorization:github:error:{\"message\":\"'+e+'\"}',f.origin);" +
        "window.removeEventListener('message',h,false);window.close()};" +
        "window.addEventListener('message',h,false);" +
        "</script></body></html>",
        { headers: { "content-type": "text/html;charset=UTF-8" }, status: 401 }
      );
    }

    const tokenB64 = btoa(result.access_token);

    return new Response(
      "<!DOCTYPE html><html><body><script>" +
      "var t=atob('" + tokenB64 + "');" +
      "var p=window.opener;" +
      "var d=JSON.stringify({token:t,provider:'github'});" +
      "p.postMessage('authorizing:github','*');" +
      "var h=function(e){" +
      "p.postMessage('authorization:github:success:'+d,e.origin);" +
      "window.removeEventListener('message',h,false);window.close()};" +
      "window.addEventListener('message',h,false);" +
      "</script></body></html>",
      { headers: { "content-type": "text/html;charset=UTF-8" }, status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response("Error: " + error.message, {
      headers: { "content-type": "text/plain" },
      status: 500,
    });
  }
}
