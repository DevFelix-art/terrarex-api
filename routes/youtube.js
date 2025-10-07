import express from "express";
import ytdl from "ytdl-core";

const router = express.Router();

// Descargar audio (mp3)
router.get("/audio", async (req, res) => {
  const { url } = req.query;
  if (!url || !ytdl.validateURL(url)) return res.status(400).json({ error: "URL inválida" });

  try {
    const info = await ytdl.getInfo(url);
    res.header("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp3"`);
    ytdl(url, { filter: "audioonly", quality: "highestaudio" }).pipe(res);
  } catch (e) {
    res.status(500).json({ error: "Error al descargar audio", details: e.message });
  }
});

// Descargar video (mp4)
router.get("/video", async (req, res) => {
  const { url } = req.query;
  if (!url || !ytdl.validateURL(url)) return res.status(400).json({ error: "URL inválida" });

  try {
    const info = await ytdl.getInfo(url);
    res.header("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp4"`);
    ytdl(url, { quality: "highestvideo" }).pipe(res);
  } catch (e) {
    res.status(500).json({ error: "Error al descargar video", details: e.message });
  }
});

export default router;