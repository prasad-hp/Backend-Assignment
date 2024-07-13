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
  if(email === null && phoneNumber === null){
    return res.status(400).json({ error: 'please provide valid data' });
  }
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
      if(email === null || phoneNumber == null){
        return res.status(200).json({findContact})
      }
      const fullMatch = allContact.filter(contact => contact.email === email && contact.phoneNumber === phoneNumber)
      if(fullMatch.length === 1 ){
        return res.status(200).json({findContact})
      }
      for (let i = 0; i < findContact.length; i++) {
        const contacts = findContact[i]
        if(contacts.email === null || contacts.phoneNumber === null){
          if (contacts.email === null) {
            await prisma.contact.updateMany({
              where: { phoneNumber: phoneNumber },
              data: { email: email }
            });
          } else if (contacts.phoneNumber === null) {
            await prisma.contact.updateMany({
              where: { email: email },
              data: { phoneNumber: phoneNumber }
            });
        }
        } else {
          const partialMatch = allContact.filter(contact => contact.email === email || contact.phoneNumber === phoneNumber)
            if(partialMatch.length === 1){
              await prisma.contact.create({
                data:{
                  email: email,
                  phoneNumber: phoneNumber,
                  linkPrecedence: "secondary",
                  linkedId: partialMatch[0].linkPrecedence === "primary" ? partialMatch[0].id : partialMatch[0].linkedId
                }
              })
              return res.status(200).json({findContact})
            }
          const primaryContacts = findContact.filter(contact=>contact.linkPrecedence === "primary")
          const secondaryContacts = findContact.filter(contact=>contact.linkPrecedence === "secondary")
          if(primaryContacts.length > 0){
            if(primaryContacts.length > 1){
              for(let i = 1; i < primaryContacts.length; i++){
                await prisma.contact.updateMany({
                  where:{
                    id:primaryContacts[i].id,
                    linkPrecedence : "primary"
                  },
                  data:{
                    linkPrecedence:'secondary'
                  }
                })
              }
            }
            }
          }
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
  } catch (error:any) {
    res.status(500).json({ message: "An Error Occurred", error: error.message});
  }
});
