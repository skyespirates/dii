import pino from "pino";

const logger = pino({
  timestamp: false,
  transport: {
    target: "pino-pretty",
  },
});

export default logger;
