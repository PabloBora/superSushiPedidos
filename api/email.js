import { Resend } from 'resend'

const TEST_MODE = process.env.TEST_MODE === 'true'

export async function sendConfirmationEmail({ order, token }) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const phone = process.env.CONTACT_PHONE || '844-XXX-XXXX'
  const managerUrl = `${appUrl}/pedido/${token}`

  // Siempre logueamos el link (útil para debug en cualquier modo)
  console.log('📧 Link del pedido:', managerUrl)

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || 'Super Sushi <pedidos@supersushi.com>'

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY no configurado — email omitido')
    return
  }

  const resend = new Resend(apiKey)

  // En TEST_MODE redirige al email de prueba (evita restricción sandbox de Resend)
  const toEmail = TEST_MODE
    ? (process.env.RESEND_TEST_EMAIL || order.contact.email)
    : order.contact.email


  const itemsHtml = order.items
    .map(i => `<tr>
            <td style="padding:6px 0;border-bottom:1px solid #f0f0f0">${i.name}</td>
            <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:center">${i.qty}</td>
            <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right">$${(i.price * i.qty).toFixed(2)}</td>
        </tr>`)
    .join('')

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

            <!-- Header -->
            <tr><td style="background:#D42B2B;padding:28px 32px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;letter-spacing:-0.5px">SUPER SUSHI</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Tu pedido está confirmado 🍣</p>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding:32px">
              <p style="margin:0 0 4px;font-size:15px;color:#333">Hola <strong>${order.contact.name}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#666">Recibimos tu pedido exitosamente. Aquí tienes el resumen:</p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <thead>
                  <tr style="border-bottom:2px solid #eee">
                    <th style="text-align:left;padding:0 0 8px;font-size:13px;color:#999;font-weight:600">Producto</th>
                    <th style="text-align:center;padding:0 0 8px;font-size:13px;color:#999;font-weight:600">Cant.</th>
                    <th style="text-align:right;padding:0 0 8px;font-size:13px;color:#999;font-weight:600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr>
                  <td style="font-size:14px;color:#666">Subtotal</td>
                  <td style="text-align:right;font-size:14px;color:#333">$${order.totals.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#666">IVA (16%)</td>
                  <td style="text-align:right;font-size:14px;color:#333">$${order.totals.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-size:16px;font-weight:bold;color:#111;padding-top:8px">Total a pagar</td>
                  <td style="text-align:right;font-size:16px;font-weight:bold;color:#D42B2B;padding-top:8px">$${order.totals.total.toFixed(2)}</td>
                </tr>
              </table>

              <!-- Pickup -->
              <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin-bottom:24px">
                <p style="margin:0 0 4px;font-size:13px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">📅 Recogida</p>
                <p style="margin:0;font-size:16px;color:#111;font-weight:bold">${order.pickup.date} · ${order.pickup.time}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px">
                <a href="${managerUrl}"
                   style="display:inline-block;background:#D42B2B;color:#fff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 32px;border-radius:50px">
                  Ver y modificar mi pedido
                </a>
                <p style="margin:12px 0 0;font-size:12px;color:#aaa">Este link es personal, no lo compartas</p>
              </div>

              <!-- Cancel info -->
              <div style="border-top:1px solid #eee;padding-top:20px;text-align:center">
                <p style="margin:0;font-size:13px;color:#666">
                  Para <strong>cancelaciones</strong> llama al <a href="tel:${phone}" style="color:#D42B2B;font-weight:bold">${phone}</a>
                </p>
              </div>
            </td></tr>

            <!-- Footer -->
            <tr><td style="background:#f8f8f8;padding:16px 32px;text-align:center">
              <p style="margin:0;font-size:12px;color:#aaa">Super Sushi · Pick-up disponible hoy 12:00 - 21:00</p>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>`

  try {
    const response = await resend.emails.send({
      from,
      to: toEmail,
      subject: 'Tu pedido en Super Sushi está confirmado 🍣',
      html
    })
    if (response.error) {
      console.error('❌ Resend error:', response.error)
    } else {
      console.log('✅ Email enviado a:', order.contact.email, '| id:', response.data?.id)
    }
  } catch (err) {
    console.error('❌ Error enviando email:', err.message)
  }
}
