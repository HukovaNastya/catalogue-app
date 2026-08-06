const UPSTREAM = "https://api.thecatapi.com/v1";

export default async function handler(req, res) {
  const { path, ...query } = req.query;
  const segments = [].concat(path ?? []).join("/");
  const search = new URLSearchParams(query).toString();

  const target = `${UPSTREAM}/${segments}${search ? `?${search}` : ""}`;

  const upstream = await fetch(target, {
    headers: process.env.CAT_API_KEY
      ? { "x-api-key": process.env.CAT_API_KEY }
      : {},
  });

  const body = await upstream.text();

  if (!upstream.ok) {
    console.error(`Upstream ${upstream.status} for ${target}: ${body}`);
  }

  res.status(upstream.status);
  res.setHeader("content-type", "application/json");
  res.send(body);
}
