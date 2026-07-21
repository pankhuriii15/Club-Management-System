const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter
let transporter;

const isEmailConfigured = !!(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
);

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    pool: true,              // Reuse SMTP connections (avoids repeated TLS handshakes)
    maxConnections: 3,       // Up to 3 parallel connections
    maxMessages: 50,         // Reuse each connection for up to 50 messages
    connectionTimeout: 5000, // 5s connection timeout
    greetingTimeout: 5000,   // 5s greeting timeout
    socketTimeout: 10000     // 10s socket timeout
  });

  // Verify SMTP connection
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP Verify Error:", error);
    } else {
      console.log("✅ SMTP Server is ready");
    }
  });
}

/**
 * Send general email
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EduEvent Manager" <noreply@eduevent.com>',
    to,
    subject,
    text,
    html
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
  console.error("========== EMAIL ERROR ==========");
  console.error(error);
  console.error("================================");
  return null;
}
  } else {
    console.log('\n--- EMAIL NOTIFICATION SIMULATION ---');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:    ${text || 'HTML Content (see logs)'}`);
    console.log('-------------------------------------\n');
    return { simulated: true };
  }
};

/**
 * Send club/event registration confirmation email
 */
const sendRegistrationConfirmationEmail = async (student, itemName, isClub = true) => {
  const type = isClub ? 'Club' : 'Event';
  const subject = `Registration Request Received - ${itemName}`;
  const text = `Hello ${student.name},\n\nYour registration request for the ${type} "${itemName}" has been successfully submitted and is currently pending review. We will notify you once there is an update.\n\nBest regards,\nEduEvent Manager Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #667eea; text-align: center;">Registration Request Received</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      <p>Your registration request for the <strong>${type} "${itemName}"</strong> has been successfully submitted.</p>
      <p>Status: <span style="background-color: #ffeeb2; color: #856404; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Pending Review</span></p>
      <p>The Club Coordinator or Admin will review your registration shortly. You can track your request status directly from your dashboard.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message from EduEvent Manager.</p>
    </div>
  `;
  return await sendEmail({ to: student.email, subject, text, html });
};

/**
 * Send payment success email
 */
const sendPaymentSuccessEmail = async (student, itemName, amount, orderId) => {
  const subject = `Payment Successful - ${itemName}`;
  const text = `Hello ${student.name},\n\nYour payment of INR ${amount} for "${itemName}" was successful.\n\nOrder ID: ${orderId}\n\nThank you!\nEduEvent Manager Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #28a745; text-align: center;">Payment Successful</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      <p>Thank you for your payment. Here are the transaction details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="border-bottom: 1px solid #eee; height: 35px;">
          <td><strong>Item Name:</strong></td>
          <td>${itemName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee; height: 35px;">
          <td><strong>Amount Paid:</strong></td>
          <td>INR ${amount}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee; height: 35px;">
          <td><strong>Order ID:</strong></td>
          <td>${orderId}</td>
        </tr>
      </table>
      <p>Your registration request has been created and is under coordinator review.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message from EduEvent Manager.</p>
    </div>
  `;
  return await sendEmail({ to: student.email, subject, text, html });
};

/**
 * Send registration approval email
 */
const sendApprovalEmail = async (student, itemName, isClub = true) => {
  const type = isClub ? 'Club' : 'Event';
  const subject = isClub ? `Club Application Approved! - ${itemName}` : `Registration Approved! - ${itemName}`;
  
  const text = isClub
    ? `Congratulations ${student.name}!\n\nYour application to join the "${itemName}" club has been APPROVED. You have been selected to proceed to the next stages of the club's selection/recruitment process. The Club Coordinator will reach out to you shortly with further details and schedule info.\n\nBest regards,\nEduEvent Manager Team`
    : `Congratulations ${student.name}!\n\nYour registration request for the Event "${itemName}" has been APPROVED. Welcome aboard!\n\nBest regards,\nEduEvent Manager Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #28a745; text-align: center;">Congratulations! 🎉</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      ${isClub ? `
        <p>We are excited to inform you that your application request to join the <strong>"${itemName}" club</strong> has been <span style="background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Approved</span>.</p>
        <p>You have been selected to proceed to the next stages of the club's <strong>selection/recruitment process</strong>.</p>
        <p>The Club Coordinator will contact you shortly with further details, dates, and schedule information for the next rounds.</p>
      ` : `
        <p>We are excited to inform you that your registration request for the event <strong>"${itemName}"</strong> has been <span style="background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Approved</span>.</p>
        <p>You can check the details and participate in the activities by logging into your account.</p>
      `}
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message from EduEvent Manager.</p>
    </div>
  `;
  return await sendEmail({ to: student.email, subject, text, html });
};

