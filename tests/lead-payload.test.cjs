const test = require("node:test");
const assert = require("node:assert/strict");

async function loadLeadModule() {
  try {
    return require("../lib/lead-payload.cjs");
  } catch (error) {
    if (error && error.code === "MODULE_NOT_FOUND") return {};
    throw error;
  }
}

test("accepts a Kazakhstan phone and produces a safe Bitrix deal payload", async () => {
  const { prepareWebsiteLead } = await loadLeadModule();
  assert.equal(typeof prepareWebsiteLead, "function");

  const result = prepareWebsiteLead({
    name: "Алия",
    tel: "8 (701) 123-45-67",
    answers: {
      obj: "Квартира в новостройке",
      area: "40–60 м²",
      when: "В этом месяце"
    },
    website: ""
  });

  assert.deepEqual(result, {
    ok: true,
    contact: {
      NAME: "Алия",
      PHONE: [{ VALUE: "+77011234567", VALUE_TYPE: "WORK" }]
    },
    deal: {
      TITLE: "Сайт / Новостройка: заявка на замер",
      SOURCE_ID: "WEB",
      SOURCE_DESCRIPTION: "titovstroy.kz / Новостройка",
      COMMENTS: "Источник: сайт titovstroy.kz\nНаправление страницы: Новостройка\nЧто выбрал в квизе: Квартира в новостройке\nПлощадь: 40–60 м²\nСтарт: В этом месяце"
    }
  });
});

test("labels a secondary-market website lead in the deal title", async () => {
  const { prepareWebsiteLead } = await loadLeadModule();
  assert.equal(typeof prepareWebsiteLead, "function");

  const result = prepareWebsiteLead({
    name: "Алия",
    tel: "+7 701 123 45 67",
    answers: {
      obj: "Квартира — вторичка",
      area: "до 40 м²",
      when: "В ближайшие 2 недели"
    },
    website: ""
  });

  assert.equal(result.deal.TITLE, "Сайт / Вторичка: заявка на замер");
  assert.match(result.deal.COMMENTS, /Направление страницы: Вторичка/);
  assert.match(result.deal.COMMENTS, /Что выбрал в квизе: Квартира — вторичка/);
});

test("rejects a malformed phone before any CRM request is prepared", async () => {
  const { prepareWebsiteLead } = await loadLeadModule();
  assert.equal(typeof prepareWebsiteLead, "function");

  assert.deepEqual(
    prepareWebsiteLead({ name: "Алия", tel: "123", answers: {}, website: "" }),
    { ok: false, code: "invalid_phone" }
  );
});

test("rejects a filled honeypot field", async () => {
  const { prepareWebsiteLead } = await loadLeadModule();
  assert.equal(typeof prepareWebsiteLead, "function");

  assert.deepEqual(
    prepareWebsiteLead({ name: "Алия", tel: "+7 701 123 45 67", answers: {}, website: "bot" }),
    { ok: false, code: "spam" }
  );
});
