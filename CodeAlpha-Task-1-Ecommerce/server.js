const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./ecommerce.db", (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      description TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

});


// PRODUCTS

const products = [
  {
    name: "Wireless Headphones",
    price: 2999,
    image: "https://via.placeholder.com/300",
    description: "High quality wireless headphones"
  },
  {
    name: "Smart Watch",
    price: 5000,
    image: "https://via.placeholder.com/300",
    description: "Modern smart watch"
  },
  {
    name: "Laptop Backpack",
    price: 2500,
    image: "https://via.placeholder.com/300",
    description: "Durable laptop backpack"
  }
];

db.get(
  "SELECT COUNT(*) AS count FROM products",
  (err, row) => {

    if (err) {
      console.error(err.message);
      return;
    }

    if (row.count === 0) {

      const statement = db.prepare(`
        INSERT INTO products
        (name, price, image, description)
        VALUES (?, ?, ?, ?)
      `);

      products.forEach((product) => {
        statement.run(
          product.name,
          product.price,
          product.image,
          product.description
        );
      });

      statement.finalize();

      console.log("Products added to database.");
    }

  }
);


// HOME

app.get("/", (req, res) => {
  res.send("E-commerce Backend is Running!");
});


// GET PRODUCTS

app.get("/api/products", (req, res) => {

  db.all(
    "SELECT * FROM products",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          message: err.message
        });
      }

      res.json(rows);
    }
  );

});


// REGISTER

app.post("/api/register", (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required."
    });
  }

  db.run(
    `INSERT INTO users (name, email, password)
     VALUES (?, ?, ?)`,
    [name, email, password],
    function (err) {

      if (err) {
        return res.status(400).json({
          message: "Email already exists."
        });
      }

      res.json({
        message: "Registration successful!",
        userId: this.lastID
      });

    }
  );

});


// LOGIN

app.post("/api/login", (req, res) => {

  const { email, password } = req.body;

  db.get(
    `SELECT * FROM users
     WHERE email = ? AND password = ?`,
    [email, password],
    (err, user) => {

      if (err) {
        return res.status(500).json({
          message: "Database error."
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password."
        });
      }

      res.json({
        message: "Login successful!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });

    }
  );

});


// CREATE ORDER

app.post("/api/orders", (req, res) => {

  console.log("ORDER REQUEST RECEIVED");
  console.log(req.body);

  const {
    user_id,
    customer_name,
    email,
    phone,
    address,
    total
  } = req.body;

  if (
    !customer_name ||
    !email ||
    !phone ||
    !address ||
    total === undefined
  ) {

    return res.status(400).json({
      message: "All order fields are required."
    });

  }

  db.run(
    `INSERT INTO orders
    (user_id, customer_name, email, phone, address, total)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      user_id || null,
      customer_name,
      email,
      phone,
      address,
      total
    ],
    function (err) {

      if (err) {

        console.error(
          "ORDER DATABASE ERROR:",
          err.message
        );

        return res.status(500).json({
          message: err.message
        });

      }

      console.log(
        "Order saved. ID:",
        this.lastID
      );

      res.json({
        message: "Order placed successfully!",
        orderId: this.lastID
      });

    }
  );

});


// START SERVER

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});