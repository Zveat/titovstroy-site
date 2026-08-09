const test = require("node:test");
const assert = require("node:assert/strict");

async function loadClientModule() {
  try {
    return require("../lib/lead-client.js");
  } catch (error) {
    if (error && error.code === "MODULE_NOT_FOUND") return {};
    throw error;
  }
}

test("posts a website lead to the same-origin API and returns the created deal", async () => {
  const { submitWebsiteLead } = await loadClientModule();
  assert.equal(typeof submitWebsiteLead, "function");

  const calls = [];
  const result = await submitWebsiteLead(
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => ({ ok: true, dealId: 84 }) };
    },
    { name: "Тест", tel: "+77011234567", answers: { obj: "Квартира — вторичка" }, website: "" }
  );

  assert.deepEqual(result, { ok: true, dealId: 84 });
  assert.deepEqual(calls, [{
    url: "/api/lead",
    options: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Тест", tel: "+77011234567", answers: { obj: "Квартира — вторичка" }, website: "" })
    }
  }]);
});

test("does not treat a failed API response as a submitted website lead", async () => {
  const { submitWebsiteLead } = await loadClientModule();
  assert.equal(typeof submitWebsiteLead, "function");

  await assert.rejects(
    submitWebsiteLead(async () => ({ ok: false, json: async () => ({ ok: false }) }), {}),
    { message: "lead_submission_failed" }
  );
});
