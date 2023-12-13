import { AttachmentIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    IconButton,
    Input,
    Select,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
    Textarea,
    useDisclosure,
} from '@chakra-ui/react';
import { all } from 'axios';
import Multiselect from 'multiselect-react-dropdown';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { RiRobot2Line } from 'react-icons/ri';
import { MessageProps } from '../../../background/background';
import { CHROME_ACTION } from '../../../config/const';
import useAttachment from '../../../hooks/useAttachment';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import useBot from '../../../hooks/useBot';
import AuthService from '../../../services/auth.service';
import { getActiveTabURL } from '../../../utils/ChromeUtils';
import AttachmentDetailsInputDialog from '../../components/attachment-details-input-dialog';
import CheckButton from '../../components/check-button';
import ContactDetailInputDialog from '../../components/contact-detail-input-dialog';
import LoginModal, { LoginHandle } from '../../components/login';

export type ChatBotDetails = {
    trigger: string;
    message: string;
    respond_to: 'ALL' | 'SAVED_CONTACTS' | 'NON_SAVED_CONTACTS' | '';
    options:
        | ''
        | 'INCLUDES_IGNORE_CASE'
        | 'INCLUDES_MATCH_CASE'
        | 'EXACT_IGNORE_CASE'
        | 'EXACT_MATCH_CASE';
    trigger_gap_seconds: number;
    shared_contact_cards: {
        first_name?: string;
        last_name?: string;
        title?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        link?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }[];
    attachments: string[];
    group_respond: boolean;
};

