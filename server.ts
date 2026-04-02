import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import fs from "fs";
import sharp from "sharp";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer configuration for file uploads
  const storage = multer.memoryStorage(); // Use memory storage for sharp processing
  const upload = multer({ storage });

  app.use(express.json());

  const dbPath = path.join(process.cwd(), "db.json");

  const readDb = async () => {
    const data = await fs.promises.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  };

  const writeDb = async (data: any) => {
    await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
  };

  // Auth Mock Endpoints
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = await readDb();
    const user = db.users.find((u: any) => u.email === email);
    if (user) {
      if (user.password && user.password !== password) {
        return res.status(401).json({ error: "Invalid password" });
      }
      res.json(user);
    } else {
      res.status(401).json({ error: "User not found" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { email, role, password, restaurantId } = req.body;
    const db = await readDb();
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = { uid: `uid-${Date.now()}`, email, role, password, restaurantId };
    db.users.push(newUser);
    await writeDb(db);
    res.json(newUser);
  });

  // User Profile Update
  app.put("/api/users/:uid", async (req, res) => {
    const db = await readDb();
    const index = db.users.findIndex((u: any) => u.uid === req.params.uid);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...req.body };
      await writeDb(db);
      res.json(db.users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Restaurants CRUD
  app.get("/api/restaurants", async (req, res) => {
    const db = await readDb();
    res.json(db.restaurants);
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    const db = await readDb();
    const restaurant = db.restaurants.find((r: any) => r.id === req.params.id || r.slug === req.params.id);
    res.json(restaurant);
  });

  app.post("/api/restaurants", async (req, res) => {
    const db = await readDb();
    const newRestaurant = { id: `rest-${Date.now()}`, ...req.body };
    db.restaurants.push(newRestaurant);
    await writeDb(db);
    res.json(newRestaurant);
  });

  app.put("/api/restaurants/:id", async (req, res) => {
    const db = await readDb();
    const index = db.restaurants.findIndex((r: any) => r.id === req.params.id);
    if (index !== -1) {
      db.restaurants[index] = { ...db.restaurants[index], ...req.body };
      await writeDb(db);
      res.json(db.restaurants[index]);
    } else {
      res.status(404).json({ error: "Restaurant not found" });
    }
  });

  // Categories CRUD
  app.get("/api/categories", async (req, res) => {
    const { restaurantId } = req.query;
    const db = await readDb();
    let categories = db.categories;
    if (restaurantId) {
      categories = categories.filter((c: any) => c.restaurantId === restaurantId);
    }
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    const db = await readDb();
    const newCategory = { id: `cat-${Date.now()}`, ...req.body };
    db.categories.push(newCategory);
    await writeDb(db);
    res.json(newCategory);
  });

  app.put("/api/categories/:id", async (req, res) => {
    const db = await readDb();
    const index = db.categories.findIndex((c: any) => c.id === req.params.id);
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...req.body };
      await writeDb(db);
      res.json(db.categories[index]);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const db = await readDb();
    db.categories = db.categories.filter((c: any) => c.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  });

  // Foods CRUD
  app.get("/api/foods", async (req, res) => {
    const { restaurantId, categoryId } = req.query;
    const db = await readDb();
    let foods = db.foods;
    if (restaurantId) foods = foods.filter((f: any) => f.restaurantId === restaurantId);
    if (categoryId) foods = foods.filter((f: any) => f.categoryId === categoryId);
    res.json(foods);
  });

  app.post("/api/foods", async (req, res) => {
    const db = await readDb();
    const newFood = { id: `food-${Date.now()}`, ...req.body };
    db.foods.push(newFood);
    await writeDb(db);
    res.json(newFood);
  });

  app.put("/api/foods/:id", async (req, res) => {
    const db = await readDb();
    const index = db.foods.findIndex((f: any) => f.id === req.params.id);
    if (index !== -1) {
      db.foods[index] = { ...db.foods[index], ...req.body };
      await writeDb(db);
      res.json(db.foods[index]);
    } else {
      res.status(404).json({ error: "Food not found" });
    }
  });

  app.delete("/api/foods/:id", async (req, res) => {
    const db = await readDb();
    db.foods = db.foods.filter((f: any) => f.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  });

  // Users CRUD
  app.get("/api/users", async (req, res) => {
    const db = await readDb();
    res.json(db.users);
  });

  // API Route for image uploads with compression
  app.post("/api/upload", upload.single("image"), async (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const filepath = path.join(uploadsDir, filename);

      await sharp(req.file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);

      const imageUrl = `/uploads/${filename}`;
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  // Serve static files from public/uploads
  app.use("/uploads", express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
