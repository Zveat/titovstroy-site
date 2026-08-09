"use strict";

var prepareWebsiteLead = require("./lead-payload.cjs").prepareWebsiteLead;

function endpoint(baseUrl, method) {
  return String(baseUrl || "").replace(/\/+$/, "") + "/" + method + ".json";
}

async function callCrm(fetchImpl, baseUrl, method, payload) {
  var response = await fetchImpl(endpoint(baseUrl, method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  var body = await response.json();

  if (!response.ok || body.error || body.result == null) {
    throw new Error("crm_request_failed");
  }

  return body.result;
}

async function addCrmRecord(fetchImpl, baseUrl, method, fields) {
  return callCrm(fetchImpl, baseUrl, method, { fields: fields });
}

async function findContactByPhone(fetchImpl, baseUrl, phone) {
  var matches = await callCrm(fetchImpl, baseUrl, "crm.duplicate.findbycomm", {
    entity_type: "CONTACT",
    type: "PHONE",
    values: [phone]
  });
  return Array.isArray(matches.CONTACT) && matches.CONTACT.length ? matches.CONTACT[0] : null;
}

function createLeadHandler(options) {
  var config = options || {};
  var fetchImpl = config.fetchImpl || globalThis.fetch;
  var baseUrl = config.bitrixWebhookBaseUrl;

  return async function handleLead(payload) {
    var prepared = prepareWebsiteLead(payload);
    if (!prepared.ok) return { status: 400, body: prepared };
    if (!baseUrl) return { status: 503, body: { ok: false, code: "crm_not_configured" } };

    try {
      var contactId = await findContactByPhone(fetchImpl, baseUrl, prepared.contact.PHONE[0].VALUE);
      if (!contactId) contactId = await addCrmRecord(fetchImpl, baseUrl, "crm.contact.add", prepared.contact);
      var dealId = await addCrmRecord(fetchImpl, baseUrl, "crm.deal.add", {
        TITLE: prepared.deal.TITLE,
        COMMENTS: prepared.deal.COMMENTS,
        CONTACT_IDS: [contactId]
      });
      return { status: 201, body: { ok: true, dealId: dealId } };
    } catch (_) {
      return { status: 502, body: { ok: false, code: "crm_unavailable" } };
    }
  };
}

module.exports = { createLeadHandler: createLeadHandler };