const ChatBot = () => {
    const loginModelRef = useRef<LoginHandle>(null);
    const multiselectRef = useRef<Multiselect | null>();
    const {
        attachments: allAttachments,
        add: addAttachment,
        addingAttachment,
    } = useAttachment();
    const { add: addBot, addingBot, bots: allBots, deleteBot } = useBot();
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>();
    const {
        isOpen: isAttachmentDetailsOpen,
        onOpen: openAttachmentDetailsInput,
        onClose: closeAttachmentDetailsInput,
    } = useDisclosure();
    const {
        isOpen: isContactDetailsOpen,
        onOpen: openContactInput,
        onClose: closeContactInput,
    } = useDisclosure();

    const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } =
        useAuth();
    useEffect(() => {
        if (!!qrGenerated) {
            loginModelRef.current?.open();
        } else {
            loginModelRef.current?.close();
        }
    }, [qrGenerated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        AuthService.getUserDetails().then((res) => {
            setUIDetails((prevState) => ({
                ...prevState,
                paymentVerified: res.canSendMessage,
            }));
        });
    }, [isAuthenticated]);

    const handleAttachmentInput = (e: ChangeEvent<HTMLInputElement>) => {
        setError((prevState) => ({
            ...prevState,
            message: '',
        }));
        const files = e.target.files;
        if (files === null) return;
        if (files.length === 0) return;
        if (files[0] === null) return;
        if (files[0].size > 60000000)
            return setError((prevState) => ({
                ...prevState,
                message: 'File size should be less than 60MB',
            }));
        const file = files[0];
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAttachmentFile(file);
        openAttachmentDetailsInput();
    };

    const [details, setDetails] = useState<ChatBotDetails>({
        trigger: '',
        message: '',
        respond_to: 'ALL',
        options: 'EXACT_IGNORE_CASE',
        shared_contact_cards: [],
        attachments: [],
        trigger_gap_seconds: 1,
        group_respond: false,
    });

    const [trigger_details, setTriggerDetails] = useState<{
        trigger_gap_type: 'SECOND' | 'MINUTE' | 'HOUR';
        trigger_gap_time: number;
    }>({
        trigger_gap_type: 'SECOND',
        trigger_gap_time: 1,
    });

    const [uiDetails, setUIDetails] = useState({
        paymentVerified: false,
    });

    const [error, setError] = useState({
        message: '',
        name: '',
    });

    const handleTriggerTimeUpdate = ({
        name,
        value,
    }: {
        name: keyof typeof trigger_details;
        value: string | number;
    }) => {
        setTriggerDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleChange = async ({
        name,
        value,
    }: {
        name: keyof ChatBotDetails;
        value: (typeof details)[keyof ChatBotDetails];
    }) => {
        setError((prevState) => ({
            ...prevState,
            message: '',
        }));
        setDetails((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setUIDetails((prevState) => ({
            ...prevState,
            nameError: '',
            messageError: '',
        }));
    };

    const handleContactInput = (data: {
        first_name?: string;
        last_name?: string;
        title?: string;
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
    }) => {
        setError((prevState) => ({
            ...prevState,
            message: '',
        }));
        addContact(data);
        closeContactInput();
    };

    const addContact = (data: {
        first_name?: string;
        last_name?: string;
        title?: string;
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
    }) => {
        setError((prevState) => ({
            ...prevState,
            message: '',
        }));
        setDetails((prevState) => ({
            ...prevState,
            shared_contact_cards: [...prevState.shared_contact_cards, data],
        }));
    };

    const removeContact = (text: string) => {
        setDetails((prevState) => ({
            ...prevState,
            shared_contact_cards: prevState.shared_contact_cards.filter(
                (number) => number.first_name !== text
            ),
        }));
    };

    function handleSave() {
        if (
            !details.message &&
            details.attachments.length === 0 &&
            details.shared_contact_cards.length === 0
        ) {
            setError((prevState) => ({
                ...prevState,
                message: 'Message or Attachment or Contact Card is required',
            }));
            return;
        }
        if (!details.respond_to) {
            setError((prevState) => ({
                ...prevState,
                message: 'Recipients is required',
            }));
            return;
        }
        if (!details.options) {
            setError((prevState) => ({
                ...prevState,
                message: 'Conditions is required',
            }));
            return;
        }
        if (
            !trigger_details.trigger_gap_time ||
            trigger_details.trigger_gap_time <= 0
        ) {
            setError((prevState) => ({
                ...prevState,
                message: 'Invalid Message Delay',
            }));
            return;
        }
        if (allBots.map((bot) => bot.trigger).includes(details.trigger)) {
            setError((prevState) => ({
                ...prevState,
                message: 'Trigger already exists',
            }));
            return;
        }
        const trigger_gap_seconds =
            trigger_details.trigger_gap_type === 'HOUR'
                ? trigger_details.trigger_gap_time * 3600
                : trigger_details.trigger_gap_type === 'MINUTE'
                ? trigger_details.trigger_gap_time * 60
                : trigger_details.trigger_gap_time;

        console.log(details);

        addBot({
            ...details,
            trigger_gap_seconds: Number(trigger_gap_seconds),
        }).then(() => {
            multiselectRef.current?.resetSelectedValues();
            setDetails({
                trigger: '',
                message: '',
                respond_to: 'ALL',
                options: 'EXACT_IGNORE_CASE',
                shared_contact_cards: [],
                attachments: [],
                trigger_gap_seconds: 1,
                group_respond: false,
            });
        });
    }

    const handleSubscription = async () => {
        const activeTab = await getActiveTabURL();
        const message: MessageProps = {
            action: CHROME_ACTION.OPEN_URL,
            tabId: activeTab.id,
            url: activeTab.url,
            data: {
                url: 'https://whatsleads.in/pricing',
            },
        };
        await chrome.runtime.sendMessage(message);
    };

    return (
        <Flex
            direction={'column'}
            gap={'0.5rem'}
            justifyContent={'space-between'}
            height={'full'}
            className="custom-scrollbar"
        >
            <Flex direction={'column'} gap={'0.5rem'}>
                <Flex alignItems="center" gap={'0.5rem'} mt={'1.5rem'}>
                    <Icon
                        as={RiRobot2Line}
                        height={5}
                        width={5}
                        color={'green.400'}
                    />
                    <Text className="text-black dark:text-white" fontSize="md">
                        Auto Responder
                    </Text>
                </Flex>

                <Flex
                    direction={'column'}
                    // className='bg-[#ECECEC] dark:bg-[#535353]'
                    // px={'0.5rem'}
                    borderRadius={'20px'}
                    mb={'1rem'}
                    gap={2}
                >
                    <Flex direction={'column'} gap={2}>
                        <Flex
                            justifyContent={'space-between'}
                            alignItems={'center'}
                        >
                            <Text
                                fontSize="xs"
                                className="text-gray-700 dark:text-gray-400"
                            >
                                Trigger
                            </Text>
                            <CheckButton
                                gap={2}
                                name={'GROUP'}
                                label="Default Message"
                                value={!details.trigger}
                                onChange={() =>
                                    handleChange({ name: 'trigger', value: '' })
                                }
                                backgroundClassName="!bg-[#A6A6A6]"
                            />
                        </Flex>
                        <Input
                            width={'full'}
                            isInvalid={allBots
                                .map((bot) => bot.trigger)
                                .includes(details.trigger)}
                            placeholder={'ex. hello'}
                            border={'none'}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _placeholder={{ opacity: 0.4, color: 'inherit' }}
                            _focus={{ border: 'none', outline: 'none' }}
                            value={details.trigger}
                            isDisabled={!isAuthenticated}
                            onChange={(e) =>
                                handleChange({
                                    name: 'trigger',
                                    value: e.target.value,
                                })
                            }
                        />
                    </Flex>

                    <Flex gap={4}>
                        <Box flexGrow={1}>
                            <Text
                                fontSize="xs"
                                className="text-gray-700 dark:text-gray-400"
                            >
                                Recipients
                            </Text>
                            <Select
                                className={`!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full ${
                                    details.respond_to
                                        ? ' text-black dark:text-white'
                                        : ' text-gray-700 dark:text-gray-400'
                                }`}
                                border={'none'}
                                value={details.respond_to}
                                onChange={(e) => {
                                    handleChange({
                                        name: 'respond_to',
                                        value: e.target.value,
                                    });
                                }}
                                isDisabled={!isAuthenticated}
                            >
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="ALL"
                                >
                                    All
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="SAVED_CONTACTS"
                                >
                                    Saved Contacts
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="NON_SAVED_CONTACTS"
                                >
                                    Non Saved Contacts
                                </option>
                            </Select>
                        </Box>
                        <Box flexGrow={1}>
                            <Text
                                fontSize="xs"
                                className="text-gray-700 dark:text-gray-400"
                            >
                                Conditions
                            </Text>
                            <Select
                                isDisabled={!isAuthenticated}
                                className={`!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full ${
                                    details.options
                                        ? ' text-black dark:text-white'
                                        : ' text-gray-700 dark:text-gray-400'
                                }`}
                                border={'none'}
                                value={details.options}
                                onChange={(e) => {
                                    handleChange({
                                        name: 'options',
                                        value: e.target.value,
                                    });
                                }}
                            >
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="INCLUDES_IGNORE_CASE"
                                >
                                    Includes Ignore Case
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="INCLUDES_MATCH_CASE"
                                >
                                    Includes Match Case
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="EXACT_IGNORE_CASE"
                                >
                                    Exact Ignore Case
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="EXACT_MATCH_CASE"
                                >
                                    Exact Match Case
                                </option>
                            </Select>
                        </Box>
                    </Flex>
                    <Textarea
                        isDisabled={!isAuthenticated}
                        width={'full'}
                        minHeight={'80px'}
                        size={'sm'}
                        rounded={'md'}
                        placeholder={
                            'Type your message here. \nex. You are invited to join fanfest'
                        }
                        border={'none'}
                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                        _placeholder={{ opacity: 0.4, color: 'inherit' }}
                        _focus={{ border: 'none', outline: 'none' }}
                        value={details.message ?? ''}
                        onChange={(e) =>
                            handleChange({
                                name: 'message',
                                value: e.target.value,
                            })
                        }
                    />
                    <Flex justifyContent={'flex-end'}>
                        {/* <Checkbu  value={details.group_respond} onChange={()=>{
							handleChange({
								name: 'group_respond',
								value: !details.group_respond,
							})
						}} /> */}

                        <CheckButton
                            gap={2}
                            name={'GROUP'}
                            label="Works with groups"
                            value={details.group_respond}
                            onChange={() => {
                                handleChange({
                                    name: 'group_respond',
                                    value: !details.group_respond,
                                });
                                console.log(details.group_respond);
                            }}
                            backgroundClassName="!bg-[#A6A6A6]"
                        />
                        {/* <Text
                            fontSize="sm"
                            className="text-gray-700 dark:text-gray-400"
                        >
                            Works with Groups
                        </Text> */}
                    </Flex>
                    <Box>
                        <Text
                            fontSize="xs"
                            className="text-gray-700 dark:text-gray-400"
                        >
                            Attachments
                        </Text>
                        <Flex gap={2} alignItems={'center'}>
                            <Multiselect
                                disable={!isAuthenticated}
                                displayValue="displayValue"
                                placeholder={'Select Attachments'}
                                onRemove={(
                                    selectedList: typeof allAttachments
                                ) =>
                                    handleChange({
                                        name: 'attachments',
                                        value: selectedList.map(
                                            (attachment) => attachment.id
                                        ),
                                    })
                                }
                                onSelect={(
                                    selectedList: typeof allAttachments
                                ) =>
                                    handleChange({
                                        name: 'attachments',
                                        value: selectedList.map(
                                            (attachment) => attachment.id
                                        ),
                                    })
                                }
                                options={allAttachments.map((item, index) => ({
                                    ...item,
                                    displayValue: `${index + 1}. ${item.name}`,
                                }))}
                                ref={
                                    multiselectRef
                                        ? (ref) =>
                                              (multiselectRef.current = ref)
                                        : null
                                }
                                className="!w-[375px] bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none "
                            />
                            <IconButton
                                isDisabled={!isAuthenticated}
                                size={'sm'}
                                colorScheme="green"
                                backgroundColor={'transparent'}
                                rounded={'full'}
                                borderWidth={'1px'}
                                borderColor={'green.400'}
                                icon={<AttachmentIcon color={'green.400'} />}
                                _hover={{
                                    opacity: 1,
                                    borderColor: 'green.500',
                                }}
                                aria-label="Add Attachment"
                                isLoading={addingAttachment}
                                onClick={() => {
                                    document
                                        .getElementById('attachment-file-input')
                                        ?.click();
                                }}
                            />
                        </Flex>
                        <AttachmentDetailsInputDialog
                            isOpen={isAttachmentDetailsOpen}
                            onClose={() => {
                                closeAttachmentDetailsInput();
                                setAttachmentFile(null);
                            }}
                            onConfirm={(name: string, caption: string) => {
                                if (!attachmentFile || !name) return;
                                addAttachment(name, caption, attachmentFile);
                                closeAttachmentDetailsInput();
                            }}
                        />
                        <input
                            type="file"
                            name="attachment-file-input"
                            id="attachment-file-input"
                            className="invisible h-[1px] w-[1px] absolute"
                            multiple={false}
                            ref={(ref) => (fileInputRef.current = ref)}
                            onInput={handleAttachmentInput}
                        />
                    </Box>
                    <Flex gap={4}>
                        <Box flexGrow={1}>
                            <Text
                                fontSize="xs"
                                className="text-gray-700 dark:text-gray-400"
                            >
                                Message Delay
                            </Text>
                            <HStack>
                                <Input
                                    width={'full'}
                                    type="number"
                                    placeholder="10"
                                    size={'sm'}
                                    rounded={'md'}
                                    border={'none'}
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                    _focus={{ border: 'none', outline: 'none' }}
                                    value={trigger_details.trigger_gap_time}
                                    onChange={(e) => {
                                        handleTriggerTimeUpdate({
                                            name: 'trigger_gap_time',
                                            value: e.target.value,
                                        });
                                    }}
                                    isDisabled={!isAuthenticated}
                                />
                                <Select
                                    className={`!bg-[#ECECEC] dark:!bg-[#535353]  text-black dark:text-white  w-full `}
                                    rounded={'md'}
                                    border={'none'}
                                    size={'sm'}
                                    value={trigger_details.trigger_gap_type}
                                    onChange={(e) => {
                                        handleTriggerTimeUpdate({
                                            name: 'trigger_gap_type',
                                            value: e.target.value,
                                        });
                                    }}
                                    isDisabled={!isAuthenticated}
                                >
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="SECOND"
                                    >
                                        Sec
                                    </option>
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="MINUTE"
                                    >
                                        Min
                                    </option>
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="HOUR"
                                    >
                                        Hour
                                    </option>
                                </Select>
                            </HStack>
                        </Box>
                        <Box flexGrow={1}>
                            <Text
                                fontSize="xs"
                                className="text-gray-700 dark:text-gray-400"
                            >
                                Contact Cards
                            </Text>
                            <Flex gap={3} alignItems={'center'}>
                                <Button
                                    size={'sm'}
                                    width={'full'}
                                    variant={'outline'}
                                    colorScheme="green"
                                    onClick={openContactInput}
                                    isDisabled={!isAuthenticated}
                                >
                                    Create Contact
                                </Button>
                                <ContactDetailInputDialog
                                    isOpen={isContactDetailsOpen}
                                    onClose={closeContactInput}
                                    onConfirm={handleContactInput}
                                />
                            </Flex>
                            <Box>
                                {details.shared_contact_cards.map(
                                    (contact, index) => (
                                        <Tag
                                            size={'sm'}
                                            m={'0.25rem'}
                                            p={'0.5rem'}
                                            key={index}
                                            borderRadius="md"
                                            variant="solid"
                                            colorScheme="gray"
                                        >
                                            <TagLabel>
                                                {contact.first_name}
                                            </TagLabel>
                                            <TagCloseButton
                                                onClick={() =>
                                                    removeContact(
                                                        contact.first_name ?? ''
                                                    )
                                                }
                                            />
                                        </Tag>
                                    )
                                )}
                            </Box>
                        </Box>
                    </Flex>

                    <Divider />

                    <Box hidden={all.length === 0}>
                        <Text
                            fontSize="xs"
                            className="text-gray-700 dark:text-gray-400"
                        >
                            History
                        </Text>
                        <Flex
                            gap={2}
                            direction={'column'}
                            className="border border-gray-700 dark:border-gray-300"
                            py={1}
                            px={3}
                            rounded={'md'}
                        >
                            {allBots.map((bot, index) => (
                                <Box>
                                    <Flex
                                        key={index}
                                        justifyContent={'space-between'}
                                    >
                                        <Box className="text-background-dark dark:text-background">
                                            <Box className="flex flex-row">
                                                <Box>
                                                    {bot.trigger.length > 15 ? (
                                                        <Box as="span">{`${bot.trigger.substring(
                                                            0,
                                                            15
                                                        )}...`}</Box>
                                                    ) : (
                                                        <Box as="span">
                                                            {bot.trigger}
                                                        </Box>
                                                    )}
                                                    {' : '}
                                                </Box>
                                                <Box>
                                                    <Box ml={'0.25rem'}>
                                                        {' '}
                                                        {bot.message.length >
                                                        15 ? (
                                                            <Box as="span">{`${bot.message.substring(
                                                                0,
                                                                15
                                                            )}...`}</Box>
                                                        ) : (
                                                            <Box as="span">
                                                                {bot.message}
                                                            </Box>
                                                        )}
                                                        {bot.attachments
                                                            .length > 0
                                                            ? `- ${bot.attachments.length} Attachments`
                                                            : ''}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box>
                                                {`${bot.respond_to}, ${
                                                    bot.options
                                                }, ${
                                                    bot.trigger_gap_seconds < 60
                                                        ? `${
                                                              bot.trigger_gap_seconds
                                                          } second${
                                                              bot.trigger_gap_seconds !==
                                                              1
                                                                  ? 's'
                                                                  : ''
                                                          }`
                                                        : bot.trigger_gap_seconds <
                                                          3600
                                                        ? `${Math.floor(
                                                              bot.trigger_gap_seconds /
                                                                  60
                                                          )} minute${
                                                              Math.floor(
                                                                  bot.trigger_gap_seconds /
                                                                      60
                                                              ) !== 1
                                                                  ? 's'
                                                                  : ''
                                                          }`
                                                        : bot.trigger_gap_seconds <
                                                          86400
                                                        ? `${Math.floor(
                                                              bot.trigger_gap_seconds /
                                                                  3600
                                                          )} hour${
                                                              Math.floor(
                                                                  bot.trigger_gap_seconds /
                                                                      3600
                                                              ) !== 1
                                                                  ? 's'
                                                                  : ''
                                                          }`
                                                        : `${Math.floor(
                                                              bot.trigger_gap_seconds /
                                                                  86400
                                                          )} day${
                                                              Math.floor(
                                                                  bot.trigger_gap_seconds /
                                                                      86400
                                                              ) !== 1
                                                                  ? 's'
                                                                  : ''
                                                          }`
                                                }`}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Icon
                                                as={MdDelete}
                                                width={5}
                                                height={5}
                                                color={'red.400'}
                                                cursor={'pointer'}
                                                onClick={() =>
                                                    deleteBot(bot.bot_id)
                                                }
                                            />
                                        </Box>
                                    </Flex>
                                    <Divider />
                                </Box>
                            ))}
                        </Flex>
                    </Box>
                </Flex>
            </Flex>
            <Text color={'tomato'}>{error.message}</Text>
            {!isAuthenticated ? (
                <Flex gap={'0.5rem'} direction={'column'}>
                    <Text className="text-black text-center dark:text-white">
                        <InfoOutlineIcon marginRight={'0.25rem'} />
                        Disclaimer: Please wait 5 minutes for contacts to sync
                        after login.
                    </Text>
                    <Button
                        bgColor={'blue.300'}
                        _hover={{
                            bgColor: 'blue.400',
                        }}
                        onClick={startAuth}
                        isLoading={isAuthenticating}
                    >
                        <Flex gap={'0.5rem'}>
                            <Text color={'white'}>Login</Text>
                        </Flex>
                    </Button>
                </Flex>
            ) : !uiDetails.paymentVerified ? (
                <Button
                    bgColor={'yellow.400'}
                    _hover={{
                        bgColor: 'yellow.500',
                    }}
                    onClick={handleSubscription}
                >
                    <Flex gap={'0.5rem'}>
                        <Text color={'white'}>Subscribe</Text>
                    </Flex>
                </Button>
            ) : (
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Button
                        bgColor={'green.300'}
                        _hover={{
                            bgColor: 'green.400',
                        }}
                        width={'100%'}
                        onClick={handleSave}
                        isLoading={addingBot}
                        isDisabled={!isAuthenticated}
                    >
                        <Text color={'white'}>Save</Text>
                    </Button>
                </Flex>
            )}

            <LoginModal ref={loginModelRef} qr={qrCode} />
        </Flex>
    );
};

export default ChatBot;
