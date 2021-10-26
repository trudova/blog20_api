const CustomError = require("../errors");

const checkPermisssions = (requestUser, resursUserId)=>{
if(requestUser.role ==="admin") return;
if(requestUser.userId === resursUserId.toString()) return;

throw new CustomError.UnauthorizeddError("Not authorized to access this route");
}
module.exports = checkPermisssions;