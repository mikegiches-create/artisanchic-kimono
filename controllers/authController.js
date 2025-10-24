import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Op } from 'sequelize';
import config from '../config/config.js';

// Create JWT token
const createToken = (user) => {
  const jwtSecret = (config && config.jwt && config.jwt.secret) || process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
  if (jwtSecret === 'dev_jwt_secret_change_in_production') {
    console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in environment for production.');
  }

  const expiresIn = (config && config.jwt && config.jwt.expiresIn) || '1d';

  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn });
};

// Configure nodemailer (optional). If not configured, transporter will be null and emails will be skipped.
let transporter = null;
try {
  const emailCfg = (config && config.email) || {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  };

  if (emailCfg && emailCfg.host) {
    transporter = nodemailer.createTransport({
      host: emailCfg.host,
      port: parseInt(emailCfg.port || process.env.EMAIL_PORT || '587', 10),
      auth: {
        user: emailCfg.user || process.env.EMAIL_USER,
        pass: emailCfg.pass || process.env.EMAIL_PASS,
      },
    });
  } else {
    console.warn('Email transporter not configured. Forgot-password emails will be skipped.');
  }
} catch (err) {
  transporter = null;
  console.error('Failed to configure email transporter:', err && err.message ? err.message : err);
}

const getCookieOptions = () => {
  const cookieCfg = (config && config.jwt && config.jwt.cookie) || {};
  const expiresDays = parseInt(cookieCfg.expires || '1', 10);
  return {
    httpOnly: cookieCfg.httpOnly !== undefined ? cookieCfg.httpOnly : true,
    secure: cookieCfg.secure !== undefined ? cookieCfg.secure : (process.env.NODE_ENV === 'production'),
    sameSite: cookieCfg.sameSite || 'strict',
    maxAge: expiresDays * 24 * 60 * 60 * 1000,
  };
};

// Register user
// Export all controller functions
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Create token
    const token = createToken(user);

    // Set cookie
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create token
    const token = createToken(user);

    // Set cookie
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email',
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Send email if transporter configured, otherwise log the URL and return success
    if (transporter) {
      await transporter.sendMail({
        from: (config && config.email && config.email.from) || process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h1>You requested a password reset</h1>
          <p>Please click the following link to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } else {
      console.warn('Email transporter not configured. Reset URL:', resetUrl);
      res.status(200).json({
        success: true,
        message: 'Password reset token generated. Email service not configured, check server logs for reset URL.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: crypto
          .createHash('sha256')
          .update(req.params.resetToken)
          .digest('hex'),
        resetPasswordExpire: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


