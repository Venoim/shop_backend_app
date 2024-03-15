// import { CognitoUserPool } from "amazon-cognito-identity-js";
// import AWS from "aws-sdk";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const port = 3001;

// for AWS
// AWS.config.update({
//   region: ["REGION"],
//   //   accessKeyId: ["ACCESS_KEY_ID"],
//   //   secretAccessKey: ["SECRET_ACCESS_KEY"],
// });

// const poolData = {
//   UserPoolId: process.env.USER_POOL_ID,
//   ClientId: process.env.CLIENT_ID,
// };

// const userPool = new CognitoUserPool(poolData);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
// Funkcja do potwierdzania adresu e-mail użytkownika
const confirmUser = async (username, confirmationCode) => {
  try {
    const { error, data } = await supabase.auth.api.updateUser(username, {
      confirmationCode,
    });
    if (error) {
      throw new Error(error.message);
    } else {
      return data;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
// AWS
//   return new Promise((resolve, reject) => {
//     const userData = {
//       Username: username,
//       Pool: userPool,
//     };
//     const cognitoUser = new CognitoUser(userData);
//     cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };

export { port, supabase, confirmUser }; // , userPool
