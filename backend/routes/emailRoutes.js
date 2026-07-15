const express = require('express');
const router = express.Router();
const { protect, isStaff } = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/emailService');

// @desc Send communication email to student(s)
// @route POST /api/send-email
// @access Private/Staff
router.post('/send-email', protect, isStaff, async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, message: 'To, subject, and message body parameters are required' });
  }

  try {
    const emailsList = Array.isArray(to) ? to.join(', ') : to;

    await sendEmail({
      to: emailsList,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #667eea; text-align: center; margin-bottom: 20px;">EduEvent Announcement</h2>
          <p>Hello,</p>
          <p>You have received a message from the <strong>${req.user.name}</strong> (${req.user.role === 'admin' ? 'Administrator' : 'Club Coordinator'}) regarding your college clubs or events activity:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #764ba2; border-radius: 4px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 20px 0;">${message}</div>
          
          <p>If you have any questions, please contact the coordinator directly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999; text-align: center;">This is an automated communication sent via EduEvent Manager.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Communication email sent successfully!' });
  } catch (error) {
    console.error('Send communication email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
