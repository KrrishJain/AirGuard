
export const sendWhatsApp = async (to, message) => {
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;

    const params = new URLSearchParams();
    params.append("From", "whatsapp:"); // sandbox number
    params.append("To", `whatsapp:${to}`);         // your joined number
    params.append("Body", message);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();
    console.log("Twilio response:", data);

    return !!data.sid;
  } catch (error) {
    console.error("WhatsApp HTTP error:", error.message);
    return false;
  }
};
