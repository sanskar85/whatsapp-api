import APIInstance from '../config/APIInstance';

export default class GroupService {
	static async listGroups() {
		try {
			const { data } = await APIInstance.get(`/groups`);
			return data.groups as {
				id: string;
				name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async fetchGroup(id: string) {
		try {
			const { data } = await APIInstance.get(`/groups/${id}`);
			return {
				id: data.id as string,
				name: data.name as string,
				participants: data.participants as {
					name: string;
					number: string;
					country: string;
					isBusiness: string;
					user_type: string;
					group_name: string;
				}[],
			};
		} catch (err) {
			return null;
		}
	}
}
