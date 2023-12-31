import { json2csv } from 'json-2-csv';

type TContact = {
	name: string;
	number: string;
	isBusiness: string;
	country: string;
	public_name: string;
};

type TParticipant = TContact & {
	user_type: string;
	group_name: string;
};

type TLabelParticipant = TContact & {
	group_name: string;
	label: string;
};

export default class ExcelUtils {
	static async exportContacts(contacts: TContact[], sheetName: string) {
		const keys = [
			{
				field: 'public_name',
				title: 'Whatsapp Public Name',
			},
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'number',
				title: 'Number',
			},
			{
				field: 'isBusiness',
				title: 'Is Business',
			},
			{
				field: 'country',
				title: 'Country',
			},
		];

		const csv = await json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', `${sheetName}.csv`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportGroup(participants: TParticipant[]) {
		const keys = [
			{
				field: 'group_name',
				title: 'Group Name',
			},
			{
				field: 'public_name',
				title: 'Whatsapp Public Name',
			},
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'number',
				title: 'Number',
			},
			{
				field: 'isBusiness',
				title: 'Is Business',
			},
			{
				field: 'country',
				title: 'Country',
			},
			{
				field: 'user_type',
				title: 'User Type',
			},
		];

		const csv = await json2csv(participants, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'group_contacts.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportLabel(participants: TLabelParticipant[]) {
		const keys = [
			{
				field: 'label',
				title: 'Label',
			},
			{
				field: 'group_name',
				title: 'Group Name',
			},
			{
				field: 'public_name',
				title: 'Whatsapp Public Name',
			},
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'number',
				title: 'Number',
			},
			{
				field: 'isBusiness',
				title: 'Is Business',
			},
			{
				field: 'country',
				title: 'Country',
			},
		];

		const csv = await json2csv(participants, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'label_contacts.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportPayments(
		records: {
			date: string;
			amount: number;
		}[]
	) {
		const keys = [
			{
				field: 'date',
				title: 'Date',
			},
			{
				field: 'amount',
				title: 'Amount',
			},
		];

		const csv = await json2csv(records, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'payments.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportReport(
		reports: {
			message: string;
			receiver: string;
			attachments: number;
			contacts: number;
			campaign_name: string;
			status: string;
		}[]
	) {
		const keys = [
			{
				field: 'campaign_name',
				title: 'Campaign Name',
			},
			{
				field: 'receiver',
				title: 'Recipient',
			},
			{
				field: 'message',
				title: 'Message',
			},

			{
				field: 'attachments',
				title: 'Attachments',
			},
			{
				field: 'contacts',
				title: 'Contacts',
			},
			{
				field: 'status',
				title: 'Status',
			},
		];

		const csv = await json2csv(reports, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'campaign-report.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async downloadTemplate() {
		const keys = [
			{
				field: 'number',
				title: 'number',
			},
			{
				field: 'extra_variable',
				title: 'extra_variable',
			},
		];

		const csv = await json2csv(
			[{ number: '91790XXXX890', extra_variable: 'This can be used for message Customization' }],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'template.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}
