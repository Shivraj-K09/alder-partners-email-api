import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Handle POST request
  if (req.method === "POST") {
    try {
      const {
        fullName,
        phoneNumber,
        organisation,
        emailAddress,
        discussionTopic,
        contactMethod,
        message,
        mailingList,
      } = req.body;

      const { data, error } = await resend.emails.send({
        from: `${fullName} <onboarding@resend.dev>`,
        to: "contact@alder-invest.com",
        subject: "New Contact Form Submission",
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Phone:</strong> ${phoneNumber}</p>
          <p><strong>Organisation:</strong> ${organisation}</p>
          <p><strong>Email:</strong> ${emailAddress}</p>
          <p><strong>Discussion Topic:</strong> ${discussionTopic}</p>
          <p><strong>Preferred Contact Method:</strong> ${contactMethod}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Join Mailing List:</strong> ${
            mailingList ? "Yes" : "No"
          }</p>
        `,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("Email sent successfully:", data);
      return res.status(200).json({ message: "Email sent successfully", data });
    } catch (error) {
      console.error("Unexpected error in API route:", error);
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
