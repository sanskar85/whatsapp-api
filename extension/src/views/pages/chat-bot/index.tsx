import { AttachmentIcon, InfoOutlineIcon, PhoneIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Divider,
	Flex,
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
import { useNavigate } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import useAttachment from '../../../hooks/useAttachment';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import useBot from '../../../hooks/useBot';
import PaymentService from '../../../services/payment.service';
import AttachmentDetailsInputDialog from '../../components/attachment-details-input-dialog';
import CheckButton from '../../components/check-button';
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
	shared_contact_cards: string[];
	attachments: string[];
};

const ChatBot = () => {
	const navigate = useNavigate();
	const loginModelRef = useRef<LoginHandle>(null);
	const { attachments: allAttachments, add: addAttachment, addingAttachment } = useAttachment();
	const { add: addBot, addingBot, bots: allBots, deleteBot } = useBot();
	const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>();
	const {
		isOpen: isAttachmentDetailsOpen,
		onOpen: openAttachmentDetailsInput,
		onClose: closeAttachmentDetailsInput,
	} = useDisclosure();

	const [contact_name, setContactName] = useState('');

	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } = useAuth();
	useEffect(() => {
		if (!!qrGenerated) {
			loginModelRef.current?.open();
		} else {
			loginModelRef.current?.close();
		}
	}, [qrGenerated]);

	useEffect(() => {
		if (!isAuthenticated) return;
		PaymentService.isPaymentVerified().then((res) => {
			setUIDetails((prevState) => ({
				...prevState,
				paymentVerified: res.can_send_message,
			}));
		});
	}, [isAuthenticated]);

	const handleAttachmentInput = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files === null) return;
		if (files.length === 0) return;
		if (files[0] === null) return;
		const file = files[0];
		if (fileInputRef.current) fileInputRef.current.value = '';
		setAttachmentFile(file);
		openAttachmentDetailsInput();
	};

	const [details, setDetails] = useState<ChatBotDetails>({
		trigger: '',
		message: '',
		respond_to: '',
		options: '',
		shared_contact_cards: [],
		attachments: [],
		trigger_gap_seconds: 1,
	});

	const [uiDetails, setUIDetails] = useState({
		paymentVerified: false,
	});

	const handleChange = async ({
		name,
		value,
	}: {
		name: keyof ChatBotDetails;
		value: (typeof details)[keyof ChatBotDetails];
	}) => {
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

	const addContact = (text: string) => {
		setDetails((prevState) => ({
			...prevState,
			shared_contact_cards: [...prevState.shared_contact_cards, text],
		}));
	};

	const removeContact = (text: string) => {
		setDetails((prevState) => ({
			...prevState,
			shared_contact_cards: prevState.shared_contact_cards.filter((number) => number !== text),
		}));
	};

	function handleSave() {
		addBot(details).then(() => {
			setDetails({
				trigger: '',
				message: '',
				respond_to: '',
				options: '',
				shared_contact_cards: [],
				attachments: [],
				trigger_gap_seconds: 1,
			});
		});
	}

	return (
		<Flex direction={'column'} gap={'0.5rem'} justifyContent={'space-between'} height={'full'}>
			<Flex direction={'column'} gap={'0.5rem'}>
				<Flex alignItems='center' gap={'0.5rem'} mt={'1.5rem'}>
					<Icon as={RiRobot2Line} height={5} width={5} color={'green.400'} />
					<Text className='text-black dark:text-white' fontSize='md'>
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
						<Flex justifyContent={'space-between'} alignItems={'center'}>
							<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
								Trigger
							</Text>
							<CheckButton
								gap={2}
								name={'GROUP'}
								label='Default Message'
								value={!details.trigger}
								onChange={() => handleChange({ name: 'trigger', value: '' })}
								backgroundClassName='!bg-[#A6A6A6]'
							/>
						</Flex>
						<Input
							width={'full'}
							placeholder={'ex. hello'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_placeholder={{ opacity: 0.4, color: 'inherit' }}
							_focus={{ border: 'none', outline: 'none' }}
							value={details.trigger}
							onChange={(e) => handleChange({ name: 'trigger', value: e.target.value })}
						/>
					</Flex>

					<Flex gap={4}>
						<Box flexGrow={1}>
							<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
								Recipients
							</Text>
							<Select
								placeholder='Select Condition'
								className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
								border={'none'}
								value={details.respond_to}
								onChange={(e) => {
									handleChange({ name: 'respond_to', value: e.target.value });
								}}
							>
								<option value='ALL'>All</option>
								<option value='SAVED_CONTACTS'>Saved Contacts</option>
								<option value='NON_SAVED_CONTACTS'>Non Saved Contacts</option>
							</Select>
						</Box>
						<Box flexGrow={1}>
							<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
								Conditions
							</Text>
							<Select
								placeholder='Select Condition'
								className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
								border={'none'}
								value={details.options}
								onChange={(e) => {
									handleChange({ name: 'options', value: e.target.value });
								}}
							>
								<option value='INCLUDES_IGNORE_CASE'>Includes Ignore Case</option>
								<option value='INCLUDES_MATCH_CASE'>Includes Match Case</option>
								<option value='EXACT_IGNORE_CASE'>Exact Ignore Case</option>
								<option value='EXACT_MATCH_CASE'>Exact Match Case</option>
							</Select>
						</Box>
					</Flex>
					<Textarea
						width={'full'}
						minHeight={'80px'}
						size={'sm'}
						rounded={'md'}
						placeholder={'Type your message here. \nex. You are invited to join fanfest'}
						border={'none'}
						className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
						_placeholder={{ opacity: 0.4, color: 'inherit' }}
						_focus={{ border: 'none', outline: 'none' }}
						value={details.message ?? ''}
						onChange={(e) => handleChange({ name: 'message', value: e.target.value })}
					/>

					<Box>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							Attachments
						</Text>
						<Flex gap={2} alignItems={'center'}>
							<Multiselect
								displayValue='displayValue'
								placeholder={'Select Attachments'}
								onRemove={(selectedList: typeof allAttachments) =>
									handleChange({
										name: 'attachments',
										value: selectedList.map((attachment) => attachment.id),
									})
								}
								onSelect={(selectedList: typeof allAttachments) =>
									handleChange({
										name: 'attachments',
										value: selectedList.map((attachment) => attachment.id),
									})
								}
								showCheckbox={true}
								hideSelectedList={true}
								options={allAttachments.map((item, index) => ({
									...item,
									displayValue: `${index + 1}. ${item.name}`,
								}))}
								style={{
									searchBox: {
										border: 'none',
									},
									inputField: {
										width: '100%',
									},
								}}
								className='!w-[375px] bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none '
							/>
							<IconButton
								size={'sm'}
								colorScheme='green'
								backgroundColor={'transparent'}
								rounded={'full'}
								borderWidth={'1px'}
								borderColor={'green.400'}
								icon={<AttachmentIcon color={'green.400'} />}
								_hover={{
									opacity: 1,
									borderColor: 'green.500',
								}}
								aria-label='Add Attachment'
								isLoading={addingAttachment}
								onClick={() => {
									document.getElementById('attachment-file-input')?.click();
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
							type='file'
							name='attachment-file-input'
							id='attachment-file-input'
							className='invisible h-[1px] w-[1px] absolute'
							multiple={false}
							ref={(ref) => (fileInputRef.current = ref)}
							onInput={handleAttachmentInput}
						/>
					</Box>
					<Flex gap={4}>
						<Box flexGrow={1}>
							<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
								Message Delay (in sec)
							</Text>
							<Input
								width={'full'}
								type='number'
								placeholder='10'
								size={'sm'}
								rounded={'md'}
								border={'none'}
								className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
								_focus={{ border: 'none', outline: 'none' }}
								value={details.trigger_gap_seconds.toString()}
								onChange={(e) =>
									handleChange({ name: 'trigger_gap_seconds', value: Number(e.target.value) })
								}
							/>
						</Box>
						<Box flexGrow={1}>
							<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
								Contact Cards
							</Text>
							<Flex gap={3} alignItems={'center'}>
								<Input
									width={'full'}
									placeholder='91XXXXXXXX09'
									size={'sm'}
									rounded={'md'}
									border={'none'}
									className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
									_focus={{ border: 'none', outline: 'none' }}
									value={contact_name}
									onChange={(e) => setContactName(e.target.value)}
								/>
								<IconButton
									size={'sm'}
									colorScheme='green'
									aria-label='Add Contact'
									backgroundColor={'transparent'}
									rounded={'full'}
									borderWidth={'1px'}
									borderColor={'green.400'}
									_hover={{
										opacity: 1,
										borderColor: 'green.500',
									}}
									icon={<PhoneIcon color={'green.400'} />}
									onClick={() => {
										if (contact_name.length === 0) return;
										addContact(contact_name);
										setContactName('');
									}}
								/>
							</Flex>
							<Box>
								{details.shared_contact_cards.map((contact, index) => (
									<Tag
										size={'sm'}
										m={'0.25rem'}
										p={'0.5rem'}
										key={index}
										borderRadius='md'
										variant='solid'
										colorScheme='gray'
									>
										<TagLabel>{contact}</TagLabel>
										<TagCloseButton onClick={() => removeContact(contact)} />
									</Tag>
								))}
							</Box>
						</Box>
					</Flex>

					<Divider />

					<Box hidden={all.length === 0}>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							History
						</Text>
						<Flex
							gap={2}
							direction={'column'}
							className='border border-gray-700 dark:border-gray-300'
							py={1}
							px={3}
							rounded={'md'}
						>
							{allBots.map((bot, index) => (
								<Box>
									<Flex key={index} justifyContent={'space-between'}>
										<Box className='text-background-dark dark:text-background'>
											{bot.trigger.length > 15
												? bot.trigger.substring(0, 15).concat('...')
												: bot.trigger}
											{' : '}
											{bot.message.length > 15
												? bot.message.substring(0, 15).concat('...')
												: bot.message}
											{bot.attachments.length > 0 ? `- ${bot.attachments.length} Attachments` : ''}
										</Box>
										<Box>
											<Icon
												as={MdDelete}
												width={5}
												height={5}
												color={'red.400'}
												cursor={'pointer'}
												onClick={() => deleteBot(bot.bot_id)}
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

			{!isAuthenticated ? (
				<Flex gap={'0.5rem'} direction={'column'}>
					<Text className='text-black text-center dark:text-white'>
						<InfoOutlineIcon marginRight={'0.25rem'} />
						Disclaimer: Please wait 5 minutes for contacts to sync after login.
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
					onClick={() => navigate(NAVIGATION.FEATURES)}
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