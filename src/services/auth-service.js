import bcrypt from 'bcrypt';
import { ApiError } from '../exceptions/API-error.js';
import { User } from '../models/user.model.js';
import { generateActivationToken } from './users-service.js';

export const createUser = async (email, password) => {
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser !== null) {
    throw ApiError.BadRequest('This email address is used by another user');
  }

  const activationToken = generateActivationToken();

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    activationToken,
  });

  return { id: newUser.id, email: newUser.email, activationToken };
};

export const findUserByActivationToken = async (activationToken) => {
  return User.findOne({
    where: {
      activationToken,
    },
    attributes: ['id', 'email'],
  });
};

export const findUserByEmail = async (email) => {
  return User.findOne({
    where: {
      email,
    },
    attributes: ['id', 'email'],
  });
};

export const consumeActivationToken = async (user) => {
  user.activationToken = null;
  await user.save();
};

export const findActivatedUserByEmail = (email) => {
  return User.findOne({
    where: {
      email,
      activationToken: null,
    },
  });
};
