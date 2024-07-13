import express, { Request, Response } from "express";
import contactSchema from "../validators/contactSchema";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
router.use(express.json());
const prisma = new PrismaClient();
export default router;

router.post("/", async (req: Request, res: Response) => {
  const userInputs: { phoneNumber: string; email: string } = req.body;
  const parsedData = contactSchema.safeParse(userInputs);

  if (!parsedData.success) {
    return res.status(400).json({ message: "Please Enter Valid Data" });
  }
  const { phoneNumber, email } = userInputs;
  try {
    const allContact = await prisma.contact.findMany()
    const findContact = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email },
          { phoneNumber: phoneNumber }
        ]
      }
    });

    if (findContact.length === 0) {
      const createContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary"
        }
      });
      return res.status(200).json({ message: createContact });
    } else {
      for(let i:number = 0; i< allContact.length; i++){
        const contact = findContact[i]
        const findAll = await prisma.contact.findMany({
          where:{
            OR:[
              {email:email},
              {phoneNumber:phoneNumber},
              {email:contact.email},
              {phoneNumber:contact.phoneNumber}
            ]
          }
        })
        if(email === null || phoneNumber === null){
          return res.status(200).json({message: findAll})
        }
      }
      for (let i = 0; i < findContact.length; i++) {
        if (findContact[i].email === email && findContact[i].phoneNumber === phoneNumber) {
          return res.status(200).json({ message: findContact });
        }
        if (findContact[i].email === null) {
          await prisma.contact.updateMany({
            where: { phoneNumber: phoneNumber },
            data: { email: email }
          });
        } else if (findContact[i].phoneNumber === null) {
          await prisma.contact.updateMany({
            where: { email: email },
            data: { phoneNumber: phoneNumber }
          });
        } else if (findContact[i].email !== null && findContact[i].phoneNumber !== null) {
          await prisma.contact.create({
            data: {
              email,
              phoneNumber,
              linkPrecedence: "secondary",
              linkedId: findContact[i].id
            }
          });
        }

        const updatedContact = await prisma.contact.findMany({
          where: {
            OR: [
              { email },
              { phoneNumber }
            ]
          }
        });
        return res.status(200).json({ contact: updatedContact });
      }
    }
  } catch (error:any) {
    res.status(500).json({ message: "An Error Occurred", error: error.message});
  }
});
