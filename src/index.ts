import express from "express"
import mainRouter from "./routes/index";
import dotenv from "dotenv"

dotenv.config()

const app = express();
const port = process.env.PORT;
app.use(express.json())
app.use("/identify", mainRouter)
app.listen(port, ()=>console.log(`Listing at the Port ${port}`))