import { Types } from 'mongoose';
import { IUser } from '../../../types/user';
import MergedGroupDB from '../../repository/merged-groups';

export default class GroupMergeService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	async listGroups() {
		const merged_groups = await MergedGroupDB.find({
			user: this.user,
		});

		return merged_groups.map((group) => ({
			id: group._id as string,
			name: group.name as string,
		}));
	}

	async mergeGroup(name: string, group_ids: string[]) {
		await MergedGroupDB.create({
			user: this.user,
			name,
			groups: group_ids,
		});
	}
	async deleteGroup(group_id: Types.ObjectId) {
		await MergedGroupDB.deleteOne({ _id: group_id });
	}
	async removeFromGroup(id: Types.ObjectId, group_ids: string[]) {
		const mergedGroup = await MergedGroupDB.findById(id);
		if (!mergedGroup) return;
		mergedGroup.groups = mergedGroup.groups.filter((id) => !group_ids.includes(id));
		await mergedGroup.save();
	}

	async extractWhatsappGroupIds(ids: string | string[]) {
		const searchable_ids = typeof ids === 'string' ? [ids] : ids;
		const merged_groups = await MergedGroupDB.find({
			user: this.user,
			_id: { $in: searchable_ids },
		});

		return merged_groups.map((group) => group.groups).flat();
	}
}
