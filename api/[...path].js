const UPSTREAM = "https://api.thecatapi.com/v1";

export async function GET(request) {
  const url = new URL(request.url);

  const path = url.pathname.replace(/^\/api\b/, "").replace(/^\/+/, "");

  const target = `${UPSTREAM}/${path}${url.search}`;

  const res = await fetch(target, {
    headers: process.env.CAT_API_KEY
      ? { "x-api-key": process.env.CAT_API_KEY }
      : {},
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`Upstream ${res.status} for ${target}: ${detail}`);

    return new Response(
      JSON.stringify({ error: "upstream_error", status: res.status, target }),
      { status: res.status, headers: { "content-type": "application/json" } },
    );
  }

  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
