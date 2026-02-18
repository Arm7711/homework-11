import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import Account from '../models/User.js';

const { AUTH_SECRET, JWT_EXPIRES_IN } = process.env;

export default {

  async registration(req, res, next) {
    const uploadedFile = req.file;

    try {
      const { username, email, password } = req.body;

      const avatarPath = uploadedFile
        ? path.normalize(uploadedFile.path).replace(/\\/g, '/')
        : null;

      const duplicate = await Account.findOne({ where: { email } });

      if (duplicate) {
        if (avatarPath && fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }

        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      const created = await Account.create({
        username,
        email,
        password,
        profilePicture: avatarPath
      });

      const safeUser = await Account.findByPk(created.id, {
        attributes: { exclude: ['password'] }
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: safeUser
      });
    } catch (err) {
      if (uploadedFile) {
        const normalized = path.normalize(uploadedFile.path);
        fs.existsSync(normalized) && fs.unlinkSync(normalized);
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const account = await Account.findOne({ where: { email } });

      const isValid = account
        ? await account.comparePassword(password)
        : false;

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const payload = { id: account.id, email: account.email };

      const accessToken = jwt.sign(payload, AUTH_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });

      const safeData = await Account.findByPk(account.id, {
        attributes: { exclude: ['password'] },
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: accessToken,
        data: safeData,
      });
    } catch (err) {
      next(err);
    }
  },

  async profile(req, res, next) {
    try {
      const accountId = req.userId;

      const account = await Account.findByPk(accountId, {
        attributes: { exclude: ['password'] },
      });

      if (account === null) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.json({
        success: true,
        user: account,
      });
    } catch (err) {
      next(err);
    }
  },

  async uploadProfilePicture(req, res, next) {
    const uploadedFile = req.file;

    try {
      if (uploadedFile == null) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const account = await Account.findByPk(req.userId);

      if (account === null) {
        const normalized = path.normalize(uploadedFile.path);
        fs.existsSync(normalized) && fs.unlinkSync(normalized);

        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const nextAvatar = path.normalize(uploadedFile.path).replace(/\\/g, '/');

      if (account.profilePicture && fs.existsSync(account.profilePicture)) {
        try {
          fs.unlinkSync(account.profilePicture);
        } catch (_) {}
      }

      account.profilePicture = nextAvatar;
      await account.save();

      return res.status(200).json({
        success: true,
        message: 'Profile picture updated',
        data: { profilePicture: account.profilePicture },
      });
    } catch (err) {
      if (uploadedFile) {
        const normalized = path.normalize(uploadedFile.path);
        fs.existsSync(normalized) && fs.unlinkSync(normalized);
      }
      next(err);
    }
  },
};
