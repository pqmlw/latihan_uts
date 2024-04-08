const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);
    return response.status(200).json(user);
  } catch (error) {
    if (error.type === errorTypes.NOT_FOUND_ERROR) {
      return response.status(404).json({
        statusCode: 404,
        error: error.type,
        description: 'User not found',
        message: 'User not found',
      });
    } else {
      return next(error);
    }
  }
}

async function createUser(request, response, next) {
  try {
    const { name, email, password, confirm_password } = request.body;

    const emailExists = await usersService.isEmailExists(email);
    if (emailExists) {
      throw errorResponder(errorTypes.EMAIL_ALREADY_TAKEN, 'Email already taken');
    }

    if (password !== confirm_password) {
      throw errorResponder(errorTypes.INVALID_PASSWORD, 'Passwords do not match');
    }

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

async function changePassword(request, response, next) {
  try {
    const { id, old_password, new_password, confirm_new_password } = request.body;

    await usersService.changePassword(id, old_password, new_password, confirm_new_password);

    return response.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.message === 'User not found') {
      return response.status(404).json({
        statusCode: 404,
        error: 'UserNotFound',
        message: 'User not found',
      });
    } else if (error.message === 'Invalid password') {
      return response.status(401).json({
        statusCode: 401,
        error: 'InvalidPassword',
        message: 'Invalid password',
      });
    } else if (error.message === 'Passwords do not match') {
      return response.status(400).json({
        statusCode: 400,
        error: 'PasswordMismatch',
        message: 'Passwords do not match',
      });
    } else {
      return next(error);
    }
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
