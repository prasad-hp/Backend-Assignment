"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactSchema_1 = __importDefault(require("../validators/contactSchema"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
exports.default = router;
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const userInputs = req.body;
    const parsedData = contactSchema_1.default.safeParse(userInputs);
    if (!parsedData.success) {
        return res.status(400).json({ message: "Please Enter Valid Data" });
    }
    const { phoneNumber, email } = userInputs;
    if (email === null && phoneNumber === null) {
        return res.status(400).json({ error: 'please provide valid data' });
    }
    try {
        const allContact = yield prisma.contact.findMany();
        const findContact = yield prisma.contact.findMany({
            where: {
                OR: [
                    { email: email },
                    { phoneNumber: phoneNumber }
                ]
            }
        });
        if (findContact.length === 0) {
            yield prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: "primary"
                }
            });
            let primaryContact = yield prisma.contact.findMany({
                where: {
                    email: email
                }
            });
            return res.status(200).json({
                contact: {
                    primaryContactId: primaryContact[0].id,
                    emails: [primaryContact[0].email].filter(Boolean),
                    phoneNumbers: [primaryContact[0].phoneNumber].filter(Boolean),
                    secondaryContactIds: []
                }
            });
        }
        else {
            if (email === null || phoneNumber == null) {
                const contacts = yield prisma.contact.findMany({
                    where: {
                        OR: [
                            { email: email },
                            { phoneNumber: phoneNumber }
                        ]
                    }
                });
                let primaryContact = contacts.filter(contact => contact.linkPrecedence === 'primary');
                if (primaryContact.length !== 0) {
                    let secondaryContacts = yield prisma.contact.findMany({
                        where: {
                            linkedId: primaryContact[0].id
                        }
                    });
                    return res.status(200).json({
                        contact: {
                            primaryContactId: primaryContact[0].id,
                            emails: Array.from(new Set([primaryContact[0].email, ...secondaryContacts.map(contact => contact.email)])).filter(Boolean),
                            phoneNumbers: Array.from(new Set([primaryContact[0].phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)])).filter(Boolean),
                            secondaryContactIds: secondaryContacts.map(contact => contact.id)
                        }
                    });
                }
                else {
                    const primaryContactId = (_a = contacts[0].linkedId) !== null && _a !== void 0 ? _a : undefined;
                    const primaryContactNew = yield prisma.contact.findMany({
                        where: {
                            id: primaryContactId
                        }
                    });
                    const secondaryContactsNew = yield prisma.contact.findMany({
                        where: {
                            linkedId: primaryContactId
                        }
                    });
                    return res.status(200).json({
                        contact: {
                            primaryContactId: primaryContactNew[0].id,
                            emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                            phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                            secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                        }
                    });
                }
            }
            const fullMatch = allContact.filter(contact => contact.email === email && contact.phoneNumber === phoneNumber);
            if (fullMatch.length === 1) {
                if (fullMatch[0].linkPrecedence === "primary") {
                    const primaryContactNew = fullMatch[0];
                    const primaryContactId = primaryContactNew.id;
                    const secondaryContactsNew = yield prisma.contact.findMany({
                        where: {
                            linkedId: primaryContactId
                        }
                    });
                    return res.status(200).json({
                        contact: {
                            primaryContactId: primaryContactNew.id,
                            emails: Array.from(new Set([primaryContactNew.email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                            phoneNumbers: Array.from(new Set([primaryContactNew.phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                            secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                        }
                    });
                }
                else {
                    const primaryContactId = (_b = fullMatch[0].linkedId) !== null && _b !== void 0 ? _b : undefined;
                    const primaryContactNew = yield prisma.contact.findMany({
                        where: {
                            id: primaryContactId
                        }
                    });
                    const secondaryContactsNew = yield prisma.contact.findMany({
                        where: {
                            linkedId: primaryContactId
                        }
                    });
                    return res.status(200).json({
                        contact: {
                            primaryContactId: primaryContactNew[0].id,
                            emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                            phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                            secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                        }
                    });
                }
            }
            for (let i = 0; i < findContact.length; i++) {
                const contacts = findContact[i];
                if (contacts.email === null || contacts.phoneNumber === null) {
                    if (contacts.email === null) {
                        yield prisma.contact.updateMany({
                            where: { phoneNumber: phoneNumber },
                            data: { email: email }
                        });
                    }
                    else if (contacts.phoneNumber === null) {
                        yield prisma.contact.updateMany({
                            where: { email: email },
                            data: { phoneNumber: phoneNumber }
                        });
                    }
                    const updatedContacts = yield prisma.contact.findMany({
                        where: {
                            OR: [
                                { email },
                                { phoneNumber }
                            ]
                        }
                    });
                    if (updatedContacts.length > 1) {
                        yield prisma.contact.update({
                            where: {
                                id: updatedContacts[1].id
                            },
                            data: {
                                linkPrecedence: "secondary",
                                linkedId: updatedContacts[0].id
                            }
                        });
                    }
                    const primaryContactId = updatedContacts[0].id;
                    const primaryContactNew = yield prisma.contact.findMany({
                        where: {
                            id: updatedContacts[0].id
                        }
                    });
                    const secondaryContactsNew = yield prisma.contact.findMany({
                        where: {
                            linkedId: primaryContactId
                        }
                    });
                    return res.status(200).json({
                        contact: {
                            primaryContactId: primaryContactNew[0].id,
                            emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                            phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                            secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                        }
                    });
                }
                else {
                    const partialMatch = allContact.filter(contact => contact.email === email || contact.phoneNumber === phoneNumber);
                    if (partialMatch.length === 1) {
                        yield prisma.contact.create({
                            data: {
                                email: email,
                                phoneNumber: phoneNumber,
                                linkPrecedence: "secondary",
                                linkedId: partialMatch[0].linkPrecedence === "primary" ? partialMatch[0].id : partialMatch[0].linkedId
                            }
                        });
                        const primaryContactId = partialMatch[0].linkPrecedence === "primary" ? partialMatch[0].id : (_c = partialMatch[0].linkedId) !== null && _c !== void 0 ? _c : undefined;
                        const primaryContactNew = yield prisma.contact.findMany({
                            where: {
                                id: primaryContactId
                            }
                        });
                        const secondaryContactsNew = yield prisma.contact.findMany({
                            where: {
                                linkedId: primaryContactId
                            }
                        });
                        return res.status(200).json({
                            contact: {
                                primaryContactId: primaryContactNew[0].id,
                                emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                                phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                                secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                            }
                        });
                    }
                    if (partialMatch.length === 2) {
                        if (partialMatch[0].linkPrecedence === "primary" && partialMatch[1].linkPrecedence === "primary") {
                            yield prisma.contact.update({
                                where: {
                                    id: partialMatch[1].id
                                },
                                data: {
                                    linkPrecedence: "secondary",
                                    linkedId: partialMatch[0].id
                                }
                            });
                            const primaryContactId = (_d = partialMatch[0].id) !== null && _d !== void 0 ? _d : undefined;
                            const primaryContactNew = yield prisma.contact.findMany({
                                where: {
                                    id: primaryContactId
                                }
                            });
                            const secondaryContactsNew = yield prisma.contact.findMany({
                                where: {
                                    linkedId: primaryContactId
                                }
                            });
                            return res.status(200).json({
                                contact: {
                                    primaryContactId: primaryContactNew[0].id,
                                    emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                                    phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                                    secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                                }
                            });
                        }
                        else {
                            if (partialMatch[0].linkPrecedence === "primary") {
                                const primaryContactId = (_e = partialMatch[0].id) !== null && _e !== void 0 ? _e : undefined;
                                const primaryContactNew = yield prisma.contact.findMany({
                                    where: {
                                        id: primaryContactId
                                    }
                                });
                                const secondaryContactsNew = yield prisma.contact.findMany({
                                    where: {
                                        linkedId: primaryContactId
                                    }
                                });
                                return res.status(200).json({
                                    contact: {
                                        primaryContactId: primaryContactNew[0].id,
                                        emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                                        phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                                        secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                                    }
                                });
                            }
                            else {
                                const primaryContactId = (_f = partialMatch[0].linkedId) !== null && _f !== void 0 ? _f : undefined;
                                const primaryContactNew = yield prisma.contact.findMany({
                                    where: {
                                        id: primaryContactId
                                    }
                                });
                                const secondaryContactsNew = yield prisma.contact.findMany({
                                    where: {
                                        linkedId: primaryContactId
                                    }
                                });
                                return res.status(200).json({
                                    contact: {
                                        primaryContactId: primaryContactNew[0].id,
                                        emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                                        phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                                        secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                                    }
                                });
                            }
                        }
                    }
                    const primaryContacts = findContact.filter(contact => contact.linkPrecedence === "primary");
                    const secondaryContacts = findContact.filter(contact => contact.linkPrecedence === "secondary");
                    if (primaryContacts.length > 0) {
                        if (primaryContacts.length > 1) {
                            for (let i = 1; i < primaryContacts.length; i++) {
                                yield prisma.contact.updateMany({
                                    where: {
                                        id: primaryContacts[i].id,
                                        linkPrecedence: "primary"
                                    },
                                    data: {
                                        linkPrecedence: 'secondary'
                                    }
                                });
                                const primaryContactId = (_g = primaryContacts[0].id) !== null && _g !== void 0 ? _g : undefined;
                                const primaryContactNew = yield prisma.contact.findMany({
                                    where: {
                                        id: primaryContactId
                                    }
                                });
                                const secondaryContactsNew = yield prisma.contact.findMany({
                                    where: {
                                        linkedId: primaryContactId
                                    }
                                });
                                return res.status(200).json({
                                    contact: {
                                        primaryContactId: primaryContactNew[0].id,
                                        emails: Array.from(new Set([primaryContactNew[0].email, ...secondaryContactsNew.map(contact => contact.email)])).filter(Boolean),
                                        phoneNumbers: Array.from(new Set([primaryContactNew[0].phoneNumber, ...secondaryContactsNew.map(contact => contact.phoneNumber)])).filter(Boolean),
                                        secondaryContactIds: secondaryContactsNew.map(contact => contact.id)
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ message: "An Error Occurred", error: error.message });
    }
}));
