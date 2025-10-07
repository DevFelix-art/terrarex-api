import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import youtubeRouter from "./routes/youtube.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/youtube", youtubeRouter);

// Página principal
app.get("/", (req, res) => {
  res.render("index", {
    apis: [
      { name: "Descargas de YouTube", route: "/api/youtube", desc: "Descarga audio o video de YouTube" }
    ]
  });
});

// Estado simple de la API
app.get("/status", (req, res) => {
  res.json({ status: "OK", timestamp: Date.now() });
});

// Endpoint para ver endpoints
app.get("/endpoints", (req, res) => {
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