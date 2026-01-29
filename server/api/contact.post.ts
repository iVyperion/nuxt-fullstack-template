import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, message } = body || {}

  if (!name || !email || !message) {
    return { status: 400, error: 'Missing required fields.' }
  }

  const { sendMail } = useNodeMailer()
  try {
    await sendMail({
      to: process.env.CONTACT_TO || 'admin@example.com',
      subject: `Contact Form Submission from ${name}`,
      text: message,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br>${message}</p>`,
      replyTo: email
    })
    return { status: 200, ok: true }
  } catch (e) {
    return { status: 500, error: 'Failed to send email.' }
  }
})
