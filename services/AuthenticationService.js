const crypto = require("../common/crypto");
const { execute } = require("../config/database/querywrapperMysql");
const { v4: uuidv4 } = require("uuid");

// Now, you can use the imported modules as needed
const decryptedData = crypto.decryptedData;
const encryptedData = crypto.encryptedData;
const generateJwtToken = crypto.generateJwtToken;
const decodeToken = crypto.decodeToken;

class userAuthenticationService {
    async signup(registerData) {
        return new Promise(async (resolve, reject) => {
          try {
            const checkUserQuery = "SELECT email FROM users WHERE email = ?";
            const isUserExist = await execute(checkUserQuery, [registerData.email]);
      
            if (isUserExist.length > 0) {
              // Email already exists
              return reject({
                success: false,
                error: 402,
                message: "Email already in use. Please try with a different email.",
              });
            }
      
            const id = uuidv4(); // Generate unique user ID
            const cipherText = await encryptedData(registerData.password); // Encrypt password
      
            // Insert user into the `Users` table
            const registerQuery = `
              INSERT INTO users (id, name, email, password, role) 
              VALUES (?, ?, ?, ?, ?)
            `;
      
            const insertResult = await execute(registerQuery, [
                id,
              registerData.name,
              registerData.email,
              cipherText,
              registerData.role, // 0 = Candidate, 1 = Recruiter
            ]);
      
            if (insertResult.affectedRows > 0) {
              const payload = {
                email: registerData.email,
                role: registerData.role,
                password: cipherText
              };
              const jwtToken = generateJwtToken(payload, "##$$job$$##", "24h");
              const authQuery = `
                INSERT INTO account_tokens (user_id, token) 
                VALUES(?, ?)
              `;
              const authResult = await execute(authQuery, [id, jwtToken]);
      
              if (authResult.affectedRows > 0) {
                resolve({
                  status: 201,
                  success: true,
                  data: { token: jwtToken },
                  message: "Signup successful.",
                });
              } else {
                reject({
                  success: false,
                  message: "Error occurred while storing auth token.",
                });
              }
            } else {
              reject({ success: false, message: "Signup failed. No rows affected." });
            }
          } catch (error) {
            reject({
              success: false,
              message: `Error occurred during signup: ${error.message}`,
            });
          }
        });
      }
      

      async login(userData) {
        try {
          // Determine user type (Candidate or Recruiter)
          const checkUserQuery = `
            SELECT id, email, password, role 
            FROM users 
            WHERE email = ?
          `;
          // Fetch user details by email
          const resultUser = await execute(checkUserQuery, [userData.email]);
      
          if (resultUser.length > 0) {
            // User exists
            const user = resultUser[0];
            const decryptedPassword = await decryptedData(user.password);
      
            if (decryptedPassword === userData.password) {
              // Password matches
              const payload = {
                id: user.id,
                email: user.email,
                role: user.role, // Include role in the payload
              };
      
              // Generate JWT token
              const jwttoken = generateJwtToken(payload, "##$$ecomm$$##", "24h");
      
              // Insert token into auth_token table and update user's active status
              const authId = uuidv4();
              const query = `
                INSERT INTO account_tokens (user_id, token) 
                VALUES (?, ?);
              `;
              const queryResult = await execute(query, [user.id, jwttoken]);
      
              if (queryResult.affectedRows > 0) {
                // Successful login
                return {
                  status: 201,
                  success: true,
                  data: { token: jwttoken, user_id: user.id, role: user.role },
                  message: "Login successful",
                };
              } else {
                return {
                  status: 500,
                  success: false,
                  message: "Error occurred while updating user status or storing token.",
                };
              }
            } else {
              // Incorrect password
              return {
                status: 400,
                success: false,
                message: "Incorrect email/password.",
              };
            }
          } else {
            // if User not found
            return {
              status: 404,
              success: false,
              message: "User not found. Please sign up.",
            };
          }
        } catch (error) {
          return {
            status: 500,
            success: false,
            message: `An error occurred during login: ${error.message}`,
          };
        }
      }
      

