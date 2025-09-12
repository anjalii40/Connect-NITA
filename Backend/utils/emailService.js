const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email verification
const sendVerificationEmail = async (email, token, firstName) => {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email configuration not available. Skipping email verification.');
    console.log('Verification token:', token);
    console.log('Verification URL:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`);
    return { success: true, skipped: true };
  }

  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"Connect Campus" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Connect Campus',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Connect Campus</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Network. Learn. Grow. Upskill</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Connect Campus, ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for joining our community of students and alumni from top-tier colleges. 
            To complete your registration and start networking, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block; 
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white; font-size: 12px;">
          <p style="margin: 0;">© 2024 Connect Campus. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Building bridges between students and alumni</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, firstName) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Connect Campus" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Connect Campus',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Connect Campus</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password for your Connect Campus account. 
            Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block; 
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white; font-size: 12px;">
          <p style="margin: 0;">© 2024 Connect Campus. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send referral request notification
const sendReferralRequestEmail = async (alumniEmail, alumniName, studentName, company, position) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Connect Campus" <${process.env.EMAIL_USER}>`,
    to: alumniEmail,
    subject: `New Referral Request from ${studentName} - Connect Campus`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Connect Campus</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">New Referral Request</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${alumniName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            You have received a new referral request from <strong>${studentName}</strong> for a position at <strong>${company}</strong>.
          </p>
          
          <div style="background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Request Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Company:</strong> ${company}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Position:</strong> ${position}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Student:</strong> ${studentName}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Please log in to your Connect Campus account to review the complete application and respond to this request.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/referrals" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block; 
                      font-weight: bold;">
              View Referral Request
            </a>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white; font-size: 12px;">
          <p style="margin: 0;">© 2024 Connect Campus. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReferralRequestEmail
}; 