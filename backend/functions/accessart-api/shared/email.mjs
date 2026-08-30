import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({});
const FROM = process.env.FROM_EMAIL;

export async function sendEmail({ to, subject, text, html }) {
  const body = { Text: { Data: text } };
  if (html) body.Html = { Data: html };
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: body,
        },
      },
    })
  );
}
