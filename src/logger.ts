import winston from "winston";

// Configuração do logger
const logger = winston.createLogger({
  level: "info", // Nível mínimo de log
  format: winston.format.combine(
    winston.format.timestamp(), // Adiciona timestamp aos logs
    winston.format.json() // Formata os logs como JSON
  ),
  transports: [
    // Logs no console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Adiciona cores aos logs no console
        winston.format.simple() // Formato simples para o console
      ),
    }),
    // Logs em arquivo
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Apenas logs de erro
    new winston.transports.File({ filename: "logs/combined.log" }), // Todos os logs
  ],
});

export default logger;
