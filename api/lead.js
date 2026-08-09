const { createLeadHandler } = require("../lib/lead-handler.cjs");
const { createHttpHandler } = require("../lib/http-handler.cjs");

module.exports = createHttpHandler(
  createLeadHandler({ bitrixWebhookBaseUrl: process.env.BITRIX_WEBHOOK_BASE_URL })
);
