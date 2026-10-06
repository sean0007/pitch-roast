import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, PUBLIC_URL } from "./api";

const endpoints = Object.values(ENDPOINTS);

for (const e of endpoints) {
  const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json` });

  test(`GET ${e.example} returns 200 with disclaimer and CORS`, async () => {
    const res = await handler(new Request(`${PUBLIC_URL}${e.example}`));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    const body = await res.json();
    assert.equal(body.disclaimer, API_DISCLAIMER);
    assert.ok(!("error" in body));
  });

  test(`POST ${e.path} with JSON body returns the same result as GET`, async () => {
    const url = new URL(`${PUBLIC_URL}${e.example}`);
    const body: Record<string, unknown> = {};
    for (const [k, v] of url.searchParams) body[k] = body[k] === undefined ? v : ([] as unknown[]).concat(body[k], v);
    const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
    const get = await handler(new Request(url));
    assert.equal(post.status, 200);
    assert.deepEqual(await post.json(), await get.json());
  });

  if (e.params.some((p) => p.required)) {
    test(`${e.path} without required input returns 400 with an example`, async () => {
      const res = await handler(new Request(`${PUBLIC_URL}${e.path}`));
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.ok(body.error);
      assert.equal(body.disclaimer, API_DISCLAIMER);
    });
  }
}

test("OpenAPI spec lists every endpoint with GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, endpoints) as { paths: Record<string, { get: unknown; post: unknown }> };
  for (const e of endpoints) {
    assert.ok(spec.paths[e.path]?.get, e.path);
    assert.ok(spec.paths[e.path]?.post, e.path);
  }
});

test("API roast: alias p, invalid stage gives 400, long pitch gives 400, share URL round-trips", async () => {
  const e = ENDPOINTS.roast;
  const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json` });
  const a = await (await handler(new Request(`${PUBLIC_URL}/api/roast?p=${encodeURIComponent("Uber for cats.")}`))).json();
  assert.equal(a.judges.length, 5);
  assert.ok(a.shareUrl.startsWith(`${PUBLIC_URL}/r?p=`));
  assert.ok(a.ogImage.startsWith(`${PUBLIC_URL}/og?p=`));
  assert.equal(new URL(a.shareUrl).searchParams.get("p"), "Uber for cats.");
  const bad = await handler(new Request(`${PUBLIC_URL}/api/roast?pitch=Hello%20world&stage=unicorn`));
  assert.equal(bad.status, 400);
  const long = await handler(new Request(`${PUBLIC_URL}/api/roast`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pitch: "word ".repeat(400) }) }));
  assert.equal(long.status, 400);
});
