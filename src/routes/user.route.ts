import express from 'express';
var jwt = require('express-jwt');
var guard = require('express-jwt-permissions')({
  permissionsProperty: 'role'
})
import asyncHandler from "express-async-handler"
import { Op } from "sequelize"
import { checkSchema } from "express-validator"
import { sign } from 'jsonwebtoken'
import { hash, compare } from "bcrypt"
import { UserModel, USER_ROLE_ENUM } from '../models/user.model';
import { validateParams } from '../middlewares/routeValidation.middleware';
import { ApiError } from '../utils/ApiError';
import { sendForgotPassword, sendEmail } from '../utils/Mail';
import multer from 'multer';

let storage = multer.diskStorage({
  destination: 'profilePic/',
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const fieldSize = 50 * 1024 * 1024

var upload = multer({ storage, limits: { fieldSize } })

export const userRoutes = express();

userRoutes.post('/login', validateParams(checkSchema({
  email: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  password: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
})), asyncHandler(async (req, res) => {
  const { email, password} = req.body;
  const user = await UserModel.findOne({
    where: { email },
    attributes: { exclude: ["createdAt", "updatedAt"]}
  });

  if (!user) throw new ApiError("User not found")
  if (user.role != USER_ROLE_ENUM.SUPER_ADMIN) throw new ApiError("You are not admin")
  if (!await compare(password, user.password)) throw new ApiError("Email or password incorrect")

  const jsonData = user.toJSON();
  //@ts-ignore
  delete jsonData.password;
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years'});
  res.send({ ...jsonData, token });
}));

userRoutes.post('/register', upload.single("profilePic"), validateParams(checkSchema({
  name: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  email: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  mobileNumber: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  age: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  role: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  password: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  location: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },  
})), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError("Missing profile pic")
  const { password, email,...fields} = req.body;

  if (await UserModel.findOne({ where: { email }})) throw new ApiError("Email already registered")

  const hashedPass = await hash(password, 8)
  const user = await UserModel.create({ password: hashedPass, email, profilePic: `${req.protocol + '://' + req.get('host')}/profilePic/${req.file.filename}`, ...fields})

  const jsonData = user.toJSON();
  //@ts-ignore
  delete jsonData.password;
  await sendEmail({email: "", user: jsonData})
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years'});
  res.send({ ...jsonData, token });
}));

userRoutes.get('/getUser', jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  //@ts-expect-error
  res.send(await UserModel.findByPk(req.user.id, { attributes: { exclude: ["password"]}}));
}));

userRoutes.get('/getUsers', jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  //@ts-expect-error
  res.send(await UserModel.findAll({ where: { role: { [Op.not]: USER_ROLE_ENUM.SUPER_ADMIN }}}, { attributes: { exclude: ["password"]}}));
}));


userRoutes.post('/uploadProfilePic', jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), upload.single("awardFile"), asyncHandler(async (req, res) => {
  console.log(req.file)
  await UserModel
  //@ts-expect-error
  .update({  }, { where: { id: req.user.id }})
  res.send({ success: 'Achivement created' });
}));
