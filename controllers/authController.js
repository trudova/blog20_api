const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { attachCookiesTorespons, createTokenUser } = require("../utils");
const CustomError = require("../errors");

const register = async (req, res) => {
  const { email, name, password, bio, image } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError(
      "This email already has been taken. Please provide unique email"
    );
  }
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ name, email, password, role });

  const tokenUser = createTokenUser(user);
  attachCookiesTorespons({ res, user: tokenUser });
  user.save();
  res
    .status(StatusCodes.CREATED)
    .json({ bio: user.bio, image: user.image, ...tokenUser });
};
// LOG IN
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = createTokenUser(user);
  attachCookiesTorespons({ res, user: tokenUser });
  res
    .status(StatusCodes.OK)
    .json({ bio: user.bio, image: user.image, ...tokenUser });
};
const logout = async (req, res) => {
 res.cookie("token", "logout", {
   httpOnly: true,
   expires: new Date(Date.now()),
 });
 return res.status(StatusCodes.OK).json();
};

module.exports = {
  register,
  login,
  logout,
};
