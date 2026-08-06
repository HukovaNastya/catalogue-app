export async function GET(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\//, "");

  const res = await fetch(`https://api.thecatapi.com/v1/${path}${url.search}`, {
    headers: { "x-api-key": process.env.CAT_API_KEY },
  });

  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
