const { User } = require('../../../models');
const { hashPassword } = require('../../../utils/password');
const { errorResponder, errorTypes } = require('../../../core/errors');
const bcrypt = require('bcrypt'); // Import bcrypt

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Plain password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  // Hash password before saving
  const hashedPassword = await hashPassword(password);
  return User.create({
    name,
    email,
    password: hashedPassword,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Check if an email already exists in the database
 * @param {string} email - Email
 * @returns {Promise<boolean>}
 */
async function isEmailExists(email) {
  return User.exists({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} newPassword - Plain password
 * @returns {Promise}
 */
async function changePassword(id, oldPassword, newPassword, confirmNewPassword) {
  // Your changePassword function implementation
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} newPassword - Plain password
 * @returns {Promise}
 */
async function updatePassword(id, newPassword) {
  // Your updatePassword function implementation
}

/**
 * Check if a password matches the hashed password
 * @param {string} data - Plain password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>}
 */
async function passwordMatched(data, hash) {
  try {
    // Compare the provided data with the stored hash
    const isMatched = await bcrypt.compare(data, hash);

    if (!isMatched) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Invalid password'
      );
    }

    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  isEmailExists,
  changePassword,
  updatePassword,
  passwordMatched, // Add passwordMatched to exports
};
