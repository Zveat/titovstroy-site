"use strict";

function normalizeKazakhstanPhone(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "8") digits = "7" + digits.slice(1);
  if (!/^7\d{10}$/.test(digits)) return null;
  return "+" + digits;
}

function sourceLabel(value) {
  var object = String(value || "").toLowerCase();
  if (object.includes("новострой")) return "Новостройка";
  if (object.includes("вторич")) return "Вторичка";
  if (object.includes("коммерц")) return "Коммерция";
  if (object.includes("демонтаж")) return "Демонтаж";
  if (object.includes("отдельн")) return "Отдельные работы";
  return "Сайт";
}

function prepareWebsiteLead(payload) {
  var input = payload || {};
  if (String(input.website || "").trim()) return { ok: false, code: "spam" };

  var name = String(input.name || "").trim();
  var phone = normalizeKazakhstanPhone(input.tel);
  if (!name) return { ok: false, code: "invalid_name" };
  if (!phone) return { ok: false, code: "invalid_phone" };

  var answers = input.answers || {};
  var source = sourceLabel(answers.obj);
  var quizChoice = answers.work || answers.obj || "не указан";
  return {
    ok: true,
    contact: {
      NAME: name,
      PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }]
    },
    deal: {
      TITLE: "Сайт / " + source + ": заявка на замер",
      SOURCE_ID: "WEB",
      SOURCE_DESCRIPTION: "titovstroy.kz / " + source,
      COMMENTS: [
        "Источник: сайт titovstroy.kz",
        "Направление страницы: " + source,
        "Что выбрал в квизе: " + quizChoice,
        "Площадь: " + (answers.area || "не указана"),
        "Старт: " + (answers.when || "не указан")
      ].join("\n")
    }
  };
}

module.exports = { prepareWebsiteLead };
