import express, { Request, Response } from "express";
import "express-async-errors"; // Importe o pacote aqui
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
  tags?: string[];
  dataCriacao: Date;
}

const notaSchema = new mongoose.Schema<Nota>({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  tags: { type: [String], default: [] },
  dataCriacao: { type: Date, default: Date.now },
});

const NotaModel = mongoose.model<Nota>("Nota", notaSchema);

// Rotas de API

// Rota para buscar notas
app.get("/notas", async (req: Request, res: Response) => {
  const { busca } = req.query;

  let query = {};

  if (busca) {
    const regex = new RegExp(busca as string, "i"); // Busca case-insensitive
    query = {
      $or: [
        { titulo: regex },
        { conteudo: regex },
        { tags: regex }, // Busca também nas tags
      ],
    };
  }

  const notas = await NotaModel.find(query).sort({ dataCriacao: -1 });
  logger.info("Notas buscadas com sucesso");
  res.status(200).json(notas);
});

// Rota para publicar uma nota
app.post("/notas", async (req: Request, res: Response) => {
  const { titulo, conteudo, tags } = req.body;

  const novaNota = new NotaModel({ titulo, conteudo, tags });
  await novaNota.save();
  logger.info("Nota salva com sucesso:", novaNota);
  res.status(201).json(novaNota);
});

// Rota para editar uma nota
app.put("/notas/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo, conteudo, tags } = req.body;

  const notaAtualizada = await NotaModel.findByIdAndUpdate(
    id,
    { titulo, conteudo, tags },
    { new: true } // Retorna a nota atualizada
  );

  if (!notaAtualizada) {
    return res.status(404).json({ error: "Nota não encontrada" });
  }

  logger.info("Nota atualizada com sucesso:", notaAtualizada);
  res.status(200).json(notaAtualizada);
});

// Rota para deletar uma nota
app.delete("/notas/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const notaDeletada = await NotaModel.findByIdAndDelete(id);

  if (!notaDeletada) {
    return res.status(404).json({ error: "Nota não encontrada" });
  }

  logger.info("Nota deletada com sucesso:", notaDeletada);
  res.status(200).json({ message: "Nota deletada com sucesso" });
});

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});
