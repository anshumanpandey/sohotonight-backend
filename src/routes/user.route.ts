import express from 'express';
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { sign } from 'jsonwebtoken'
import { hash, compare } from "bcrypt"
import UserModel, {  clearUrlFromAsset, ALLOWED_ROLE, USER_ROLE_ENUM } from '../models/user.model';
import { validateParams } from '../middlewares/routeValidation.middleware';
import { ApiError } from '../utils/ApiError';
import multer from 'multer';
import PictureModel from '../models/picture.model';
import VideoModel from '../models/video.model';
import GenerateUploadMiddleware from '../utils/GenerateUploadMiddleware';
import PostModel from '../models/post.model';
import GetMulterCloudnaryStorage from '../utils/GetMulterCloudnaryStorage';
import { sendEmail } from '../utils/Mail';
import ServiceModel from '../models/services.model';
import { JwtMiddleware } from '../utils/JwtMiddleware';
import { RoleCheck } from '../middlewares/RoleCheck';

const upload = GenerateUploadMiddleware({ folderPath: "pictures" })
const uploadVideo = GenerateUploadMiddleware({ type: 'video', folderPath: 'videos' })

const fieldSize = 500 * 1024 * 1024

const storage = GetMulterCloudnaryStorage({
  resolveDestination: (req, file) => {  
    if (file.fieldname === "profilePic") {
      return "profilePic"
    } else if (file.fieldname === "bannerImage") {
      return "banners"
    } else if (file.fieldname === "authenticatePic") {
      return "authImages"
    }
  }
})

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
    include: [{ model: ServiceModel }],
    attributes: { exclude: ["createdAt", "updatedAt"] }
  });

  if (!user) throw new ApiError("User not found")
  if (!await compare(password, user.password)) throw new ApiError("Email or password incorrect")

  await user.update({ isLogged: true })
  const jsonData = user.toJSON();
  //@ts-ignore
  delete jsonData.password;
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years' });
  res.send({ ...jsonData, token });
}));

userRoutes.post('/logout', JwtMiddleware(), asyncHandler(async (req, res) => {
  await UserModel.update({ isLogged: false }, { where: { id: req.user.id }})
  res.send({ success: true  });
}));

userRoutes.post('/public/contact', asyncHandler(async (req, res) => {
  await sendEmail({ body: `${req.body.message}\nname:${req.body.name}\nemail:${req.body.email}`, subject: 'Contact' })
  res.send({ success: true  });
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
  role: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    custom: {
      options: (val) => {
        return ALLOWED_ROLE.map(r => r.toLowerCase()).includes(val.toLowerCase())
      },
      errorMessage: 'Invalid role'
    },
    trim: true
  },
})), asyncHandler(async (req, res) => {
  const { password, confirmPassword, emailAddress, nickname, ...fields } = req.body;

  if (password != confirmPassword) throw new ApiError("Password not match")

  const [ byEmail, byNickname] = await Promise.all([
    UserModel.findOne({ where: { emailAddress } }),
    UserModel.findOne({ where: { nickname } }),
  ])
  if (byEmail) throw new ApiError("Email already registered")
  if (byNickname) throw new ApiError("Nickname already registered")

  const hashedPass = await hash(password, 8)
  const userData = { password: hashedPass, nickname,emailAddress, ...fields }
  /*const callNumberObj = await createIncomingPhoneNumber()
  userData.callNumber = callNumberObj.phoneNumber*/
  const user = await UserModel.create(userData, { include: [{ model: ServiceModel }]})

  const jsonData = user.toJSON();
  //@ts-ignore
  delete jsonData.password;
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years' });
  res.send({ ...jsonData, token });
}));

