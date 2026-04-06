import { Resend } from 'resend';
import {
  orderConfirmationTemplate,
  subscriptionConfirmationTemplate,
  adminUploadNotificationTemplate,
} from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(
  userEmail: string,
  orderNumber: string,
  beatTitle: string,
  downloadUrl: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    await resend.emails.send({
      from: 'orders@djmexxico.com',
      to: userEmail,
      subject: '🎵 Your Beat Purchase is Ready',
      html: orderConfirmationTemplate(orderNumber, beatTitle, downloadUrl),
    });
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
  }
}

export async function sendSubscriptionConfirmation(
  userEmail: string,
  tier: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    await resend.emails.send({
      from: 'subscriptions@djmexxico.com',
      to: userEmail,
      subject: `🎉 Welcome to ${tier.charAt(0).toUpperCase() + tier.slice(1)} Management Tier`,
      html: subscriptionConfirmationTemplate(tier, process.env.NEXT_PUBLIC_APP_URL || 'https://djmexxico.com'),
    });
  } catch (error) {
    console.error('Failed to send subscription confirmation:', error);
  }
}

export async function sendAdminUploadNotification(
  userName: string,
  uploadTitle: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    await resend.emails.send({
      from: 'notifications@djmexxico.com',
      to: 'admin@djmexxico.com',
      subject: `📤 New Artist Upload: ${uploadTitle}`,
      html: adminUploadNotificationTemplate(userName, uploadTitle, process.env.NEXT_PUBLIC_APP_URL || 'https://djmexxico.com'),
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}
