import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./src/data-source";
import bookRoutes from "./src/routes/bookRoutes";
import cors from "cors";

const app = express();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://sigabefront-three.vercel.app",
        "https://sigabefrontreal-pjphknn8q-manuels-projects-d56bc952.vercel.app",
        "https://sigabefrontreal.vercel.app",
        "https://sigabefront.vercel.app",
      ]
    : ["http://localhost:3000", "http://localhost:5173"];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log("Origen bloqueado por CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/books", bookRoutes); // Añadido prefijo /api para mejor organización

// Ruta de verificación de salud
app.get("/health", (_, res) => {
  res.send("OK");
});

// Inicializar la conexión con la base de datos
AppDataSource.initialize()
  .then(() => {
    console.log("Conexión a la base de datos establecida");

    // Iniciar el servidor solo si no estamos en Vercel
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
    } else {
      app.use(cors(corsOptions));
    }
  })
  .catch((error: Error) =>
    console.error("Error al conectar a la base de datos:", error)
  );

// Exportar la app para Vercel
export default app;
