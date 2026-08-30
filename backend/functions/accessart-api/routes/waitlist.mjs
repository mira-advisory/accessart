import { jsonResponse } from "../shared/http.mjs";
import { addToWaitlist } from "../stores/waitlist.mjs";
import { sendEmail } from "../shared/email.mjs";
import { welcomeEmail } from "../shared/templates.mjs";

export async function post(ctx) {
  const email = String(ctx.body?.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return jsonResponse(400, {
      ok: false,
      error: "INVALID_EMAIL",
      message: "that email doesn't look right.",
    });
  }

  const doorsIn = Array.isArray(ctx.body?.doors) ? ctx.body.doors : [];
  const doors = doorsIn.filter((d) => d === "art" || d === "walls");

  await addToWaitlist({ email, doors, source: "landing" });

  // Emails are best-effort: a signup must never fail because SES hiccuped.
  const welcome = welcomeEmail();
  const results = await Promise.allSettled([
    sendEmail({
      to: email,
      subject: welcome.subject,
      text: welcome.text,
      html: welcome.html,
    }),
    process.env.NOTIFY_EMAIL
      ? sendEmail({
          to: process.env.NOTIFY_EMAIL,
          subject: `first access: ${email}`,
          text: `new first access signup\n\nemail: ${email}\ndoors: ${doors.join(", ") || "(none picked)"}\nat: ${new Date().toISOString()}\n`,
        })
      : Promise.resolve(),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("waitlist email failed:", r.reason);
  }

  return jsonResponse(200, { ok: true, data: { email } });
}
