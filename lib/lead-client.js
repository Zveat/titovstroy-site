(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TitovLeadClient = api;
})(typeof window === "undefined" ? null : window, function () {
  async function submitWebsiteLead(fetchImpl, payload) {
    var response = await fetchImpl("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    var result = await response.json();
    if (!response.ok || !result.ok) throw new Error("lead_submission_failed");
    return result;
  }

  return { submitWebsiteLead: submitWebsiteLead };
});
