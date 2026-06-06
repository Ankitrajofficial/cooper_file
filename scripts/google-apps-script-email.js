const SHARED_SECRET = "replace-with-a-long-random-secret";

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");

    if (payload.secret !== SHARED_SECRET) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    if (!payload.to || !payload.subject || (!payload.html && !payload.text)) {
      return jsonResponse({ error: "Missing email fields." }, 400);
    }

    GmailApp.sendEmail(payload.to, payload.subject, payload.text || "", {
      name: payload.fromName || "Cooperfile",
      htmlBody: payload.html || payload.text || "",
    });

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    return jsonResponse({ error: String(error) }, 500);
  }
}

function jsonResponse(body, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify({ ...body, statusCode }))
    .setMimeType(ContentService.MimeType.JSON);
}
