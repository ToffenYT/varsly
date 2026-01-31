export function alertEmailHtml(opts: {
  keyword: string;
  tenderTitle: string;
  organization: string;
  deadline: string;
  tenderUrl: string;
  unsubscribeUrl: string;
  settingsUrl: string;
}) {
  const {
    keyword,
    tenderTitle,
    organization,
    deadline,
    tenderUrl,
    unsubscribeUrl,
    settingsUrl,
  } = opts;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="padding:24px;border-bottom:1px solid #e4e4e7;">
      <h2 style="margin:0;font-size:18px;color:#18181b;">
        Nytt anbud funnet for søkeordet: "${keyword}"
      </h2>
    </div>
    <div style="padding:24px;">
      <p style="color:#71717a;margin:0 0 24px 0;">
        Hei! Vi har funnet et nytt anbud som matcher dine søkekriterier:
      </p>
      <div style="background:#f4f4f5;border-radius:8px;padding:20px;margin-bottom:24px;border:1px solid #e4e4e7;">
        <h3 style="margin:0 0 12px 0;font-size:16px;color:#18181b;line-height:1.4;">
          ${escapeHtml(tenderTitle)}
        </h3>
        <div style="font-size:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#71717a;">Utlyser:</span>
            <span style="color:#18181b;font-weight:500;">${escapeHtml(organization)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#71717a;">Frist:</span>
            <span style="color:#b91c1c;font-weight:500;">${escapeHtml(deadline)}</span>
          </div>
        </div>
      </div>
      <a href="${escapeHtml(tenderUrl)}" style="display:block;width:100%;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff!important;text-align:center;padding:16px;border-radius:8px;font-weight:500;text-decoration:none;font-size:16px;">
        Se detaljer og dokumenter
      </a>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e4e4e7;text-align:center;">
        <p style="font-size:12px;color:#71717a;margin:0;">
          Du mottar dette varselet fordi du abonnerer på søkeordet "${escapeHtml(keyword)}".
          <br/>
          <a href="${unsubscribeUrl}" style="color:#3b82f6;">Meld av varsling</a>
          &nbsp;&middot;&nbsp;
          <a href="${settingsUrl}" style="color:#3b82f6;">Administrer innstillinger</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function digestEmailHtml(opts: {
  items: Array<{
    keyword: string;
    tenderTitle: string;
    organization: string;
    deadline: string;
    tenderUrl: string;
  }>;
  unsubscribeUrl: string;
  settingsUrl: string;
}) {
  const { items, unsubscribeUrl, settingsUrl } = opts;
  const count = items.length;
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e4e4e7;">
          <strong style="color:#18181b;">${escapeHtml(i.tenderTitle)}</strong><br/>
          <span style="font-size:13px;color:#71717a;">${escapeHtml(i.organization)} &middot; Frist: ${escapeHtml(i.deadline)}</span><br/>
          <a href="${escapeHtml(i.tenderUrl)}" style="color:#3b82f6;font-size:13px;">Se detaljer</a>
        </td>
      </tr>
    `
    )
    .join("");
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="padding:24px;border-bottom:1px solid #e4e4e7;">
      <h2 style="margin:0;font-size:18px;color:#18181b;">
        Dagens oppsummering – ${count} nye anbud
      </h2>
    </div>
    <div style="padding:24px;">
      <p style="color:#71717a;margin:0 0 24px 0;">
        Her er anbudene som matchet dine søkeord i dag:
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e4e4e7;text-align:center;">
        <p style="font-size:12px;color:#71717a;margin:0;">
          <a href="${unsubscribeUrl}" style="color:#3b82f6;">Meld av varsling</a>
          &nbsp;&middot;&nbsp;
          <a href="${settingsUrl}" style="color:#3b82f6;">Administrer innstillinger</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
