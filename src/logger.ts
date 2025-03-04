import winston from "winston";

// Configuração do logger
const logger = winston.createLogger({
  level: "info", // Nível mínimo de log
  format: winston.format.combine(
    winston.format.timestamp(), // Adiciona timestamp aos logs
    winston.format.json() // Formata os logs como JSON
  ),
  transports: [
    // Logs no console (usado em produção)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Adiciona cores aos logs no console
        winston.format.simple() // Formato simples para o console
      ),
    }),
  ],
});

// Adicionar transporte de arquivo apenas em ambiente local
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.File({ filename: "logs/error.log", level: "error" })
  );
  logger.add(new winston.transports.File({ filename: "logs/combined.log" }));
}

export default logger;
