import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import youtubeRouter from "./routes/youtube.js";
import { mongoDB } from "./db/mongodb.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Conexion a MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/youtube", youtubeRouter);

// Middleware usuario autenticado
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

// Middleware admin
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.redirect("/");
  next();
}

// Página principal protegida
app.get("/", requireLogin, async (req, res) => {
  res.render("index", {
    apis: [
      { name: "Descargas de YouTube", route: "/api/youtube", desc: "Descarga audio o video de YouTube" }
    ],
    user: req.session.user,
    isAdmin: req.session.isAdmin
  });
});

// Endpoint de panel de admin
app.get("/admin", requireLogin, requireAdmin, async (req, res) => {
  const users = await User.find({});
  const apiCount = users.reduce((sum, u) => sum + (u.apisUsed || 0), 0);
  res.render("admin", { users, apiCount });
});

// Registro
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render("register", { error: "Completa todos los campos" });

  if (await User.findOne({ email })) return res.render("register", { error: "El usuario ya existe" });

  const hash = await bcrypt.hash(password, 10);
  const isAdmin = email === "frasesbebor@gmail.com" && password === "MANTIS MDd1";
  const user = new User({ email, password: hash, isAdmin });
  await user.save();
  req.session.userId = user._id;
  req.session.user = { email: user.email };
  req.session.isAdmin = isAdmin;
  res.redirect("/");
});

// Login
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render("login", { error: "Usuario no encontrado" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.render("login", { error: "Contraseña incorrecta" });
  req.session.userId = user._id;
  req.session.user = { email: user.email };
  req.session.isAdmin = user.isAdmin;
  res.redirect("/");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Estado simple de la API
app.get("/status", (req, res) => {
  res.json({ status: "OK", timestamp: Date.now() });
});

// Endpoint para ver endpoints
app.get("/endpoints", requireLogin, (req, res) => {
  res.render("endpoints", {
    endpoints: [
      { name: "Descargar audio YouTube", url: "/api/youtube/audio?url=..." },
      { name: "Descargar video YouTube", url: "/api/youtube/video?url=..." }
    ]
  });
});

// 404
app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`Api Terrarex corriendo en http://localhost:${PORT}`);
});
