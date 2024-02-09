import express from "express";
import { connectToDB, connection } from "../conectDB.js";
import {
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { userPool, confirmUser } from "../config/config.js";

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

// Endpoint POST
// dla dodawania nowego uzytkownika
router.post("/register", async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!email || !password) {
    // wartosci usuniete !name || !surname ||
    return res.status(400).json({ error: "Brak wymaganych danych" });
  }

  // Atrybuty użytkownika do zarejestrowania
  const attributeList = [
    // new CognitoUserAttribute({ Name: "name", Value: name }),
    // new CognitoUserAttribute({ Name: "surname", Value: surname }),
    new CognitoUserAttribute({ Name: "email", Value: email }),
  ];

  // Rejestracja użytkownika w puli Cognito
  userPool.signUp(email, password, attributeList, null, (err, result) => {
    if (err) {
      console.error("Błąd rejestracji użytkownika:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera", details: err.message });
    }
    // Jeśli rejestracja przebiegła pomyślnie
    res.json({ message: "Użytkownik zarejestrowany pomyślnie", result });
  });
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
  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  // Autoryzacja użytkownika
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      // Pomyślne zalogowanie użytkownika
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();
      res.json({ accessToken, idToken });
    },
    onFailure: (err) => {
      // Błąd podczas logowania użytkownika
      console.error("Błąd logowania użytkownika:", err);
      res.status(401).json({ error: "Błędne dane logowania" });
    },
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

export default router;
