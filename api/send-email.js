import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  };

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const {
        fullName,
        phoneNumber,
        organisation,
        emailAddress,
        discussionTopic,
        contactMethod,
        message,
        mailingList,
      } = body;

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
        `,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers,
        });
      }

      return new Response(
        JSON.stringify({ message: "Email sent successfully", data }),
        { status: 200, headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred" }),
        { status: 500, headers }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: `Method ${req.method} Not Allowed` }),
    { status: 405, headers }
  );
}
