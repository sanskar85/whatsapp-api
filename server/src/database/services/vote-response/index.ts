import Logger from 'n23-logger';
import WAWebJS from 'whatsapp-web.js';
import { IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import VoteResponseDB from '../../repository/vote-response';

export default class VoteResponseService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	getPollDetails(data: WAWebJS.Message) {
		return {
			title: data.pollName,
			options: (data.pollOptions as unknown as { name: string }[]).map((opt) => opt.name),
			isMultiSelect: data.allowMultipleAnswers,
			chat_id: data.to,
		};
	}

	async saveVote(details: {
		title: string;
		options: string[];
		isMultiSelect: boolean;

		chat_id: string;
		voter_number: string;

		voter_name: string;
		group_name: string;
		selected_options: string[];
		voted_at: Date;
	}) {
		try {
			const voteResponse = await VoteResponseDB.findOne({
				user: this.user.id,
				title: details.title,
				options: details.options,
				isMultiSelect: details.isMultiSelect,
				chat_id: details.chat_id,
				voter_number: details.voter_number,
			});

			if (!voteResponse) {
				return await VoteResponseDB.create({ user: this.user, ...details });
			}

			voteResponse.selected_option = details.selected_options;
			voteResponse.voted_at = details.voted_at;
			await voteResponse.save();
			return voteResponse;
		} catch (err: any) {
			Logger.error('Error saving poll', err);
			return null;
		}
	}

	async allPolls() {
		const polls = await VoteResponseDB.aggregate([
			{
				$group: {
					_id: {
						title: '$title',
						options: '$options',
						isMultiSelect: '$isMultiSelect',
					},
					responses: { $push: '$$ROOT' },
				},
			},
			{
				$project: {
					_id: 0, // Exclude the default _id field
					title: '$_id.title',
					options: '$_id.options',
					isMultiSelect: '$_id.isMultiSelect',
				},
			},
		]);
		return polls as {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	}

	async getPoll({
		title,
		options,
		isMultiSelect,
	}: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}) {
		const polls = await VoteResponseDB.find({
			user: this.user.id,
			title,
			options: { $all: options },
			isMultiSelect,
		});

		return polls.map((poll) => ({
			title: poll.title,
			options: poll.options,
			isMultiSelect: poll.isMultiSelect,
			chat_id: poll.chat_id,
			voter_number: poll.voter_number,
			voter_name: poll.voter_name,
			group_name: poll.group_name,
			selected_option: poll.selected_option,
			voted_at: DateUtils.getMoment(poll.voted_at).format('DD-MM-YYYY HH:mm:ss'),
		}));
	}
}
