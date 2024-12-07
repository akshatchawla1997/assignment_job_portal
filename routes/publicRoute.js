const Express = require("express");
const publicRoute = Express.Router();
const userController = require("../controllers/AuthenticationController");

publicRoute.post("/api/register", userController.signupNewUser);
publicRoute.put("/api/login/:type", userController.loginUser);
publicRoute.put("/api/forgot/:id", userController.forgotPassword);
publicRoute.delete("/api/logout", userController.logout);

module.exports = publicRoute;
