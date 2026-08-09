"use strict";

function normalizeKazakhstanPhone(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "8") digits = "7" + digits.slice(1);
  if (!/^7\d{10}$/.test(digits)) return null;
  return "+" + digits;
}

function prepareWebsiteLead(payload) {
  var input = payload || {};
  if (String(input.website || "").trim()) return { ok: false, code: "spam" };

  var name = String(input.name || "").trim();
  var phone = normalizeKazakhstanPhone(input.tel);
  if (!name) return { ok: false, code: "invalid_name" };
  if (!phone) return { ok: false, code: "invalid_phone" };

  var answers = input.answers || {};
  return {
    ok: true,
    contact: {
      NAME: name,
      PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }]
    },
    deal: {
      TITLE: "Сайт: заявка на замер",
      COMMENTS: [
        "Источник: сайт titovstroy.kz",
        "Объект: " + (answers.obj || "не указан"),
        "Площадь: " + (answers.area || "не указана"),
        "Старт: " + (answers.when || "не указан")
      ].join("\n")
    }
  };
}

module.exports = { prepareWebsiteLead };
