import express from "express"
import mainRouter from "./routes/index";

const app = express();
const port = 3000;
app.use(express.json())
app.use("/identify", mainRouter)
app.listen(port, ()=>console.log(`Listing at the Port ${port}`))