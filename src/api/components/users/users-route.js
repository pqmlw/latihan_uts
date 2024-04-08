const express = require('express');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');

const router = express.Router();

module.exports = (app) => {
  app.use('/users', router);

  router.get('/', authenticationMiddleware, usersControllers.getUsers);

  router.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  router.get('/:id', authenticationMiddleware, usersControllers.getUser);

  router.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  router.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  router.patch(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changePassword),
    usersControllers.changePassword
  );
};
