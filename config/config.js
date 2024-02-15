import { CognitoUserPool } from "amazon-cognito-identity-js";
import AWS from "aws-sdk";
import "dotenv/config";

const port = 3001;

AWS.config.update({
  region: ["REGION"],
  //   accessKeyId: ["ACCESS_KEY_ID"],
  //   secretAccessKey: ["SECRET_ACCESS_KEY"],
});

const poolData = {
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);
// Funkcja do potwierdzania adresu e-mail użytkownika
const confirmUser = (username, confirmationCode) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export { port, userPool, confirmUser };
