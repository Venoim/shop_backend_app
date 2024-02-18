import express from "express";
import { connectToDB, connection } from "../conectDB.js";
// import bcrypt from "bcrypt";
import {
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { userPool } from "../config/config.js";

const router = express.Router();

const from = "users";
await connectToDB();

// Endpoint GET dla pobierania uzytkownikow
router.get("/", async (req, res) => {
  try {
    console.log("laczenie...");
    const data = await getAll(from, connection);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Błąd serwera",
      details: error.message,
    });
  }
});

// Endpoint GET dla pobierania pojedynczego uzytkownika
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const sql = await connection.query(
      `SELECT * FROM public.${from} WHERE id = ${id};`
    );
    const result = sql.rows.map((item) => ({
      id: item[0],
      name: item[1],
      surname: item[2],
      email: item[3],
    }));

    if (sql) {
      res.json(result);
    } else {
      res.status(404).json({ error: "Uzytkownik nie został znaleziony" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
  }
});

// Endpoint POST dla dodawania nowego użytkownika
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  // Sprawdzenie, czy przesłano wymagane dane
  if (!email || !password) {
    return res.status(400).json({ error: "Brak wymaganych danych" });
  }

  try {
    // Rejestracja użytkownika w puli Cognito
    userPool.signUp(email, password, null, null, async (err, result) => {
      if (err) {
        console.error("Błąd rejestracji użytkownika:", err);
        return res
          .status(500)
          .json({ error: "Błąd serwera", details: err.message });
      }

      // Jeśli rejestracja w Cognito przebiegła pomyślnie, zapisz informacje o użytkowniku w twojej bazie danych
      // const hashedPassword = await bcrypt.hash(password, 10);
      // await connection.query(
      //   `INSERT INTO public.${from} (name, surname, email, password) VALUES ('${name}', '${surname}', '${email}', )`
      // );

      // Zwróć potwierdzenie rejestracji
      res.json({ message: "Użytkownik zarejestrowany pomyślnie", result });
    });
  } catch (error) {
    console.error("Błąd rejestracji użytkownika:", error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
  }
});
// Weryfikacja email
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await connection.query(
      `SELECT * FROM public.${from} WHERE email = '${email}'`
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error("Błąd podczas sprawdzania emaila:", error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
  }
});

// Endpoint do potwierdzenia adresu e-mail użytkownika
router.post("/confirm-email", async (req, res) => {
  const { email, confirmationCode } = req.body; // Pobranie adresu e-mail użytkownika i kodu potwierdzenia z zapytania

  if (!email || !confirmationCode) {
    return res.status(400).json({ error: "Brak wymaganych danych" });
  }

  // Tworzenie obiektu użytkownika Cognito
  const userData = {
    Username: email,
    Pool: userPool,
  };

  // Inicjalizacja obiektu CognitoUser
  const cognitoUser = new CognitoUser(userData);

  // Potwierdzenie adresu e-mail użytkownika przy użyciu kodu potwierdzenia
  cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
    if (err) {
      console.error("Błąd potwierdzenia adresu e-mail:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera", details: err.message });
    }

    // Jeśli potwierdzenie przebiegło pomyślnie
    res.json({
      message: "Adres e-mail użytkownika został potwierdzony pomyślnie",
      result,
    });
  });
});

// Endpoint POST dla logowania użytkownika
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Tworzenie obiektu Authentication Details
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  // Tworzenie obiektu użytkownika Cognito
  const cognitoData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(cognitoData);

  // Autoryzacja użytkownika
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: async (result) => {
      // Pomyślne zalogowanie użytkownika
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();
      try {
        // Sprawdź, czy użytkownik istnieje w bazie danych
        let userData = await getUserDataFromDatabase(email, from);

        if (!userData) {
          // Użytkownik nie istnieje w bazie danych, dodaj go
          const attributes = result.getIdToken().payload;
          const id_cognito = attributes.sub;
          await connection.query(
            `INSERT INTO public.${from} (email, id_cognito) VALUES ('${email}', '${id_cognito}')`
          );
          userData = await getUserDataFromDatabase(email, from);
        }
        // Zwróć tokeny i dane użytkownika
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
      // Błąd podczas logowania użytkownika
      console.error("Błąd logowania użytkownika:", err);
      res.status(401).json({ error: "Błędne dane logowania" });
    },
  });
});

// Endpoint do aktualizacji danych użytkownika
router.put("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const updatedUserData = req.body;
  console.log(userId);

  // Szukamy użytkownika w bazie danych
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Użytkownik nie został znaleziony." });
  }

  // Aktualizujemy dane użytkownika
  users[userIndex] = { ...users[userIndex], ...updatedUserData };

  // Zwracamy zaktualizowane dane użytkownika
  res.json({
    message: "Dane użytkownika zostały zaktualizowane.",
    user: users[userIndex],
  });
});

// Endpoint DELETE dla usuwania Uzytkownika
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const connection = await connectToDB();
    const result = await connection.query(
      `DELETE FROM public.${from} WHERE id = ${id};`
    );
    if (result.rowsAffected > 0) {
      res.json({ message: "Uzytkownik został pomyślnie usunięty" });
    } else {
      res.status(404).json({ error: "Uzytkownik nie został znaleziony" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
  }
});

//pobieranie danych
async function getAll(from, connection) {
  console.log("pobieram dane");
  const sql = `SELECT * FROM public.${from};`;
  const res = await connection.query(sql);
  const result = res.rows.map((item) => ({
    id: item[0],
    name: item[1],
    surname: item[2],
    email: item[3],
  }));
  console.log("pobrano:", result);
  return result;
}

// Funkcja do pobierania danych użytkownika z bazy danych
async function getUserDataFromDatabase(email, form) {
  try {
    const result = await connection.query(
      `SELECT * FROM public.${form} WHERE email = '${email}'`
    );
    if (result.rows.length > 0) {
      const userData = result.rows.map((item) => ({
        id: item[0],
        name: item[1],
        surname: item[2],
        email: item[3],
      }));
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(
      "Błąd podczas pobierania danych użytkownika z bazy danych: " +
        error.message
    );
  }
}

export default router;
