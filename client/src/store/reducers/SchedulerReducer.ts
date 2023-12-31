import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '../config';
import { ScheduledCampaign, SchedulerState } from '../types/SchedulerState';

const initialState: SchedulerState = {
	all_campaigns: [] as ScheduledCampaign[],
	details: {
		type: 'CSV',
		numbers: [],
		csv_file: '',
		group_ids: [],
		label_ids: [],
		message: '',
		variables: [],
		shared_contact_cards: [],
		attachments: [],
		campaign_name: '',
		min_delay: 1,
		max_delay: 60,
		startTime: '00:00',
		endTime: '23:59',
		batch_delay: 120,
		batch_size: 1,
	},
	isRecipientsLoading: false,
	isBusinessAccount: false,
	recipients: [],
	ui: {
		campaignLoading: false,
		exportingCampaign: false,
		deletingCampaign: false,
	},
};

const SchedulerSlice = createSlice({
	name: StoreNames.SCHEDULER,
	initialState,
	reducers: {
		reset: (state) => {
			state.all_campaigns = initialState.all_campaigns;
			state.details = initialState.details;
			state.isRecipientsLoading = initialState.isRecipientsLoading;
			state.isBusinessAccount = initialState.isBusinessAccount;
			state.recipients = initialState.recipients;
			state.ui = initialState.ui;
		},
		setAllCampaigns: (state, action: PayloadAction<typeof initialState.all_campaigns>) => {
			state.all_campaigns = action.payload;
		},
		setCampaignName: (state, action: PayloadAction<typeof initialState.details.campaign_name>) => {
			state.details.campaign_name = action.payload;
		},
		setRecipientsFrom: (state, action: PayloadAction<typeof initialState.details.type>) => {
			state.details.type = action.payload;
		},
		setRecipientsLoading: (
			state,
			action: PayloadAction<typeof initialState.isRecipientsLoading>
		) => {
			state.isRecipientsLoading = action.payload;
		},
		setBusinessAccount: (state, action: PayloadAction<typeof initialState.isBusinessAccount>) => {
			state.isBusinessAccount = action.payload;
		},
		setRecipients: (state, action: PayloadAction<typeof initialState.recipients>) => {
			state.recipients = action.payload;
		},
		setCSVFile: (state, action: PayloadAction<typeof initialState.details.csv_file>) => {
			state.details.csv_file = action.payload;
		},
		setVariables: (state, action: PayloadAction<typeof initialState.details.variables>) => {
			state.details.variables = action.payload;
		},
		setGroupRecipients: (state, action: PayloadAction<typeof initialState.details.group_ids>) => {
			state.details.group_ids = action.payload;
		},
		setLabelRecipients: (state, action: PayloadAction<typeof initialState.details.label_ids>) => {
			state.details.label_ids = action.payload;
		},
		setMessage: (state, action: PayloadAction<typeof initialState.details.message>) => {
			state.details.message = action.payload;
		},
		setAttachments: (state, action: PayloadAction<typeof initialState.details.attachments>) => {
			state.details.attachments = action.payload;
		},
		setContactCards: (
			state,
			action: PayloadAction<typeof initialState.details.shared_contact_cards>
		) => {
			state.details.shared_contact_cards = action.payload;
		},
		setMinDelay: (state, action: PayloadAction<typeof initialState.details.min_delay>) => {
			state.details.min_delay = action.payload;
		},
		setMaxDelay: (state, action: PayloadAction<typeof initialState.details.max_delay>) => {
			state.details.max_delay = action.payload;
		},
		setBatchSize: (state, action: PayloadAction<typeof initialState.details.batch_size>) => {
			state.details.batch_size = action.payload;
		},
		setBatchDelay: (state, action: PayloadAction<typeof initialState.details.batch_delay>) => {
			state.details.batch_delay = action.payload;
		},
		setStartTime: (state, action: PayloadAction<typeof initialState.details.startTime>) => {
			state.details.startTime = action.payload;
		},
		setEndTime: (state, action: PayloadAction<typeof initialState.details.endTime>) => {
			state.details.endTime = action.payload;
		},
		setCampaignLoading: (state, action: PayloadAction<typeof initialState.ui.campaignLoading>) => {
			state.ui.campaignLoading = action.payload;
		},
		setExportingCampaign: (
			state,
			action: PayloadAction<typeof initialState.ui.exportingCampaign>
		) => {
			state.ui.exportingCampaign = action.payload;
		},
		setDeletingCampaign: (
			state,
			action: PayloadAction<typeof initialState.ui.deletingCampaign>
		) => {
			state.ui.deletingCampaign = action.payload;
		},
	},
});

export const {
	reset,
	setAllCampaigns,
	setCampaignName,
	setRecipientsFrom,
	setRecipientsLoading,
	setBusinessAccount,
	setRecipients,
	setCSVFile,
	setVariables,
	setGroupRecipients,
	setLabelRecipients,
	setMessage,
	setAttachments,
	setContactCards,
	setMinDelay,
	setMaxDelay,
	setBatchSize,
	setBatchDelay,
	setStartTime,
	setEndTime,
	setCampaignLoading,
	setDeletingCampaign,
	setExportingCampaign,
} = SchedulerSlice.actions;

export default SchedulerSlice.reducer;
