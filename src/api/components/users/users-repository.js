const usersService = require('./users-service');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const { name, email, password, confirm_password } = request.body;

    // Check if email exists
    const emailExists = await usersService.isEmailExists(email);
    if (emailExists) {
      throw errorResponder(errorTypes.EMAIL_ALREADY_TAKEN, 'Email already taken');
    }

    // Check if password and confirm_password match
    if (password !== confirm_password) {
      throw errorResponder(errorTypes.INVALID_PASSWORD, 'Passwords do not match');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const success = await usersService.createUser(name, email, hashedPassword);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(201).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const { id, name, email } = request.body;

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    const { id, old_password, new_password, confirm_new_password } = request.body;

    // Check if old password is correct
    const user = await usersService.getUser(id);
    if (!user) {
      return response.status(404).json({
        statusCode: 404,
        error: 'UserNotFound',
        message: 'User not found',
      });
    }

    const isPasswordValid = await passwordMatched(old_password, user.password);
    if (!isPasswordValid) {
      return response.status(401).json({
        statusCode: 401,
        error: 'InvalidPassword',
        message: 'Invalid password',
      });
    }

    // Check if new password and confirm new password match
    if (new_password !== confirm_new_password) {
      return response.status(400).json({
        statusCode: 400,
        error: 'PasswordMismatch',
        message: 'Passwords do not match',
      });
    }

    // Update user password
    await usersService.updatePassword(id, new_password);

    return response.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