  async updateUser(userUpdateData, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const updateQuery = "update users set ? where id = ?";
        const result = await execute(updateQuery, [userUpdateData, id]);
        if (result.affectedRows > 0) {
          return resolve({
            status: 201,
            success: true,
            message: "user updated successfully",
          });
        } else {
          return { status: 400, success: false, message: "user not found" };
        }
      } catch (e) {
        reject({
          status: 500,
          success: false,
          message: "An error occurred during login",
        });
      }
    });
  }

  async updateRegistrationStatus(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // Capture payment first
        const paymentStatus = await CompleteOrderPayment.capturePayment(id);

        if (paymentStatus.success) {
          // Payment was successful, proceed to update the user registration status and expiry
          const registrationData = {
            registration_status: "subscribed",
            registration_expiry: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ), // 1 year from now
            is_active: 1,
          };

          const updateQuery = "UPDATE users SET ? WHERE id = ?";
          const result = await execute(updateQuery, [registrationData, id]);

          if (result.affectedRows > 0) {
            return resolve({
              status: 201,
              success: true,
              message: "User updated successfully",
            });
          } else {
            return resolve({
              status: 400,
              success: false,
              message: "User not found",
            });
          }
        } else {
          // Payment failed
          return resolve({
            status: 400,
            success: false,
            message: "Payment failed. Unable to update registration.",
          });
        }
      } catch (e) {
        reject({
          status: 500,
          success: false,
          message: "An error occurred during the update process",
        });
      }
    });
  }

  async getUsers() {
    return new Promise(async (resolve, reject) => {
      const userList = "select u.*, p.*, count(p.id) from users as u left join pets as p on p.owner_id = u.id";
      const result = await execute(userList, []);
      if (result[0]) {
        return resolve({ status: "200", data: result, success: true });
      } else {
        return reject({ status: "204", success: false });
      }
    });
  }

  async getParticularUser(id) {
    return new Promise(async (resolve, reject) => {
      const userList = `select * from users where id = ${id}`;
      const result = await execute(userList, []);
      if (result[0]) {
        return resolve({ status: "200", data: result, success: true });
      } else {
        return reject({ status: "204", success: false });
      }
    });
  }

  async forgotPassword(id, newPassword) {
    return new Promise((resolve, reject) => {
      try {
        cipherText = encryptedData(newPassword);
        const updateQuery = `update users set password = ? where id = ?`;
        const result = execute(updateQuery, [cipherText, id]);
        if (result[0]) {
          return resolve({
            status: 201,
            success: true,
            message: "user updated successfully",
          });
        } else {
          return { status: 400, success: false, message: "user not found" };
        }
      } catch (e) {
        return {
          status: 500,
          success: false,
          message: "An error occurred during login",
        };
      }
    });
  }

  async remove(id) {
    return new Promise(async (resolve, reject) => {
      const deletesQuery = "DELETE FROM user WHERE id = ?";
      const result = await execute(deletesQuery, [id]);
      if (result[0]) {
        return resolve({
          status: 200,
          success: true,
          message: "user deleted successfully",
        });
      } else {
        return reject({
          status: "204",
          success: false,
          message: "No such user found",
        });
      }
    });
  }

  async logout(id) {
    return new Promise(async (resolve, reject) => {
      const deletesQuery = `DELETE FROM account_tokens WHERE user_id = ?;`;
      const result = await execute(deletesQuery, [id]);
      if (result.affectedRows == 1) {
        return resolve({
          status: 200,
          success: true,
          message: "user deleted successfully",
        });
      } else {
        return reject({
          status: "204",
          success: false,
          message: "No such user found",
        });
      }
    });
  }
}

module.exports = new userAuthenticationService();
