import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./logger";

// Carregar variáveis de ambiente
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/notas";
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => logger.info("Conectado ao MongoDB"))
  .catch((err) => logger.error("Erro ao conectar ao MongoDB:", err));

// Definir o modelo de nota
interface Nota {
  titulo: string;
  conteudo: string;
  dataCriacao: Date;
}

const notaSchema = new mongoose.Schema<Nota>({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
});

const NotaModel = mongoose.model<Nota>("Nota", notaSchema);

// Rotas de API

// Rota para buscar notas
app.get("/notas", async (req: Request, res: Response) => {
  try {
    const notas = await NotaModel.find().sort({ dataCriacao: -1 });
    logger.info("Notas buscadas com sucesso");
    res.status(200).json(notas);
  } catch (err) {
    logger.error("Erro ao buscar notas:", err);
    res.status(500).json({ error: "Erro ao buscar notas" });
  }
});

// Rota para publicar uma nota
app.post("/notas", async (req: Request, res: Response) => {
  const { titulo, conteudo } = req.body;
  try {
    const novaNota = new NotaModel({ titulo, conteudo });
    await novaNota.save();
    logger.info("Nota salva com sucesso:", novaNota);
    res.status(201).json(novaNota);
  } catch (err) {
    logger.error("Erro ao salvar a nota:", err);
    res.status(500).json({ error: "Erro ao salvar a nota" });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});
