const mongoose = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the name"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: [true, "Email must be unique "],
      required: [true, "Please provide email "],
      validate: {
        validator: validator.isEmail,
        methods: "Please provide valide email",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide the password"],
      minlength: 6,
    },
    bio: {
      type: String,
      maxlength: 250,
      default: "BIO coming soon",
    },
    image: {
      type: String,
      default: "/uploads/example.jpg",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function(){
  if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};


module.exports = mongoose.model("User", UserSchema);