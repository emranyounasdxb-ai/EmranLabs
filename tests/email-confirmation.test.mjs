import test from "node:test";
import assert from "node:assert/strict";
import {
  acknowledgement,
  emailAssetBaseUrl,
} from "../src/lib/email/acknowledgement.ts";
import {
  deliverWithConfirmation,
  confirmationFeedback,
} from "../src/lib/email/delivery-flow.ts";

test("no confirmation when owner delivery fails", async () => {
  let confirmations = 0;
  await assert.rejects(
    deliverWithConfirmation({
      notifyOwner: async () => {
        throw new Error("SMTP rejected enquiry");
      },
      allowConfirmation: () => true,
      confirmToVisitor: async () => {
        confirmations++;
      },
    }),
  );
  assert.equal(confirmations, 0);
});
test("owner gets enquiry before visitor confirmation", async () => {
  const events = [];
  const status = await deliverWithConfirmation({
    notifyOwner: async () => events.push("owner"),
    allowConfirmation: () => true,
    confirmToVisitor: async () => events.push("visitor"),
  });
  assert.deepEqual(events, ["owner", "visitor"]);
  assert.equal(status, "sent");
});
test("confirmation failure does not ask visitor to resend delivered enquiry", async () => {
  const status = await deliverWithConfirmation({
    notifyOwner: async () => {},
    allowConfirmation: () => true,
    confirmToVisitor: async () => {
      throw new Error("SMTP timeout");
    },
  });
  assert.equal(status, "failed");
  assert.match(confirmationFeedback(status), /no need to resubmit/);
});
test("repeat confirmation can be suppressed without losing enquiry", async () => {
  let owners = 0;
  const status = await deliverWithConfirmation({
    notifyOwner: async () => {
      owners++;
    },
    allowConfirmation: () => false,
    confirmToVisitor: async () => assert.fail("must not send duplicate"),
  });
  assert.equal(owners, 1);
  assert.equal(status, "suppressed");
});
test("HTML receipt cannot reflect injected markup and only uses fixed email artwork", () => {
  const receipt = acknowledgement("form", '<script>alert("x")</script>');
  assert.doesNotMatch(receipt.html, /<script|<svg|%subject%|%from%|%email%/i);
  const expectedAssets = new Set(
    ["call", "whatsapp", "sms", "flag-ae", "flag-pk"].map(
      (name) => `${emailAssetBaseUrl}/${name}-v1.png`,
    ),
  );
  const imageSources = [...receipt.html.matchAll(/src="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(imageSources.length, 8);
  assert.deepEqual(new Set(imageSources), expectedAssets);
  assert.match(receipt.text, /does not confirm an order/);
  assert.match(receipt.html, /automated receipt confirmation/);
  assert.match(receipt.html, /max-width:600px/);
  assert.match(acknowledgement("email").html, /Your message/);
  assert.doesNotMatch(acknowledgement("email").html, /YOUR REFERENCE/);
});

test("form and direct email have distinct copy and actionable confirmed contacts", () => {
  const form = acknowledgement("form", "request-123");
  const direct = acknowledgement("email", "request-123");
  assert.notEqual(form.subject, direct.subject);
  assert.match(form.html, /form submission has been received/);
  assert.match(form.html, /YOUR REFERENCE/);
  assert.match(direct.html, /Your message has been received/);
  assert.doesNotMatch(direct.html, /YOUR REFERENCE|form submission/);
  for (const receipt of [form, direct]) {
    for (const number of ["971523857572", "923233333898"]) {
      assert.ok(receipt.html.includes(`href="tel:+${number}"`));
      assert.ok(receipt.html.includes(`href="sms:+${number}"`));
      assert.ok(receipt.text.includes(`SMS: sms:+${number}`));
      const whatsappLinks = [...receipt.html.matchAll(/href="([^"]+)"/g)]
        .map((match) => new URL(match[1]))
        .filter(
          (url) => url.hostname === "wa.me" && url.pathname === `/${number}`,
        );
      assert.ok(whatsappLinks.length > 0);
      for (const url of whatsappLinks) {
        const message = url.searchParams.get("text");
        assert.match(message, /discuss my project/);
        if (receipt === form) assert.match(message, /EL-REQUEST123/);
        else assert.doesNotMatch(message, /EL-REQUEST123|website enquiry/);
      }
    }
    const links = [...receipt.html.matchAll(/href="([^"]+)"/g)].map(
      (match) => new URL(match[1]),
    );
    const hosts = new Set([
      "wa.me",
      "www.linkedin.com",
      "www.instagram.com",
      "www.facebook.com",
      "www.youtube.com",
    ]);
    for (const link of links) {
      assert.ok(
        link.protocol === "mailto:" ||
          link.protocol === "tel:" ||
          link.protocol === "sms:" ||
          (link.protocol === "https:" && hosts.has(link.hostname)),
      );
    }
    assert.doesNotMatch(receipt.text, /sales team|order (is )?booked/i);
  }
});
