export type AcknowledgementChannel = "form" | "email";

export const emailAssetBaseUrl = "https://emranlabs.com/email-assets";

// Explicit inline typography survives email clients that discard body styles.
const headingStyle =
  "font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue','Segoe UI Variable Display','Segoe UI Variable','Segoe UI',Helvetica,Arial,sans-serif;font-weight:600;font-style:normal;font-optical-sizing:auto";

export const emailContactNumbers = [
  { country: "UAE", display: "+971 52 385 7572", digits: "971523857572" },
  { country: "Pakistan", display: "+92 323 3333898", digits: "923233333898" },
] as const;

export const emailSocialLinks = [
  {
    label: "LinkedIn",
    icon: "in",
    color: "#0a66c2",
    href: "https://www.linkedin.com/in/emran-younas-641903223/",
  },
  {
    label: "Instagram",
    icon: "&#9678;",
    color: "#b73274",
    href: "https://www.instagram.com/emranlabs/",
  },
  {
    label: "Facebook",
    icon: "f",
    color: "#1877f2",
    href: "https://www.facebook.com/profile.php?id=61591857599555",
  },
  {
    label: "YouTube",
    icon: "&#9654;",
    color: "#c62929",
    href: "https://www.youtube.com/@EmranLabs",
  },
] as const;

export function receiptReference(requestId: string) {
  const safeId = requestId.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `EL-${safeId.slice(0, 12)}`;
}

