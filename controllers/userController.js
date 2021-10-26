const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesTorespons,
  checkPermisssions,
} = require("../utils");
const cloudinary =require("cloudinary").v2;
const fs = require("fs");



const getAllUsers = async(req,res)=>{
   const { name } = req.query;
    const users = name
      ? await User.find({name:{$regex: name}}).select("-password")
      : await User.find().sort({ _id: -1 }).limit(15).select("-password");
    res.status(StatusCodes.OK).json({ users, count: users.length });

}

const getSingleUser = async(req, res)=>{
const user = await User.findOne({_id: req.params.id}).select("-password");
if(!user){
     throw new CustomError.NotFoundError(`No user with ${req.params.id}`);
}
res.status(StatusCodes.OK).json({ user });

}

const updateUser = async (req, res) => {
const {email, name, bio } = req.body;
 if (!email || !name) {
   throw new CustomError.BadRequestError("Please provide all values");
 }
 const user = await User.findOne({ _id: req.user.userId });
 user.email = email;
 user.name = name;
 user.bio = bio;
 await user.save();
const tokenUser = createTokenUser(user);
attachCookiesTorespons({ res, user: tokenUser });
const {password, ...rest} =user._doc;
  res.status(StatusCodes.OK).json({ user: rest});

};

const updateUserPassword = async( req, res)=>{
     const { oldPassword, newPassword } = req.body;
     if (!oldPassword || !newPassword) {
       throw new CustomError.BadRequestError(
         "please provide old password and new password"
       );
     }
     const user = await User.findOne({ _id: req.user.userId });
     const isPasswordCorrkect = await user.comparePassword(oldPassword);
     if (!isPasswordCorrkect) {
       throw new CustomError.UnauthenticatedError("Invalid credantials");
     }

     user.password = newPassword;
     await user.save();
     res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });

};
// UPLOAD IMAGE

const updateImage = async(req, res)=>{
 const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {use_filename: true,
folder:"blog20"});

const user = await User.findOne({_id: req.user.userId});
if(!user){
  throw new CustomError.NotFoundError(`User with id ${req.user.userId} wasnt found`);
}
user.image = result.secure_url;
await user.save();
const {password, ...rest}=user._doc;
fs.unlinkSync(req.files.image.tempFilePath);
res.status(StatusCodes.OK).json(rest);

}

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({_id: req.user.userId}).select("-password");
  res.status(StatusCodes.OK).json({ user});
};

const deleteUser = async(req, res)=>{
  const {id: userId} = req.params;
  const user = await User.findOne({ _id: userId });
  if(!user){
    throw new CustomError.NotFoundError(
      `User with id of ${userId} does not exists`
    );
  }
  checkPermisssions(req.user, userId);
  await user.remove();
  res.status(StatusCodes.OK).json({ msg:"User has bin deleted" });

}

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  showCurrentUser,
  deleteUser,
  updateImage,
};