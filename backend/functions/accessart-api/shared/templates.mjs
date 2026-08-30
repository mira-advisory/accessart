// Email templates in the brand language: paper + ink + red, condensed caps
// against serif italic, dry lowercase copy. All styles inline (Gmail strips
// everything else); web fonts don't load in email, so the stacks lean on
// Impact / Georgia as the closest built-in voices.
const PAPER = "#e9e4d8";
const INK = "#141310";
const RED = "#e8391d";
const MUTED = "#4a463d";

const CONDENSED = "Impact,'Arial Narrow',Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
const GROT = "Arial,Helvetica,sans-serif";

export function welcomeEmail() {
  const subject = "ohhh yeh. you're on the list.";

  const text = `ohhh yeh. you're on the list.

thanks for showing interest. you're on the first access list for accessart — one email when the doors open, and a head start through them.

that's it. no spam, no newsletters, nothing weird.

not a gallery.

rent it. swap it. buy it if it sticks.
accessart.net
`;

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${PAPER};">
  <div style="background:${PAPER};padding:40px 16px;">
    <div style="max-width:560px;margin:0 auto;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;padding-right:7px;">
          <div style="width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-bottom:19px solid ${INK};font-size:0;line-height:0;">&nbsp;</div>
        </td>
        <td style="vertical-align:middle;font-family:${GROT};font-size:22px;font-weight:bold;color:${INK};letter-spacing:-0.5px;">art</td>
      </tr></table>

      <div style="height:34px;"></div>

      <div style="font-family:${CONDENSED};font-size:66px;line-height:0.95;color:${INK};text-transform:uppercase;">ohhh yeh.</div>
      <div style="font-family:${SERIF};font-style:italic;font-size:27px;color:${INK};padding-top:12px;">you&rsquo;re on the list.</div>

      <div style="height:26px;"></div>
      <div style="height:3px;background:${INK};font-size:0;line-height:0;">&nbsp;</div>
      <div style="height:26px;"></div>

      <div style="font-family:${GROT};font-size:15px;line-height:1.65;color:${MUTED};">
        thanks for showing interest. you&rsquo;re on the first access list for accessart &mdash; one email when the doors open, and a head start through them.
        <br><br>
        that&rsquo;s it. no spam, no newsletters, nothing weird.
      </div>

      <div style="height:30px;"></div>

      <div style="display:inline-block;border:3px double ${RED};color:${RED};padding:10px 16px;font-family:${CONDENSED};font-size:14px;letter-spacing:2px;text-transform:uppercase;">not a gallery.</div>

      <div style="height:40px;"></div>

      <div style="font-family:${GROT};font-size:13px;line-height:1.7;color:#6f6a5c;">
        rent it. swap it. buy it if it sticks.<br>
        <a href="https://accessart.net" style="color:${RED};text-decoration:none;font-weight:bold;">accessart.net</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