/** Email-safe tables, inline styles and small static first-party PNG assets. */
export function acknowledgement(
  channel: AcknowledgementChannel,
  requestId?: string,
) {
  const isForm = channel === "form";
  const reference = isForm && requestId ? receiptReference(requestId) : null;
  const subject = isForm
    ? "Your enquiry is with Emran | EMRAN LABS"
    : "Message received — thank you | EMRAN LABS";
  const intro = isForm
    ? "Thanks for sharing your project. Your form submission has been received. Emran will review your requirements and get back to you shortly."
    : "Thanks for reaching out. Your message has been received. Emran will read it and get back to you shortly.";
  const note = isForm
    ? "This is an automated receipt confirmation. It does not confirm an order, booking, price or project start date."
    : "This is an automated message receipt. Emran’s personal reply will follow.";
  const headline = isForm
    ? "Your enquiry.<br>In good hands."
    : "Message received.<br>Thank you.";
  const whatsappMessage = isForm
    ? `Hi Emran, I’d like to discuss my project following my website enquiry${reference ? ` (${reference})` : ""}.`
    : "Hi Emran, I’ve emailed EMRAN LABS and would like to discuss my project with you.";
  const whatsappHref = (digits: string) =>
    `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`;
  const contactAction = (href: string, label: string, icon: string) =>
    `<td width="33.33%" align="center" valign="top"><a href="${href}" style="display:block;padding:4px 0;min-height:44px;text-align:center;text-decoration:none;color:#596779"><img src="${emailAssetBaseUrl}/${icon}-v1.png" width="28" height="28" alt="" style="display:block;width:28px;height:28px;margin:0 auto;border:0"><span class="contact-action-label" style="display:block;padding-top:5px;font-size:10px;line-height:15px;font-weight:500;white-space:nowrap">${label}</span></a></td>`;
  const contactsHtml = emailContactNumbers
    .map(
      ({ country, display, digits }, index) => `
<td class="contact-country" width="50%" align="center" valign="top" style="width:50%;padding:18px 12px 14px;${index ? "border-left:1px solid #edf0f4;" : ""}">
<table role="presentation" align="center" style="margin:0 auto 10px;border-collapse:separate;border-spacing:0"><tr><td class="contact-flag" bgcolor="#f4f6f8" style="padding:3px;background-color:#f4f6f8;border:1px solid #cbd3dd;border-radius:6px"><img src="${emailAssetBaseUrl}/flag-${country === "UAE" ? "ae" : "pk"}-v1.png" width="36" height="24" alt="${country} flag" style="display:block;width:36px;height:24px;border:0"></td></tr></table>
<a class="contact-number" href="tel:+${digits}" style="display:inline-block;font-size:17px;line-height:24px;font-weight:600;letter-spacing:-.4px;color:#202631;text-decoration:none;white-space:nowrap">${display}</a>
<p class="contact-country-name" style="margin:2px 0 12px;font-size:11px;line-height:16px;font-weight:400;color:#697586">${country === "UAE" ? "United Arab Emirates" : country}</p>
<table class="contact-action-table" role="presentation" align="center" width="100%" style="max-width:156px;margin:0 auto;table-layout:fixed;border-collapse:separate;border-spacing:0"><tr>
${contactAction(`tel:+${digits}`, "Call", "call")}
${contactAction(whatsappHref(digits), "WhatsApp", "whatsapp")}
${contactAction(`sms:+${digits}`, "SMS", "sms")}
</tr></table>
</td>`,
    )
    .join("");
  const socialsHtml = emailSocialLinks
    .map(
      ({ label, icon, href }) =>
        `<td width="25%" align="center" valign="top" style="padding:0 3px"><a href="${href}" style="display:inline-block;color:#6e6e73;text-decoration:none"><span style="display:inline-block;width:30px;line-height:30px;border-radius:50%;background-color:#eeeef0;color:#515154;font-size:13px;font-weight:600">${icon}</span><br><span style="display:inline-block;padding-top:7px;font-size:11px;line-height:16px">${label}</span></a></td>`,
    )
    .join("");
  const text = [
    "EMRAN LABS",
    isForm ? "Enquiry received." : "Message received. Thank you.",
    "",
    intro,
    ...(reference ? ["", `Reference: ${reference}`] : []),
    "",
    "A personal reply is next.",
    "Emran Younas — Independent designer & developer",
    "Anything to add? Reply to this email with any extra details.",
    "",
    note,
    "",
    "helo@emranlabs.com",
    "Dubai, UAE",
    "",
    "YOUR IDEA. LET’S BUILD IT.",
    "From the first concept to the final build, work directly with Emran.",
    "Web & apps · Design · Motion & 3D",
    `Discuss your project on WhatsApp: ${whatsappHref(emailContactNumbers[0].digits)}`,
    "",
    "CHOOSE YOUR PREFERRED CONTACT",
    ...emailContactNumbers.flatMap(({ country, display, digits }) => [
      `${country}: ${display}`,
      `Call: tel:+${digits}`,
      `WhatsApp: ${whatsappHref(digits)}`,
      `SMS: sms:+${digits}`,
    ]),
    "",
    "EXPLORE & CONNECT",
    ...emailSocialLinks.map(({ label, href }) => `${label}: ${href}`),
  ].join("\n");
  // Only a sanitized server-generated reference is interpolated; no visitor content.
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${subject}</title>
<style>
body{margin:0;padding:0}table{border-collapse:collapse}a{color:#0066cc}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
@media(max-width:620px){.outer{padding:24px 12px!important}.hero{padding:34px 24px 30px!important}.title{font-size:34px!important;line-height:38px!important;letter-spacing:-1.1px!important}.intro{font-size:16px!important;line-height:25px!important}.section{padding:26px 20px!important}.lead-section{padding:32px 20px 24px!important}.lead-title{font-size:34px!important;line-height:38px!important;letter-spacing:-1px!important}.contact-country{padding:16px 6px 12px!important}.contact-number{font-size:15px!important;line-height:22px!important}.contact-country-name{font-size:10px!important}.contact-action-label{font-size:9px!important}.footer{padding:24px 16px!important}}
@media(max-width:360px){.title{font-size:30px!important;line-height:34px!important;letter-spacing:-.8px!important}.lead-title{font-size:32px!important;line-height:36px!important;letter-spacing:-.8px!important}.contact-number{font-size:13px!important;letter-spacing:-.3px!important}.contact-country-name{font-size:9px!important}.contact-action-label{font-size:8.5px!important}}
</style></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${intro}</div>
<table role="presentation" width="100%" bgcolor="#f5f5f7"><tr><td class="outer" align="center" style="padding:36px 20px">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" style="max-width:600px">
<tr><td align="center" style="padding:0 0 27px"><span style="${headingStyle};font-size:26px;line-height:32px;letter-spacing:-1px;color:#1d1d1f">emran<span style="font-weight:400">labs</span><span style="color:#0071e3">.</span></span></td></tr>
<tr><td bgcolor="#ffffff" style="background-color:#ffffff;border-radius:28px;overflow:hidden">
<table role="presentation" width="100%">
<tr><td class="hero" align="center" style="padding:44px 48px 36px">
<table role="presentation" align="center" style="border-collapse:separate;border-spacing:0"><tr><td width="66" height="66" align="center" valign="middle" bgcolor="#edf5ff" style="width:66px;height:66px;border:1px solid #dcecff;border-radius:20px;background-color:#edf5ff;background-image:linear-gradient(145deg,#fbfdff,#e6f1ff);box-shadow:0 4px 14px #0071e30d;color:#0071e3;font-size:35px;font-weight:400">&#10003;</td></tr></table>
<p style="${headingStyle};margin:25px 0 13px;font-size:11px;line-height:18px;font-weight:500;color:#73737a;letter-spacing:.9px">${isForm ? "ENQUIRY RECEIVED" : "EMRAN LABS · CONFIRMATION"}</p>
<h1 class="title" style="${headingStyle};margin:0 0 21px;font-size:44px;line-height:48px;letter-spacing:-1.6px;color:#1d1d1f">${headline}</h1>
<p class="intro" style="margin:0;font-size:17px;line-height:27px;font-weight:400;letter-spacing:-.2px;color:#6e6e73">${intro}</p>
${reference ? `<p style="margin:22px 0 0;font-size:11px;line-height:19px;color:#86868b">YOUR REFERENCE<br><span style="font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;color:#515154">${reference}</span></p>` : ""}
<table role="presentation" align="center" style="margin:27px auto 0"><tr><td bgcolor="#0071e3" style="background-color:#0071e3;border-radius:999px;mso-padding-alt:13px 24px"><a href="mailto:helo@emranlabs.com" style="display:inline-block;padding:13px 24px;border:1px solid #0071e3;border-radius:999px;font-size:15px;line-height:20px;font-weight:400;color:#ffffff;text-decoration:none">Reply to Emran</a></td></tr></table>
<p style="margin:14px 0 0;font-size:12px;line-height:18px;color:#86868b">Anything to add? Keep the conversation going.</p>
</td></tr>
<tr><td class="section" align="center" style="padding:27px 40px;border-top:1px solid #ededf0">
<h2 class="reply-title" style="${headingStyle};margin:0 0 7px;font-size:20px;line-height:26px;letter-spacing:-.5px;color:#1d1d1f">A personal reply is next.</h2>
<p style="margin:0;font-size:14px;line-height:22px;color:#6e6e73">Emran Younas<br><span style="font-size:12px;color:#86868b">Independent designer &amp; developer</span></p>
</td></tr>
<tr><td class="lead-section" align="center" bgcolor="#f0f5fc" style="padding:36px 26px 26px;background-color:#f0f5fc;background-image:linear-gradient(145deg,#edf5ff 0%,#f7f8fc 52%,#edf1fa 100%);border-top:1px solid #e4ecf6">
<table role="presentation" align="center" style="border-collapse:separate;border-spacing:0"><tr><td bgcolor="#ffffff" style="${headingStyle};padding:7px 13px;border:1px solid #dce7f5;border-radius:999px;background-color:#ffffff;font-size:10px;line-height:16px;letter-spacing:.8px;color:#4b6584">LET’S TALK ABOUT YOUR PROJECT</td></tr></table>
<h2 class="lead-title" style="${headingStyle};margin:20px 0 14px;font-size:40px;line-height:44px;letter-spacing:-1.3px;color:#1d1d1f">Your idea.<br><span style="color:#0071e3">Let’s build it.</span></h2>
<p style="max-width:350px;margin:0 auto;font-size:15px;line-height:23px;letter-spacing:-.1px;color:#5d6b7d">From the first concept to the final build,<br>work directly with Emran.</p>
<p style="margin:17px 0 0;font-size:11px;line-height:19px;font-weight:500;color:#63748b">Web &amp; apps<span style="padding:0 9px;color:#a4b2c5">&middot;</span>Design<span style="padding:0 9px;color:#a4b2c5">&middot;</span>Motion &amp; 3D</p>
<table role="presentation" align="center" style="margin:24px auto 0;border-collapse:separate;border-spacing:0"><tr><td align="center" bgcolor="#0071e3" style="border-radius:16px;background-color:#0071e3;background-image:linear-gradient(180deg,#1684f1,#0071e3);box-shadow:0 6px 18px #0066cc24;mso-padding-alt:16px 25px"><a href="${whatsappHref(emailContactNumbers[0].digits)}" style="display:inline-block;padding:16px 25px;border:1px solid #0071e3;border-radius:16px;font-size:15px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none">Discuss your project<span style="padding-left:14px;font-size:18px;font-weight:400">&#8599;</span></a></td></tr></table>
<p style="margin:11px 0 0;font-size:11px;line-height:18px;color:#6d7d91">Start a conversation on WhatsApp &middot; UAE</p>
<table class="direct-contact" role="presentation" width="100%" style="margin-top:28px;border-collapse:separate;border-spacing:0"><tr><td bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e0e7f0;border-radius:22px;overflow:hidden;box-shadow:0 4px 16px #273b5a05">
<table role="presentation" width="100%">
<tr><td style="padding:16px 18px 14px;border-bottom:1px solid #edf0f4;text-align:left">
<h3 class="contact-title" style="${headingStyle};margin:0 0 3px;font-size:18px;line-height:24px;letter-spacing:-.35px;color:#1d1d1f">Connect with Emran</h3>
<p style="margin:0;font-size:11px;line-height:17px;color:#697586">Call, WhatsApp or text. Your choice.</p>
</td></tr>
<tr><td><table role="presentation" width="100%" style="table-layout:fixed"><tr>${contactsHtml}</tr></table></td></tr>
</table>
</td></tr></table>
</td></tr>
</table>
</td></tr>
<tr><td class="footer" align="center" style="padding:26px 44px 0">
<table role="presentation" align="center" width="100%" style="max-width:340px"><tr>${socialsHtml}</tr></table>
<p style="margin:25px 0 10px;font-size:11px;line-height:18px;color:#86868b">${note}</p>
<p style="margin:0;font-size:11px;line-height:18px;color:#86868b">EMRAN LABS · Dubai, UAE<br><a href="mailto:helo@emranlabs.com" style="color:#6e6e73;text-decoration:none">helo@emranlabs.com</a></p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  return { subject, html, text };
}
