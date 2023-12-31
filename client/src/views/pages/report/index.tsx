import {
	Button,
	Checkbox,
	Flex,
	HStack,
	SkeletonCircle,
	SkeletonText,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import ReportsService from '../../../services/reports.service';
import { StoreNames, StoreState } from '../../../store';
import {
	setAllCampaigns,
	setCampaignLoading,
	setDeletingCampaign,
	setExportingCampaign,
} from '../../../store/reducers/SchedulerReducer';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';

const Reports = () => {
	const dispatch = useDispatch();
	const theme = useTheme();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

	const {
		all_campaigns,
		ui: { campaignLoading, deletingCampaign, exportingCampaign },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	// add a campaign to the export make a state for it
	const [selectedCampaign, setSelectedCampaign] = useState<string[]>([]);

	const exportCampaign = useCallback(
		async (selectedCampaigns: string[]) => {
			dispatch(setExportingCampaign(true));
			const promises = selectedCampaigns.map(async (campaign) => {
				await ReportsService.generateReport(campaign);
			});
			await Promise.all(promises).then(() => {
				dispatch(setExportingCampaign(false));
				setSelectedCampaign([]);
			});
		},
		[dispatch]
	);

	useEffect(() => {
		pushToNavbar({
			title: 'Campaign Reports',
			icon: FiBarChart2,
			link: NAVIGATION.REPORTS,
			actions: (
				<HStack alignItems={'center'} justifyContent={'flex-end'}>
					<Button
						colorScheme={'green'}
						onClick={() => exportCampaign(selectedCampaign)}
						isDisabled={selectedCampaign.length === 0}
						isLoading={exportingCampaign}
					>
						Export
					</Button>
					<Button
						colorScheme={'red'}
						onClick={() => confirmationDialogRef.current?.open()}
						isDisabled={selectedCampaign.length === 0}
						isLoading={deletingCampaign}
					>
						Delete
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [
		deletingCampaign,
		selectedCampaign.length,
		exportCampaign,
		exportingCampaign,
		selectedCampaign,
	]);

	const fetchCampaigns = useCallback(() => {
		ReportsService.generateAllCampaigns()
			.then((res) => {
				dispatch(setAllCampaigns(res));
			})
			.finally(() => {
				dispatch(setCampaignLoading(false));
			});
	}, [dispatch]);

	useEffect(() => {
		dispatch(setCampaignLoading(true));
		fetchCampaigns();
	}, [dispatch, fetchCampaigns]);

	const deleteCampaign = async () => {
		dispatch(setDeletingCampaign(true));
		const promises = selectedCampaign.map(async (campaign) => {
			await ReportsService.deleteCampaign(campaign);
		});
		await Promise.all(promises).then(() => {
			dispatch(setDeletingCampaign(false));
			setSelectedCampaign([]);
			fetchCampaigns();
		});
	};

	const removeCampaignList = (campaign_id: string) => {
		setSelectedCampaign((prev) => prev.filter((campaign) => campaign !== campaign_id));
	};

	const addCampaignList = (id: string) => {
		setSelectedCampaign((prev) => [...prev, id]);
	};

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<TableContainer>
				<Table variant={'unstyled'}>
					<Thead>
						<Tr color={theme === 'dark' ? 'white' : 'black'}>
							<Th>Select</Th>
							<Th>Campaign Name</Th>
							<Th textColor={'green'}>Messages Sent</Th>
							<Th textColor={'yellow.500'}>Messages Pending</Th>
							<Th textColor={'red.400'}>Messages Failed</Th>
							<Th>Status</Th>
						</Tr>
					</Thead>
					<Tbody>
						{campaignLoading ? (
							<Tr
								bg={theme === 'light' ? 'gray.50' : 'gray.700'}
								color={theme === 'dark' ? 'white' : 'black'}
							>
								<Td>
									<SkeletonCircle size='10' />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
							</Tr>
						) : (
							all_campaigns.map((campaign, index) => (
								<Tr
									key={index}
									bg={theme === 'light' ? 'gray.50' : 'gray.700'}
									color={theme === 'dark' ? 'white' : 'black'}
								>
									<Td>
										<Checkbox
											colorScheme='green'
											mr={4}
											isChecked={selectedCampaign.includes(campaign.campaign_id)}
											onChange={(e) => {
												if (e.target.checked) {
													addCampaignList(campaign.campaign_id);
												} else {
													removeCampaignList(campaign.campaign_id);
												}
											}}
										/>
										{index + 1}.
									</Td>
									<Td>
										{campaign.campaignName.length > 28
											? campaign.campaignName.substring(0, 27) + '...'
											: campaign.campaignName}
									</Td>

									<Td textColor={'green'}>{campaign.sent}</Td>
									<Td textColor={'yellow.500'}>{campaign.pending}</Td>
									<Td textColor={'red.400'}>{campaign.failed}</Td>
									<Td>
										{campaign.isPaused ? (
											<Button
												size={'sm'}
												colorScheme='green'
												onClick={() => {
													ReportsService.resumeCampaign(campaign.campaign_id).then(() => {
														fetchCampaigns();
													});
												}}
											>
												Resume
											</Button>
										) : campaign.pending !== 0 ? (
											<Button
												size={'sm'}
												colorScheme='red'
												onClick={() => {
													ReportsService.pauseCampaign(campaign.campaign_id).then(() => {
														fetchCampaigns();
													});
												}}
											>
												Pause
											</Button>
										) : (
											'Campaign Completed'
										)}
									</Td>
								</Tr>
							))
						)}
					</Tbody>
				</Table>
			</TableContainer>
			<ConfirmationDialog
				type={'Campaign'}
				ref={confirmationDialogRef}
				onConfirm={deleteCampaign}
			/>
		</Flex>
	);
};

function LineSkeleton() {
	return <SkeletonText mt='4' noOfLines={1} spacing='4' skeletonHeight='4' rounded={'md'} />;
}

export default Reports;
