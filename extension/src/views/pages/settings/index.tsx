import {
	Box,
	Button,
	Flex,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import Header from '../../components/header';
import { useEffect, useRef, useState } from 'react';
import { SETTINGS } from '../../../config/const';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import AuthService from '../../../services/auth.service';
import { useAuth } from '../../../hooks/useAuth';
import LoginModal, { LoginHandle } from '../../components/login';
import ExportsService from '../../../services/exports.service';

export default function Settings() {
	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } = useAuth();
	const loginModelRef = useRef<LoginHandle>(null);

	const [details, setDetails] = useState({
		[SETTINGS.NAME]: '',
		[SETTINGS.PHONE_NUMBER]: '',
		[SETTINGS.IS_SUBSCRIBED]: false,
		[SETTINGS.SUBSCRIPTION_EXPIRATION]: '',
		[SETTINGS.USER_TYPE]: '',
		[SETTINGS.PAYMENT_RECORDS]: [] as {
			date: string;
			amount: number;
		}[],
	});

	useEffect(() => {
		if (!isAuthenticated) return;
		AuthService.getUserDetails().then((res) => {
			setDetails({
				[SETTINGS.NAME]: res.name,
				[SETTINGS.PHONE_NUMBER]: res.phoneNumber,
				[SETTINGS.IS_SUBSCRIBED]: res.isSubscribed,
				[SETTINGS.SUBSCRIPTION_EXPIRATION]: res.subscriptionExpiration,
				[SETTINGS.USER_TYPE]: res.userType,
				[SETTINGS.PAYMENT_RECORDS]: res.paymentRecords,
			});
		});
	}, [isAuthenticated]);

	const { NAME, PHONE_NUMBER, IS_SUBSCRIBED, SUBSCRIPTION_EXPIRATION, USER_TYPE, PAYMENT_RECORDS } =
		details;

	useEffect(() => {
		if (!!qrGenerated) {
			loginModelRef.current?.open();
		} else {
			loginModelRef.current?.close();
		}
	}, [qrGenerated]);

	return (
		<>
			<Box width='full' py={'1rem'} px={'1rem'}>
				<Header />

				{isAuthenticating || !PHONE_NUMBER ? (
					<Text
						className='text-black dark:text-white animate-pulse'
						fontSize={'md'}
						fontWeight={'medium'}
						marginTop={'130px'}
						textAlign={'center'}
					>
						Loading...
					</Text>
				) : (
					<Box marginTop={'1rem'}>
						<section>
							<Flex justifyContent={'space-between'} alignItems={'center'}>
								<Text className='text-black dark:text-white' fontSize={'md'} fontWeight={'medium'}>
									{NAME}
								</Text>
								<Text className='text-gray-800 dark:text-gray-300'>{USER_TYPE}</Text>
							</Flex>
							<Box
								marginTop={'0.25rem'}
								backgroundColor='#234768'
								paddingX={'1rem'}
								paddingY={'0.5rem'}
								width={'max-content'}
								rounded={'md'}
							>
								<Text color={'white'}>{PHONE_NUMBER ? `+${PHONE_NUMBER}` : ''}</Text>
							</Box>
						</section>

						<section>
							<Flex marginTop={'1rem'} rounded={'md'} alignItems={'center'}>
								<Text color='gray.400' fontWeight={'semibold'}>
									Plan
								</Text>
								<Box bgColor={'gray.400'} width={'full'} height={'2px'} marginLeft={'1rem'} />
							</Flex>

							<Box
								marginTop={'0.25rem'}
								backgroundColor={IS_SUBSCRIBED ? '#235C39' : '#541919'}
								paddingX={'1rem'}
								paddingY={'0.5rem'}
								width={'max-content'}
								rounded={'md'}
							>
								<Text textColor={IS_SUBSCRIBED ? '#34F27B' : '#FF2626'}>
									{IS_SUBSCRIBED ? 'Active' : 'Not Subscribed'}
								</Text>
							</Box>
							{IS_SUBSCRIBED ? (
								<Flex marginTop={'0.5rem'} gap={'0.5rem'} alignItems={'center'}>
									<InfoOutlineIcon color={'#BB2525'} width={4} />
									<Text color={'#BB2525'}>Expires On {SUBSCRIPTION_EXPIRATION}</Text>
								</Flex>
							) : null}
						</section>

						<section>
							<Flex
								marginTop={'1rem'}
								rounded={'md'}
								alignItems={'center'}
								hidden={PAYMENT_RECORDS.length === 0}
							>
								<Text color='gray.400' fontWeight={'semibold'}>
									Payment History
								</Text>
								<Box bgColor={'gray.400'} flexGrow={'1'} height={'2px'} marginLeft={'1rem'} />
							</Flex>

							<Flex
								marginTop={'0.25rem'}
								paddingX={'1rem'}
								paddingY={'0.5rem'}
								alignItems={'center'}
								rounded={'md'}
								flexDirection={'column'}
								hidden={PAYMENT_RECORDS.length === 0}
							>
								<Button
									variant='solid'
									backgroundColor={'green.500'}
									marginX={'auto'}
									color={'white'}
									onClick={() => ExportsService.exportPaymentsExcel(PAYMENT_RECORDS)}
									_hover={{
										backgroundColor: 'green.600',
									}}
								>
									Export
								</Button>
								<TableContainer
									border={'1px'}
									borderColor={'gray.100'}
									rounded={'lg'}
									padding={'0.5rem'}
									marginTop={'0.5rem'}
									width={'full'}
								>
									<Table size={'sm'} className='text-gray-800 dark:text-gray-300'>
										<Thead className='text-gray-900 dark:text-gray-100'>
											<Tr>
												<Th>Date</Th>
												<Th isNumeric>Amount</Th>
											</Tr>
										</Thead>
										<Tbody>
											{PAYMENT_RECORDS.map((record, index) => (
												<Tr key={index}>
													<Td>{record.date}</Td>
													<Td isNumeric>{record.amount}</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</TableContainer>
							</Flex>
						</section>
					</Box>
				)}

				<LoginModal ref={loginModelRef} qr={qrCode} />
			</Box>
		</>
	);
}