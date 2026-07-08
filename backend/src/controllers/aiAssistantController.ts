import { Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * POST /api/tasks/ai/send-email
 * Sends a meeting reschedule notification email to all meeting members.
 */
export async function sendMeetingRescheduleEmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { meetingTitle, meetingDescription, members, newDate } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      res.status(400).json({ status: 'error', message: 'No member emails provided.' });
      return;
    }

    if (!meetingTitle) {
      res.status(400).json({ status: 'error', message: 'Meeting title is required.' });
      return;
    }

    const senderName = req.userId ? `User (${req.userId.slice(0, 6)}...)` : 'Your Team';
    const formattedDate = newDate
      ? new Date(newDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Tomorrow';

    const htmlContent = `
      <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 28px; max-width: 600px; margin: auto; background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%); border-radius: 16px; border: 1px solid #e0e9ff;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb, #4f46e5); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 20px;">📅</span>
          </div>
          <h2 style="color: #1e3a8a; font-weight: 800; margin: 0; font-size: 18px;">Meeting Rescheduled</h2>
        </div>

        <p style="font-size: 14px; color: #374151; line-height: 1.7; margin-bottom: 8px;">Hi there,</p>
        <p style="font-size: 14px; color: #374151; line-height: 1.7; margin-bottom: 20px;">
          <strong>${senderName}</strong> has rescheduled the following meeting using <strong>Magadige AI Assistant</strong>:
        </p>

        <div style="background: white; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 15px; font-weight: 800; color: #1d4ed8; margin: 0 0 8px 0;">📌 ${meetingTitle}</p>
          ${meetingDescription ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 12px 0;">${meetingDescription}</p>` : ''}
          <div style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 14px;">
            <span style="font-size: 13px; font-weight: 700; color: #2563eb;">📆 New Date: ${formattedDate}</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          Please update your calendar accordingly. If you have any questions, reply to this email or contact ${senderName} directly.
        </p>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0;">
            This email was automatically sent by <strong>Magadige AI Task Assistant</strong>. 
            Please do not reply to this automated notification.
          </p>
        </div>
      </div>
    `;

    if (!transporter) {
      // Log to console if no mailer is configured (dev mode)
      console.log(`📧 [DEV] Meeting reschedule email would be sent to: ${members.join(', ')}`);
      console.log(`📅 Meeting: ${meetingTitle} → New date: ${formattedDate}`);
      res.status(200).json({
        status: 'success',
        message: `Email logged to console (SMTP not configured). Recipients: ${members.join(', ')}`,
        devMode: true,
      });
      return;
    }

    // Send to all members
    const sendResults = await Promise.allSettled(
      members.map((email: string) =>
        transporter!.sendMail({
          from: `"Magadige AI Assistant" <${SMTP_USER}>`,
          to: email,
          subject: `📅 Meeting Rescheduled: ${meetingTitle} → ${formattedDate}`,
          html: htmlContent,
        })
      )
    );

    const successCount = sendResults.filter(r => r.status === 'fulfilled').length;
    const failCount = sendResults.filter(r => r.status === 'rejected').length;

    console.log(`📧 Meeting reschedule emails: ${successCount} sent, ${failCount} failed.`);

    res.status(200).json({
      status: 'success',
      message: `Meeting reschedule emails sent to ${successCount}/${members.length} recipients.`,
      results: { success: successCount, failed: failCount },
    });
  } catch (err: any) {
    console.error('❌ Failed to send meeting reschedule email:', err.message);
    next(err);
  }
}
