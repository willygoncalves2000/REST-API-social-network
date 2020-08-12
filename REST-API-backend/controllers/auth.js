const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 442;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt.hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        posts: []
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({message: 'User created!', userId: result._id})
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statudCode = 401;
        throw error;
      }
      loadedUser = user;
      // Compara a senha digitada com a armazenada no MongoDB
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) { //Usuario digitou senha errada!
        const error = new Error('Wrong Password!');
        error.statusCode = 401;
        throw error;
      }

      // Cria uma assinatura (token)
      const token =jwt.sign({
        email: loadedUser.email, 
        userId: loadedUser._id.toString()
      }, 
      'somesupersecretsecret', 
      { expiresIn: '1h' }
      );
      // Envia resposta para o frontend, com o Token e o ID do usuario logado
      res.status(200).json({token: token, userId: loadedUser._id.toString()})
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({status: user.status});
      console.log(user.status)
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.patchStatus = (req, res, next) => {
  const newStatus = req.body.status;
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      user.status = newStatus;
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Status updated!'});
    })
    .catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}