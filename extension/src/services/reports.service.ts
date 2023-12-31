import APIInstance from '../config/APIInstance';

export default class ReportsService {
	static async generateAllCampaigns() {
		try {
			const { data: response } = await APIInstance.get(`/reports/campaign`);

			return response.report as {
				campaign_id: string;
				campaignName: string;
				sent: number;
				failed: number;
				pending: number;
				isPaused: boolean;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async pauseCampaign(id: string) {
		try {
			await APIInstance.post(`/reports/campaign/${id}/pause`);
		} catch (err) {}
	}
	static async resumeCampaign(id: string) {
		try {
			await APIInstance.post(`/reports/campaign/${id}/resume`);
		} catch (err) {}
	}
	static async deleteCampaign(id: string) {
		try {
			await APIInstance.delete(`/reports/campaign/${id}/delete`);
		} catch (err) {}
	}
	static async generateReport(id: string) {
		try {
			const { data } = await APIInstance.get(`/reports/campaign/${id}`);
			return data.report as {
				message: string;
				receiver: string;
				attachments: number;
				contacts: number;
				campaign_name: string;
				status: string;
			}[];
		} catch (err) {
			return [];
		}
	}
}
