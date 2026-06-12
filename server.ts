import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  const DB_PATH = path.join(process.cwd(), "db.json");

  // API Route: Get state
  app.get("/api/state", (req, res) => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf8");
        const json = JSON.parse(raw);
        return res.json({ empty: false, data: json });
      }
      return res.json({ empty: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API Route: Save state
  app.post("/api/state", (req, res) => {
    try {
      const state = req.body;
      fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf8");
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
