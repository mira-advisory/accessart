import { jsonResponse } from "../shared/http.mjs";
import { addToWaitlist } from "../stores/waitlist.mjs";
import { sendEmail } from "../shared/email.mjs";

const WELCOME_TEXT = `thanks for showing interest.

you're on the first access list for accessart — one email when the doors open, and a head start through them. that's it. no spam, no newsletters, nothing weird.

— accessart
rent it. swap it. buy it if it sticks.
accessart.net
`;

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
  const results = await Promise.allSettled([
    sendEmail({
      to: email,
      subject: "ohhh yeh. you're on the list.",
      text: WELCOME_TEXT,
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
