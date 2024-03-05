import { getConnection } from "../../connectDB.js";
import { userPool } from "../../config/config.js";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";

const from = "users";

export const getAllUsers = async () => {
  try {
    const connection = await getConnection();
    const data = await getAll(from, connection);
    return data;
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

export const getUserById = async (id) => {
  try {
    const connection = await getConnection();
    const sql = await connection.query(
      `SELECT * FROM public.${from} WHERE id = ${id};`
    );
    if (sql.rows.length > 0) {
      const result = sql.rows.map((item) => ({
        id: item[0],
        name: item[1],
        surname: item[2],
        email: item[3],
      }));
      return result;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

export const registerUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, null, null, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const checkEmailExists = async (email) => {
  try {
    const connection = await getConnection();
    const result = await connection.query(
      `SELECT * FROM public.${from} WHERE email = '${email}'`
    );
    return result.rows.length > 0;
  } catch (error) {
    throw new Error(`Error checking email: ${error.message}`);
  }
};

export const confirmEmail = async (email, confirmationCode) => {
  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const loginUser = async (email, password, res) => {
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const cognitoData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(cognitoData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: async (result) => {
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();
      try {
        let userData = await getUserDataFromDatabase(email, from);

        if (!userData) {
          const connection = await getConnection();
          const attributes = result.getIdToken().payload;
          const id_cognito = attributes.sub;
          await connection.query(
            `INSERT INTO public.${from} (email, id_cognito) VALUES ('${email}', '${id_cognito}')`
          );
          userData = await getUserDataFromDatabase(email, from);
        }

        res.json({
          accessToken,
          idToken,
          userData: userData[0],
        });
      } catch (error) {
        console.error("Błąd podczas logowania użytkownika:", error);
        res.status(500).json({ error: "Błąd serwera", details: error.message });
      }
    },
    onFailure: (err) => {
      console.error("Błąd logowania użytkownika:", err);
      res.status(401).json({ error: "Błędne dane logowania" });
    },
  });
};

export const updateUser = async (userId, updatedUserData) => {
  try {
    const connection = await getConnection();
    const result = await connection.query(
      `UPDATE users SET name = '${updatedUserData.name}', surname = '${updatedUserData.surname}', address = '${updatedUserData.address}', phoneNumber = '${updatedUserData.phoneNumber}' WHERE id = ${userId} RETURNING *`
    );

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }

    const updatedUser = await getUserDataFromDatabase(
      updatedUserData.email,
      "users"
    );

    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

export const deleteUser = async (userId) => {
  try {
    const connection = await getConnection();
    const result = await connection.query(
      `DELETE FROM public.${from} WHERE id = ${userId};`
    );
    if (result.rowsAffected > 0) {
      return "User deleted successfully";
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

async function getAll(from, connection) {
  const sql = `SELECT * FROM public.${from};`;
  const res = await connection.query(sql);
  const result = res.rows.map((item) => ({
    id: item[0],
    email: item[1],
    name: item[3],
    surname: item[4],
  }));
  return result;
}

async function getUserDataFromDatabase(email, form) {
  try {
    const connection = await getConnection();
    const result = await connection.query(
      `SELECT * FROM public.${form} WHERE email = '${email}'`
    );
    if (result.rows.length > 0) {
      const userData = result.rows.map((item) => ({
        id: item[0],
        email: item[1],
        name: item[3],
        surname: item[4],
        address: item[5],
        phoneNumber: item[6],
      }));
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Error fetching user data from database: ${error.message}`);
  }
}
