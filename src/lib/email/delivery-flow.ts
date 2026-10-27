export type ConfirmationStatus = "sent" | "failed" | "suppressed";

export async function deliverWithConfirmation(steps: {
  notifyOwner: () => Promise<unknown>;
  allowConfirmation: () => boolean;
  confirmToVisitor: () => Promise<unknown>;
}): Promise<ConfirmationStatus> {
  // A receipt is truthful only after SMTP accepts the owner's enquiry.
  await steps.notifyOwner();
  if (!steps.allowConfirmation()) return "suppressed";
  try {
    await steps.confirmToVisitor();
    return "sent";
  } catch {
    // The enquiry has arrived. Do not cause duplicate enquiries by reporting
    // total failure when only the acknowledgement could not be sent.
    return "failed";
  }
}

export function confirmationFeedback(status: ConfirmationStatus) {
  if (status === "sent")
    return "Your enquiry has been sent. A confirmation email is on its way. Emran will get back to you shortly.";
  if (status === "failed")
    return "Your enquiry has been sent. The confirmation email could not be sent, but your message reached Emran. There is no need to resubmit.";
  return "Your enquiry has been sent. A recent confirmation has already been requested for this address. Emran will get back to you shortly.";
}
