import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Task Manager API running with TypeScript" });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));