import express from 'express';
var jwt = require('express-jwt');
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import asyncHandler from "express-async-handler"
import { Op } from "sequelize"
import { checkSchema } from "express-validator"
import { sign } from 'jsonwebtoken'
import { hash, compare } from "bcrypt"
import { UserModel, USER_ROLE_ENUM } from '../models/user.model';
import { validateParams } from '../middlewares/routeValidation.middleware';
import { ApiError } from '../utils/ApiError';
import { sendEmail } from '../utils/Mail';
import multer from 'multer';
import { PictureModel } from '../models/picture.model';
import { VideoModel } from '../models/video.model';
import GenerateUploadMiddleware from '../utils/GenerateUploadMiddleware';
import { PostModel } from '../models/post.model';

const upload = GenerateUploadMiddleware({ folderName: "pictures" })
const uploadVideo = GenerateUploadMiddleware({ folderName: "videos" })

const fieldSize = 500 * 1024 * 1024
let storage = multer.diskStorage({
  destination: (req, file, cb) => { // setting destination of uploading files        
    if (file.fieldname === "profilePic") {
      cb(null, 'profilePic/');
    } else if (file.fieldname === "bannerImage") {
      cb(null, 'banners/');
    } else if (file.fieldname === "authenticatePic") {
      cb(null, 'authImages/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}-${Date.now()}${extname(file.originalname)}`)
  }
});

const profileFiles = multer({ storage, limits: { fieldSize } })

export const userRoutes = express();

userRoutes.post('/login', validateParams(checkSchema({
  nickname: {
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
  const { nickname, password } = req.body;
  const user = await UserModel.findOne({
    where: { nickname },
    attributes: { exclude: ["createdAt", "updatedAt"] }
  });

  if (!user) throw new ApiError("User not found")
  if (!await compare(password, user.password)) throw new ApiError("Email or password incorrect")

  const jsonData = user.toJSON();
  //@ts-ignore
  delete jsonData.password;
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years' });
  res.send({ ...jsonData, token });
}));

userRoutes.post('/register', validateParams(checkSchema({
  nickname: {
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
  confirmPassword: {
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
  emailAddress: {
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
  dayOfBirth: {
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
  monthOfBirth: {
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
  yearOfBirth: {
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
  const { password, confirmPassword, emailAddress, nickname, ...fields } = req.body;

  if (password != confirmPassword) throw new ApiError("Password not match")

  const [ byEmail, byNickname] = await Promise.all([
    await UserModel.findOne({ where: { emailAddress } }),
    await UserModel.findOne({ where: { nickname } }),
  ])
  if (byEmail) throw new ApiError("Email already registered")
  if (byNickname) throw new ApiError("Nickname already registered")

  const hashedPass = await hash(password, 8)
  const user = await UserModel.create({ password: hashedPass, nickname,emailAddress, ...fields })

  const jsonData = user.toJSON();
  //@ts-ignore
  delete jsonData.password;
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years' });
  res.send({ ...jsonData, token });
}));

userRoutes.put('/update', profileFiles.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }, { name: 'authenticatePic', maxCount: 1 }]), jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    ...req.body,
    isTrans: req.body.isTrans ? req.body.isTrans === 'true' : undefined,
    hasAdultContentCertification: req.body.hasAdultContentCertification ? req.body.hasAdultContentCertification === 'true' : undefined,
    /*dayOfBirth,
    monthOfBirth,
    yearOfBirth,*/
  }
  //@ts-expect-error
  if (req.files?.profilePic) {
    //@ts-expect-error
    fieldsToUpdate.profilePic = `${req.protocol + '://' + req.get('host')}/profilePic/${req.files.profilePic[0].filename}`
  }
  //@ts-expect-error
  if (req.files?.bannerImage) {
    //@ts-expect-error
    fieldsToUpdate.bannerImage = `${req.protocol + '://' + req.get('host')}/banners/${req.files.bannerImage[0].filename}`
  }
  //@ts-expect-error
  if (req.files?.authenticatePic) {
    //@ts-expect-error
    fieldsToUpdate.authenticationProfilePic = `${req.protocol + '://' + req.get('host')}/authImages/${req.files.authenticatePic[0].filename}`
  }
  //@ts-expect-error
  await UserModel.update(fieldsToUpdate, { where: { id: req.user.id } })
  //@ts-expect-error
  const u = await UserModel.findByPk(req.user.id)  

  //@ts-ignore
  const jsonData = u.toJSON();
  //@ts-ignore
  delete jsonData.password;
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years' });
  res.send({ ...jsonData, token });
}));


userRoutes.get('/public/getUser/:id?', asyncHandler(async (req, res) => {
  res.send(await UserModel.findByPk(req.params.id, { attributes: { exclude: ["password"] }, include: [{ model: PictureModel }, { model: VideoModel }, { model: PostModel }] }));
}));

userRoutes.get('/public/getUsers', asyncHandler(async (req, res) => {
  //@ts-expect-error
  res.send(await UserModel.findAll({}, { attributes: { exclude: ["password"] } }));
}));

userRoutes.get('/public/getImages/:id?', asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.params.id)
  //@ts-expect-error
  res.send(await user?.getPictures());
}));
userRoutes.get('/getVideos', jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  //@ts-expect-error
  const user = await UserModel.findByPk(req.user.id)
  //@ts-expect-error
  res.send(await user?.getVideos());
}));

userRoutes.delete('/deleteImage', validateParams(checkSchema({
  imageId: {
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
})), jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  //@ts-expect-error
  const picture = await PictureModel.findOne({ where: { id: req.body.imageId, "UserId": req.user.id } })
  if (!picture) throw new ApiError("Picture not found")
  await picture.destroy()
  res.send({ success: true });
}));

userRoutes.delete('/deleteVideo', validateParams(checkSchema({
  videoId: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
  },
})), jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  //@ts-expect-error
  const picture = await VideoModel.findOne({ where: { id: req.body.videoId, "UserId": req.user.id }})
  if (!picture) throw new ApiError("Picture not found")
  await picture.destroy()
  res.send({ success: true });
}));

userRoutes.post('/addPicture', upload.single("picture"), jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  //@ts-expect-error
  const user = await UserModel.findByPk(req.user.id)
  const picture = await PictureModel.create({ price: req.body.price, imageName: `${req.protocol + '://' + req.get('host')}/pictures/${req.file.filename}` })
  //@ts-expect-error
  await user.addPicture(picture)
  res.send({ success: 'Image added' });
}));

userRoutes.post('/addVideo', uploadVideo.single("video"), jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  //@ts-expect-error
  const user = await UserModel.findByPk(req.user.id)
  const picture = await VideoModel.create({ price: req.body.price, videoUrl: `${req.protocol + '://' + req.get('host')}/videos/${req.file.filename}` })
  //@ts-expect-error
  await user.addVideo(picture)
  res.send({ success: 'Video added' });
}));
