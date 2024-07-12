import express from "express"
import contactSchema from "../validators/contactSchema";

const router = express.Router()
router.use(express.json())

export default router;

router.post("/", async(req, res)=>{
    const userInputs: {phoneNumer:string, email:string} = req.body;
    const parsedData = contactSchema.safeParse(userInputs)
    if(!parsedData){
        return res.status(400).json({message:"Please Enter Valid Data"})
    }

})