// Forwards inbound mail for @accessart.net (stored in S3 by an SES receipt rule)
// to FORWARD_TO. From is rewritten to our verified identity (DMARC), original
// sender is preserved in the display name and Reply-To.
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const s3 = new S3Client({});
const ses = new SESv2Client({});

const BUCKET = process.env.MAIL_BUCKET;
const PREFIX = process.env.MAIL_PREFIX ?? "inbound/";
const FORWARD_TO = process.env.FORWARD_TO;
const FROM_EMAIL = process.env.FROM_EMAIL;

export const handler = async (event) => {
  const rec = event.Records?.[0]?.ses;
  if (!rec) return;

  const obj = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: `${PREFIX}${rec.mail.messageId}` })
  );
  const raw = Buffer.from(await obj.Body.transformToByteArray());

  let splitAt = raw.indexOf("\r\n\r\n");
  let sep = "\r\n\r\n";
  if (splitAt === -1) {
    splitAt = raw.indexOf("\n\n");
    sep = "\n\n";
  }
  if (splitAt === -1) {
    splitAt = raw.length;
    sep = "";
  }
  let headers = raw.subarray(0, splitAt).toString("utf8");
  const body = raw.subarray(splitAt);

  const origFrom = (headers.match(/^from:[ \t]?(.*(?:\r?\n[ \t]+.*)*)/im) ?? [])[1]
    ?.replace(/\r?\n[ \t]+/g, " ")
    .trim();

  headers = headers
    .split(/\r?\n(?=[^ \t])/)
    .filter((h) => !/^(return-path|sender|dkim-signature|message-id):/i.test(h))
    .map((h) => {
      if (/^from:/i.test(h)) {
        const safe = (origFrom ?? "unknown sender").replace(/"/g, "'").replace(/[<>]/g, "");
        return `From: "${safe}" <${FROM_EMAIL}>`;
      }
      return h;
    })
    .join("\r\n");

  if (origFrom && !/^reply-to:/im.test(headers)) {
    headers += `\r\nReply-To: ${origFrom}`;
  }

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [FORWARD_TO] },
      Content: { Raw: { Data: Buffer.concat([Buffer.from(headers), Buffer.from(sep ? "" : "\r\n\r\n"), body]) } },
    })
  );
};
