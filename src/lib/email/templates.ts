export const orderConfirmationTemplate = (
  orderNumber: string,
  beatTitle: string,
  downloadUrl: string
) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1f2937; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { color: #06b6d4; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
      .button { background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
      .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🎵 Beat Purchase Confirmed</div>
      <p>Your beat purchase is ready to download!</p>
      <p><strong>${beatTitle}</strong></p>
      <p>Order #: ${orderNumber}</p>
      <a href="${downloadUrl}" class="button">Download Your Beat</a>
      <div class="footer">
        <p>This link expires in 24 hours.</p>
        <p>Thanks for supporting DJMEXXICO!</p>
      </div>
    </div>
  </body>
</html>
`;

export const subscriptionConfirmationTemplate = (tier: string, appUrl: string) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1f2937; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { color: #06b6d4; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
      .button { background: #06b6d4; color: #1f2937; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
      ul { margin: 15px 0; }
      li { margin: 8px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🎉 Welcome to ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier</div>
      <p>Your management subscription is now active!</p>
      <p>You now have access to:</p>
      <ul>
        <li>✓ Exclusive SoundCloud placements</li>
        <li>✓ Monthly IG promo collaborations</li>
        <li>✓ Artist dashboard & upload queue</li>
        <li>✓ Priority support</li>
      </ul>
      <a href="${appUrl}/dashboard" class="button">Go to Your Dashboard</a>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        Questions? Contact us at support@djmexxico.com
      </p>
    </div>
  </body>
</html>
`;

export const adminUploadNotificationTemplate = (
  userName: string,
  uploadTitle: string,
  dashboardUrl: string
) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1f2937; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { color: #06b6d4; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
      .button { background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">📤 New Artist Upload</div>
      <p><strong>${userName}</strong> submitted a new upload:</p>
      <p><em>${uploadTitle}</em></p>
      <a href="${dashboardUrl}/admin" class="button">Review in Admin Panel</a>
    </div>
  </body>
</html>
`;
