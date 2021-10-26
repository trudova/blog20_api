const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  showCurrentUser,
  deleteUser,
  updateImage,
} = require("../controllers/userController");

const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");



router.get("/", getAllUsers);

router.get("/showMe", authenticateUser, showCurrentUser);

router.patch("/updateUser",authenticateUser, updateUser);
router.patch("/updatePassword", authenticateUser, updateUserPassword);
router.post("/imageUpdate",authenticateUser, updateImage);
router.route("/:id").get(getSingleUser).delete(authenticateUser, deleteUser);


module.exports = router;