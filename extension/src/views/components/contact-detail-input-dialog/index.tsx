import { AddIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    HStack,
    IconButton,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { USER } from "../../../assets/Images";

const ContactDetailInputDialog = ({
    isOpen,
    onConfirm,
    onClose,
}: {
    onClose: () => void;
    onConfirm: (contact: {
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }) => void;
    isOpen: boolean;
}) => {
    const [contact, setContact] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        organization: "",
        email_personal: "",
        email_work: "",
        contact_number_phone: "",
        contact_number_work: "",
        contact_number_other: [] as string[],
        links: [] as string[],
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
    });

    const [contactOthers, setContactOthers] = useState<string>();
    const [contactLinks, setContactLinks] = useState<string>();

    const handleDialogClose = () => {
        setContact({
            first_name: "",
            middle_name: "",
            last_name: "",
            organization: "",
            email_personal: "",
            email_work: "",
            contact_number_phone: "",
            contact_number_work: "",
            contact_number_other: [],
            links: [],
            street: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
        });
        onClose();
    };

    const handleChange = (e: any) => {
        setContact({
            ...contact,
            [e.target.name]: e.target.value,
        });
    };

    const addContactLinks = () => {
        if (!contactLinks) return;
        setContact({
            ...contact,
            links: [...contact.links, contactLinks],
        });
        setContactLinks("");
    };

    const addContactOthers = () => {
        if (!contactOthers) return;
        setContact({
            ...contact,
            contact_number_other: [
                ...contact.contact_number_other,
                contactOthers,
            ],
        });
        setContactOthers("");
    };

    const removeContactLinks = (link: string) => {
        setContact({
            ...contact,
            links: contact.links.filter((link_name) => link_name !== link),
        });
    };

    const removeContactOthers = (number: string) => {
        setContact({
            ...contact,
            contact_number_other: contact.contact_number_other.filter(
                (number_name) => number_name !== number
            ),
        });
    };

    return (
        <Modal
            size={"sm"}
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
            onCloseComplete={handleDialogClose}
        >
            <ModalOverlay />
            <ModalContent
                className="bg-white dark:bg-[#252525]"
                borderColor={"green"}
                borderWidth={"1px"}
                rounded={"md"}
            >
                <ModalHeader>
                    <HStack>
                        <Image src={USER} alt="user" />
                        <Text color={"green"}>Add Contact</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color={"green"} />
                <ModalBody className="custom-scrollbar">
                    <Box>
                        <Text color={"#7D7D7D"}>First Name</Text>
                        <Input
                            width={"full"}
                            placeholder="e.g. John"
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.first_name}
                            name="first_name"
                            onChange={handleChange}
                        />
                    </Box>
                    <HStack>
                        <Box>
                            <Text color={"#7D7D7D"}>Middle Name</Text>
                            <Input
                                placeholder="Fitzgerald"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.middle_name}
                                name="middle_name"
                                onChange={handleChange}
                            />
                        </Box>
                        <Box>
                            <Text color={"#7D7D7D"}>Last Name</Text>
                            <Input
                                placeholder="Kennedy "
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.last_name}
                                name="last_name"
                                onChange={handleChange}
                            />
                        </Box>
                    </HStack>
                    <HStack alignItems={"end"}>
                        <Box width={"full"}>
                            <Text color={"#7D7D7D"}>URL</Text>
                            <Input
                                placeholder="www.example.com"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contactLinks ?? ""}
                                onChange={(e) => {
                                    setContactLinks(e.target.value);
                                }}
                            />
                        </Box>
                        <IconButton
                            size={"sm"}
                            colorScheme="green"
                            backgroundColor={"transparent"}
                            rounded={"full"}
                            borderWidth={"1px"}
                            borderColor={"green.400"}
                            icon={<AddIcon color={"green.400"} />}
                            _hover={{
                                opacity: 1,
                                borderColor: "green.500",
                            }}
                            aria-label="Add Contact Link"
                            onClick={addContactLinks}
                        />
                    </HStack>
                    <Box>
                        {contact.links.map((link, index) => (
                            <Tag
                                size={"xs"}
                                m={"0.25rem"}
                                p={"0.5rem"}
                                key={index}
                                borderRadius="md"
                                variant="solid"
                                colorScheme="green"
                            >
                                <TagLabel>{link.substring(0, 7)}</TagLabel>
                                <TagCloseButton
                                    onClick={() => removeContactLinks(link)}
                                />
                            </Tag>
                        ))}
                    </Box>
                    <HStack>
                        <Box>
                            <Text color={"#7D7D7D"}>Personal Email</Text>
                            <Input
                                placeholder="example@example.com"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.email_personal ?? ""}
                                name="email_personal"
                                onChange={handleChange}
                            />
                        </Box>
                        <Box>
                            <Text color={"#7D7D7D"}>Work Email</Text>
                            <Input
                                placeholder="example@example.com"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.email_work}
                                name="email_work"
                                onChange={handleChange}
                            />
                        </Box>
                    </HStack>
                    <Box>
                        <Text color={"#7D7D7D"}>Phone Number</Text>
                        <Input
                            type="tel"
                            placeholder="eg. +9189XXXXXX43"
                            width={"full"}
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.contact_number_phone}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    contact_number_phone: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <Box>
                        <Text color={"#7D7D7D"}>Work Number</Text>
                        <Input
                            type="tel"
                            placeholder="eg. +9189XXXXXX43"
                            width={"full"}
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.contact_number_work}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    contact_number_work: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <HStack alignItems={"end"}>
                        <Box width={"full"}>
                            <Text color={"#7D7D7D"}>Other Numbers</Text>
                            <Input
                                placeholder="eg. +9189XXXXXX43"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contactOthers}
                                onChange={(e) => {
                                    setContactOthers(e.target.value);
                                }}
                            />
                        </Box>
                        <IconButton
                            size={"sm"}
                            colorScheme="green"
                            backgroundColor={"transparent"}
                            rounded={"full"}
                            borderWidth={"1px"}
                            borderColor={"green.400"}
                            icon={<AddIcon color={"green.400"} />}
                            _hover={{
                                opacity: 1,
                                borderColor: "green.500",
                            }}
                            aria-label="Add Contact Link"
                            onClick={addContactOthers}
                        />
                    </HStack>
                    <Box>
                        {contact.contact_number_other.map((number, index) => (
                            <Tag
                                size={"xs"}
                                m={"0.25rem"}
                                p={"0.5rem"}
                                key={index}
                                borderRadius="md"
                                variant="solid"
                                colorScheme="gray"
                            >
                                <TagLabel>{number}</TagLabel>
                                <TagCloseButton
                                    onClick={() => removeContactOthers(number)}
                                />
                            </Tag>
                        ))}
                    </Box>
                    <Box>
                        <Text color={"#7D7D7D"}>Street</Text>
                        <Input
                            placeholder="Address line 1"
                            width={"full"}
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.street}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    street: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <HStack>
                        <Box>
                            <Text color={"#7D7D7D"}>City</Text>
                            <Input
                                placeholder="eg. Mumbai"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.city}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        city: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                        <Box>
                            <Text color={"#7D7D7D"}>State</Text>
                            <Input
                                placeholder="eg. Maharashtra"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.state}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        state: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                    </HStack>
                    <HStack>
                        <Box>
                            <Text color={"#7D7D7D"}>Country</Text>
                            <Input
                                placeholder="eg. India"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.country}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        country: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                        <Box>
                            <Text color={"#7D7D7D"}>Pincode</Text>
                            <Input
                                placeholder="eg. 400001"
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.pincode}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        pincode: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                    </HStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        width={"full"}
                        colorScheme="green"
                        onClick={() => onConfirm(contact)}
                        size={"sm"}
                    >
                        Add Contact
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ContactDetailInputDialog;
