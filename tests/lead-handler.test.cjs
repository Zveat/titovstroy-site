const test = require("node:test");
const assert = require("node:assert/strict");

async function loadHandlerModule() {
  try {
    return require("../lib/lead-handler.cjs");
  } catch (error) {
    if (error && error.code === "MODULE_NOT_FOUND") return {};
    throw error;
  }
}

test("creates a contact and a linked deal for a valid website lead", async () => {
  const { createLeadHandler } = await loadHandlerModule();
  assert.equal(typeof createLeadHandler, "function");

  const requests = [];
  const handler = createLeadHandler({
    bitrixWebhookBaseUrl: "https://example.bitrix24.kz/rest/1/test/",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return {
        ok: true,
        json: async () => ({
          result: requests.length === 1 ? { CONTACT: [] } : requests.length === 2 ? 41 : 84
        })
      };
    }
  });

  const result = await handler({
    name: "Тест",
    tel: "+7 701 123 45 67",
    answers: { obj: "Квартира — вторичка", area: "до 40 м²", when: "В этом месяце" },
    website: ""
  });

  assert.deepEqual(result, { status: 201, body: { ok: true, dealId: 84 } });
  assert.equal(requests.length, 4);
  assert.match(requests[0].url, /crm\.duplicate\.findbycomm\.json$/);
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    entity_type: "CONTACT",
    type: "PHONE",
    values: ["+77011234567"]
  });
  assert.match(requests[1].url, /crm\.contact\.add\.json$/);
  assert.match(requests[2].url, /crm\.deal\.add\.json$/);
  assert.deepEqual(JSON.parse(requests[2].options.body), {
    fields: {
      TITLE: "Сайт / Вторичка: заявка на замер",
      SOURCE_ID: "WEB",
      SOURCE_DESCRIPTION: "titovstroy.kz / Вторичка",
      COMMENTS: "Источник: сайт titovstroy.kz\nНаправление страницы: Вторичка\nЧто выбрал в квизе: Квартира — вторичка\nПлощадь: до 40 м²\nСтарт: В этом месяце",
      CONTACT_IDS: [41]
    }
  });
});

test("adds the full quiz summary to the visible deal timeline", async () => {
  const { createLeadHandler } = await loadHandlerModule();
  assert.equal(typeof createLeadHandler, "function");

  const requests = [];
  const handler = createLeadHandler({
    bitrixWebhookBaseUrl: "https://example.bitrix24.kz/rest/1/test/",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return {
        ok: true,
        json: async () => ({ result: requests.length === 1 ? { CONTACT: [41] } : requests.length === 2 ? 84 : 900 })
      };
    }
  });

  const result = await handler({
    name: "Тест",
    tel: "+7 701 123 45 67",
    answers: { obj: "Квартира — вторичка", area: "до 40 м²", when: "В этом месяце" },
    website: ""
  });

  assert.deepEqual(result, { status: 201, body: { ok: true, dealId: 84 } });
  assert.equal(requests.length, 3);
  assert.match(requests[2].url, /crm\.timeline\.comment\.add\.json$/);
  assert.deepEqual(JSON.parse(requests[2].options.body), {
    fields: {
      ENTITY_ID: 84,
      ENTITY_TYPE: "deal",
      COMMENT: "Источник: сайт titovstroy.kz\nНаправление страницы: Вторичка\nЧто выбрал в квизе: Квартира — вторичка\nПлощадь: до 40 м²\nСтарт: В этом месяце"
    }
  });
});

test("keeps a created deal successful if its timeline comment cannot be added", async () => {
  const { createLeadHandler } = await loadHandlerModule();
  assert.equal(typeof createLeadHandler, "function");

  const handler = createLeadHandler({
    bitrixWebhookBaseUrl: "https://example.bitrix24.kz/rest/1/test/",
    fetchImpl: async (url) => {
      if (/crm\.duplicate\.findbycomm\.json$/.test(url)) return { ok: true, json: async () => ({ result: { CONTACT: [41] } }) };
      if (/crm\.deal\.add\.json$/.test(url)) return { ok: true, json: async () => ({ result: 84 }) };
      return { ok: false, json: async () => ({ error: "TIMELINE_UNAVAILABLE" }) };
    }
  });

  const result = await handler({
    name: "Тест",
    tel: "+7 701 123 45 67",
    answers: { obj: "Квартира — вторичка", area: "до 40 м²", when: "В этом месяце" },
    website: ""
  });

  assert.deepEqual(result, { status: 201, body: { ok: true, dealId: 84 } });
});

test("does not call Bitrix when the form payload is rejected", async () => {
  const { createLeadHandler } = await loadHandlerModule();
  assert.equal(typeof createLeadHandler, "function");

  let calls = 0;
  const handler = createLeadHandler({
    bitrixWebhookBaseUrl: "https://example.bitrix24.kz/rest/1/test/",
    fetchImpl: async () => { calls += 1; throw new Error("must not call"); }
  });

  const result = await handler({ name: "Тест", tel: "123", answers: {}, website: "" });

  assert.deepEqual(result, { status: 400, body: { ok: false, code: "invalid_phone" } });
  assert.equal(calls, 0);
});

test("returns a generic CRM error when Bitrix rejects a valid lead", async () => {
  const { createLeadHandler } = await loadHandlerModule();
  assert.equal(typeof createLeadHandler, "function");

  const handler = createLeadHandler({
    bitrixWebhookBaseUrl: "https://example.bitrix24.kz/rest/1/test/",
    fetchImpl: async () => ({ ok: false, json: async () => ({ error: "ACCESS_DENIED" }) })
  });

  const result = await handler({ name: "Тест", tel: "+7 701 123 45 67", answers: {}, website: "" });

  assert.deepEqual(result, { status: 502, body: { ok: false, code: "crm_unavailable" } });
});

test("does not pretend to submit a lead when Bitrix is not configured", async () => {
  var createLeadHandler = (await loadHandlerModule()).createLeadHandler;
  assert.equal(typeof createLeadHandler, "function");
  var calls = 0;
  var handler = createLeadHandler({
    fetchImpl: async function () { calls += 1; throw new Error("must_not_call_crm"); }
  });

  var result = await handler({ name: "Айдана", tel: "+7 701 123 45 67" });

  assert.deepEqual(result, { status: 503, body: { ok: false, code: "crm_not_configured" } });
  assert.equal(calls, 0);
});
