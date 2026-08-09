"use strict";

function createHttpHandler(leadHandler) {
  return async function handleRequest(request, response) {
    if (request.method !== "POST") {
      return response.status(405).json({ ok: false, code: "method_not_allowed" });
    }

    var result = await leadHandler(request.body || {});
    return response.status(result.status).json(result.body);
  };
}

module.exports = { createHttpHandler: createHttpHandler };
