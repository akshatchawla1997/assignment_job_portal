const userService = require('../services/AuthenticationService');
const crypto = require("../common/crypto"); 

class UserAuthenticationController {
    async signupNewUser(request, response, next) {
        try {
            const registerData = request.body;
            const result = await userService.signup(registerData);
            return result.success ? response.status(200).json(result) : response.status(203).json(result);
        } catch (e) {
            console.error(e);
            return response.status(500).json({ success: false, error: e, message: "Internal server error" });
        } finally {
            next();
        }
    }

    async loginUser(request, response, next) {
        try {
            const loginData = request.body;
            console.log(request.params.type)
            const result = await userService.login(loginData, request.params.type);
            return result.success ? response.status(200).json(result) : response.status(203).json(result);
        } catch (error) {
            console.log(error);
            response.status(500).json({ success: false, error: error, message: "Internal server error" });
        } finally {
            next();
        }
    }

    async forgotPassword(request, response, next) {
        try {
            const userid = request.params.id;
            const newPassword = request.body.newPassword; // Assuming new password is provided in the body
            const result = await userService.forgotPassword(userid, newPassword);
            return result.success ? response.status(200).json(result) : response.status(203).json(result);
        } catch (e) {
            return response.status(500).json({ success: false, error: e, message: "Internal server error" });
        } finally {
            next();
        }
    }

    async logout(request, response, next) {
        try {
            const authHeader = request.headers['authorization']
            if(!authHeader){
                return response.status(401).send('Authorization header missing'); 
            }else{
                const userId = crypto.decodeToken(authHeader, "##$$ecomm$$##");
                const result = await userService.logout(userId);
                return result.success ? response.status(200).json(result) : response.status(203).json(result);
            }
        } catch (e) {
            return response.status(500).json({ success: false, error: e });
        } finally {
            next();
        }
    }
}

module.exports = new UserAuthenticationController();