userRoutes.put('/update', RoleCheck(USER_ROLE_ENUM.MODEL), profileFiles.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }, { name: 'authenticatePic', maxCount: 1 }]), JwtMiddleware(), asyncHandler(async (req, res) => {
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
    fieldsToUpdate.profilePic = req.files.profilePic[0].path
  }
  //@ts-expect-error
  if (req.files?.bannerImage) {
    //@ts-expect-error
    fieldsToUpdate.bannerImage = req.files.bannerImage[0].path
  }
  //@ts-expect-error
  if (req.files?.authenticatePic) {
  //@ts-expect-error
    fieldsToUpdate.authenticationProfilePic = req.files.authenticatePic[0].path
  }
  await UserModel.update(fieldsToUpdate, { where: { id: req.user.id } })
  let u = await UserModel.findByPk(req.user.id, { include: [{ model: ServiceModel }]})
  const servicesId = req.body.Services.split(",")

  if (req.body.Services && servicesId.length != 0){
    const services = await ServiceModel.findAll({ where: { id: servicesId } })
    //@ts-expect-error
    u = await u.setServices(services)
  }
  
  u = await UserModel.findByPk(req.user.id, { include: [{ model: ServiceModel }]})

  //@ts-ignore
  const jsonData = u.toJSON();
  //@ts-ignore
  delete jsonData.password;
  var token = sign(jsonData, process.env.JWT_SECRET || 'aa', { expiresIn: '9999 years' });
  res.send({ ...jsonData, token });
}));

userRoutes.get('/public/userPerRegion', asyncHandler(async (req, res) => {
  const users = await UserModel.findAll({ where: { authenticationProfilePicIsAuthenticated: true }})
  const response = users.reduce((map, next) => {
    if (!next.town) return map
    const arr = map.get(next.town)
    if (arr) {
      const users = arr
      users.push(next)
      map.set(next.town, users)
    } else {
      map.set(next.town, [next])
    }

    return map
  }, new Map<string, UserModel[]>())

  res.send(Array.from(response.entries()).map(e => ({ town: e[0], amount: e[1].length })));
}));


userRoutes.get('/public/getUser/:id?', asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.params.id, { attributes: { exclude: ["password"] }, include: [{ model: PictureModel }, { model: ServiceModel }, { model: VideoModel }, { model: PostModel }] })
  if (!user) throw new ApiError("User not found")
  let response = user
  if (!req.user || req.params.id != req.user.id){
    response = clearUrlFromAsset(user)
  }
  res.send(response);
}));

userRoutes.get('/public/getUsers', asyncHandler(async (req, res) => {
  res.send(await UserModel.findAll({ attributes: { exclude: ["password"] }, include: [{ model: ServiceModel }] }));
}));

userRoutes.get('/getUser', JwtMiddleware(),asyncHandler(async (req, res) => {
  res.send(await UserModel.findByPk(req.user.id,{ attributes: { exclude: ["password"] }, include: [{ model: ServiceModel }] }));
}));

userRoutes.get('/public/getImages/:id?', asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.params.id)
  //@ts-expect-error
  res.send(await user?.getPictures());
}));
userRoutes.get('/getVideos', JwtMiddleware(), asyncHandler(async (req, res) => {
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
})), JwtMiddleware(), asyncHandler(async (req, res) => {
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
})), JwtMiddleware(), asyncHandler(async (req, res) => {
  const picture = await VideoModel.findOne({ where: { id: req.body.videoId, UserId: req.user.id }})
  if (!picture) throw new ApiError("Picture not found")
  await picture.destroy()
  res.send({ success: true });
}));

userRoutes.post('/addPicture', upload.single("picture"), JwtMiddleware(), asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.user.id)
  const picture = await PictureModel.create({ price: req.body.price || null, imageName: req.file.path, isFree: req.body.isFree == "1" })
  //@ts-expect-error
  await user.addPicture(picture)
  res.send({ success: 'Image added' });
}));

userRoutes.post('/addVideo', uploadVideo.single("video"), JwtMiddleware(), asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.user.id)
  const picture = await VideoModel.create({ price: req.body.price  || null, videoUrl: req.file.path, isFree: req.body.isFree == "1", UserId: req.user?.id })
  //@ts-expect-error
  await user.addVideo(picture)
  res.send({ success: 'Video added' });
}));
