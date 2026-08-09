const test = require("node:test");
const assert = require("node:assert/strict");

async function loadHttpHandler() {
  try {
    return require("../lib/http-handler.cjs");
  } catch (error) {
    if (error && error.code === "MODULE_NOT_FOUND") return {};
    throw error;
  }
}

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test("passes a POST body to the website lead handler and returns its result", async () => {
  const { createHttpHandler } = await loadHttpHandler();
  assert.equal(typeof createHttpHandler, "function");

  const received = [];
  const handler = createHttpHandler(async (body) => {
    received.push(body);
    return { status: 201, body: { ok: true, dealId: 84 } };
  });
  const response = responseRecorder();

  await handler({ method: "POST", body: { name: "Тест" } }, response);

  assert.deepEqual(received, [{ name: "Тест" }]);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, { ok: true, dealId: 84 });
});

test("rejects a non-POST request without sending a lead to CRM", async () => {
  const { createHttpHandler } = await loadHttpHandler();
  assert.equal(typeof createHttpHandler, "function");

  let calls = 0;
  const handler = createHttpHandler(async () => { calls += 1; return { status: 201, body: {} }; });
  const response = responseRecorder();

  await handler({ method: "GET", body: {} }, response);

  assert.equal(calls, 0);
  assert.equal(response.statusCode, 405);
  assert.deepEqual(response.body, { ok: false, code: "method_not_allowed" });
});