/**
 * Send registration rejection email
 */
const sendRejectionEmail = async (student, itemName, isClub = true, remarks = '') => {
  const type = isClub ? 'Club' : 'Event';
  const subject = `Registration Status Update - ${itemName}`;
  const text = `Hello ${student.name},\n\nWe regret to inform you that your registration request for the ${type} "${itemName}" has been rejected.\n\nCoordinator Remarks: ${remarks || 'None provided'}\n\nBest regards,\nEduEvent Manager Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #dc3545; text-align: center;">Registration Update</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      <p>We regret to inform you that your registration request for the <strong>${type} "${itemName}"</strong> has been <span style="background-color: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Rejected</span>.</p>
      ${remarks ? `<p><strong>Reason/Remarks:</strong> ${remarks}</p>` : ''}
      <p>If you have any questions, please contact the Club Coordinator.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message from EduEvent Manager.</p>
    </div>
  `;
  return await sendEmail({ to: student.email, subject, text, html });
};

/**
 * Send registration shortlist email
 */
const sendShortlistEmail = async (student, itemName, isClub = true, remarks = '') => {
  const type = isClub ? 'Club' : 'Event';
  const subject = `Shortlisted for ${itemName}`;
  const text = `Hello ${student.name},\n\nWe are pleased to inform you that you have been shortlisted for the ${type} "${itemName}" recruitment/participation round.\n\nNext steps/Remarks: ${remarks || 'Please wait for further communication'}\n\nBest regards,\nEduEvent Manager Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #17a2b8; text-align: center;">You're Shortlisted! 🌟</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      <p>We are pleased to inform you that you have been <span style="background-color: #d1ecf1; color: #0c5460; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Shortlisted</span> for the <strong>${type} "${itemName}"</strong>.</p>
      ${remarks ? `<p><strong>Coordinator Instructions:</strong> ${remarks}</p>` : '<p>Please check your email and student dashboard for details regarding the next rounds/steps.</p>'}
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message from EduEvent Manager.</p>
    </div>
  `;
  return await sendEmail({ to: student.email, subject, text, html });
};

/**
 * Send event registration success ticket confirmation email
 */
const sendEventRegistrationSuccessEmail = async ({ student, event, club, registration, payment }) => {
  const subject = `Event Ticket & Registration Confirmation - ${event.title}`;
  
  // Format Date and Time
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = new Date(event.date).toLocaleDateString('en-US', dateOptions);
  const startTimeStr = new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  // Add 3 hours to start time for simulated end time
  const endTime = new Date(new Date(event.date).getTime() + 3 * 60 * 60 * 1000);
  const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const text = `Hello ${student.name},\n\nYou have successfully registered for the event "${event.title}" organized by ${club.name}.\n\nTicket Details:\n- Registration ID: ${registration._id}\n- Venue: ${event.venue}\n- Date: ${dateStr}\n- Time: ${startTimeStr} - ${endTimeStr}\n- Payment Status: Paid (INR ${payment.amount})\n- Transaction ID: ${payment.razorpayPaymentId || 'N/A'}\n- Order ID: ${payment.razorpayOrderId || 'N/A'}\n\nClub Contacts:\n- President: ${club.president?.name || 'N/A'} (Contact: ${club.president?.contact || 'N/A'})\n- Vice President: ${club.vicePresident?.name || 'N/A'} (Contact: ${club.vicePresident?.contact || 'N/A'})\n\nInstructions:\nPlease carry a copy of this email ticket and your college ID card for check-in at the venue.\n\nBest regards,\nEduEvent Manager Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background-color: #fafafa;">
      <h2 style="color: #667eea; text-align: center; margin-bottom: 20px;">Registration & Ticket Confirmation</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      <p style="font-size: 1.05rem;">You have successfully registered for the event <strong>"${event.title}"</strong>!</p>
      
      <div style="background-color: #ffffff; border: 1px dashed #667eea; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2ecc71; display: flex; align-items: center; gap: 8px;">🎟️ Your Entry Ticket</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td style="width: 40%;"><strong>Registration ID:</strong></td>
            <td style="font-family: monospace;">${registration._id}</td>
          </tr>
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>Organizer Club:</strong></td>
            <td>${club.name}</td>
          </tr>
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>Event Name:</strong></td>
            <td><strong>${event.title}</strong></td>
          </tr>
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>Date:</strong></td>
            <td>${dateStr}</td>
          </tr>
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>Time:</strong></td>
            <td>${startTimeStr} - ${endTimeStr}</td>
          </tr>
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>Venue:</strong></td>
            <td>${event.venue}</td>
          </tr>
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>Payment Status:</strong></td>
            <td><span style="color: #28a745; font-weight: bold;">PAID (₹${payment.amount})</span></td>
          </tr>
          <tr style="height: 32px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>Transaction ID:</strong></td>
            <td style="font-family: monospace; font-size: 0.88rem;">${payment.razorpayPaymentId || 'N/A'}</td>
          </tr>
          <tr style="height: 32px;">
            <td><strong>Order ID:</strong></td>
            <td style="font-family: monospace; font-size: 0.88rem;">${payment.razorpayOrderId || 'N/A'}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <strong>Description:</strong>
        <p style="color: #555; line-height: 1.5; font-size: 0.92rem; background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #eee;">${event.description || 'No description available.'}</p>
      </div>

      <div style="background-color: #f1f3f5; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 0.9rem;">
        <h4 style="margin-top: 0; color: #495057; border-bottom: 1px solid #ddd; padding-bottom: 4px;">📞 Club Contact Information</h4>
        <p style="margin: 6px 0;"><strong>President:</strong> ${club.president?.name || 'N/A'} (Phone: ${club.president?.contact || 'N/A'})</p>
        <p style="margin: 6px 0;"><strong>Vice President:</strong> ${club.vicePresident?.name || 'N/A'} (Phone: ${club.vicePresident?.contact || 'N/A'})</p>
      </div>

      <div style="background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-radius: 8px; padding: 12px; font-size: 0.88rem; margin: 20px 0; line-height: 1.4;">
        <strong>⚠️ Instructions:</strong> Please arrive 15 minutes before the start time. Carry a printed copy or screenshot of this email ticket along with your college ID card for check-in at the venue.
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888; text-align: center;">This is an automated ticket confirmation sent by EduEvent Manager. Please do not reply directly to this email.</p>
    </div>
  `;

  return await sendEmail({ to: student.email, subject, text, html });
};

