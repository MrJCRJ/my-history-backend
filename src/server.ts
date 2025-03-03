import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./logger";

// Carregar variáveis de ambiente
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://<usuário>:<senha>@cluster0.mongodb.net/minhas-historias?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => logger.info("Conectado ao MongoDB"))
  .catch((err) => logger.error("Erro ao conectar ao MongoDB:", err));

// Definir o modelo de história
interface Historia {
  titulo: string;
  conteudo: string;
  dataCriacao: Date;
}

const historiaSchema = new mongoose.Schema<Historia>({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
});

const HistoriaModel = mongoose.model<Historia>("Historia", historiaSchema);

// Rotas de API

// Rota para buscar histórias
app.get("/historias", async (req: Request, res: Response) => {
  try {
    const historias = await HistoriaModel.find().sort({ dataCriacao: -1 });
    logger.info("Histórias buscadas com sucesso");
    res.status(200).json(historias);
  } catch (err) {
    logger.error("Erro ao buscar histórias:", err);
    res.status(500).json({ error: "Erro ao buscar histórias" });
  }
});

// Rota para publicar uma história
app.post("/historias", async (req: Request, res: Response) => {
  const { titulo, conteudo } = req.body;
  try {
    const novaHistoria = new HistoriaModel({ titulo, conteudo });
    await novaHistoria.save(); // Usando save(), que é o método correto
    logger.info("História salva com sucesso:", novaHistoria);
    res.status(201).json(novaHistoria);
  } catch (err) {
    logger.error("Erro ao salvar a história:", err);
    res.status(500).json({ error: "Erro ao salvar a história" });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});