/**
 * Send interview/selection details email when club application is approved
 */
const sendInterviewDetailsEmail = async (student, clubName, interviewDetails) => {
  const subject = `Interview/Selection Details - ${clubName}`;
  const { venue, date, time, location, notes } = interviewDetails;
  
  const text = `Congratulations ${student.name}!\n\nYour application to join "${clubName}" has been APPROVED!\n\nInterview/Selection Details:\n- Venue: ${venue}\n- Date: ${date}\n- Time: ${time}\n- Location: ${location}\n${notes ? `- Additional Notes: ${notes}` : ''}\n\nPlease be on time and carry your college ID card.\n\nBest regards,\nEduEvent Manager Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #28a745; text-align: center;">🎉 Application Approved!</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      <p>We are excited to inform you that your application to join <strong>"${clubName}"</strong> has been <span style="background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Approved</span>.</p>
      
      <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #495057; border-bottom: 1px solid #ddd; padding-bottom: 8px;">📋 Interview / Selection Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="height: 36px; border-bottom: 1px solid #f0f0f0;">
            <td style="width: 35%;"><strong>📍 Venue:</strong></td>
            <td>${venue || 'TBD'}</td>
          </tr>
          <tr style="height: 36px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>📅 Date:</strong></td>
            <td>${date || 'TBD'}</td>
          </tr>
          <tr style="height: 36px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>🕐 Time:</strong></td>
            <td>${time || 'TBD'}</td>
          </tr>
          <tr style="height: 36px; border-bottom: 1px solid #f0f0f0;">
            <td><strong>📌 Location:</strong></td>
            <td>${location || 'TBD'}</td>
          </tr>
          ${notes ? `
          <tr style="height: 36px;">
            <td><strong>📝 Notes:</strong></td>
            <td>${notes}</td>
          </tr>` : ''}
        </table>
      </div>

      <div style="background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-radius: 8px; padding: 12px; font-size: 0.88rem; margin: 20px 0; line-height: 1.4;">
        <strong>⚠️ Important:</strong> Please arrive 15 minutes before the scheduled time. Carry your college ID card for verification.
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message from EduEvent Manager.</p>
    </div>
  `;
  return await sendEmail({ to: student.email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendRegistrationConfirmationEmail,
  sendPaymentSuccessEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendShortlistEmail,
  sendEventRegistrationSuccessEmail,
  sendInterviewDetailsEmail
};
