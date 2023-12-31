import APIInstance from '../config/APIInstance';

export default class MessageService {
    static async scheduleMessage(data: {
        type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
        numbers?: string[];
        csv_file?: string;
        group_ids?: string[];
        label_ids?: string[];
        message?: string;
        variables?: string[];
        shared_contact_cards?: {
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
        attachments?: string[];
        campaign_name: string;
        min_delay: number;
        max_delay: number;
        startTime?: string;
        endTime?: string;
        batch_delay?: number;
        batch_size?: number;
    }) {
        try {
            await APIInstance.post(`/whatsapp/schedule-message`, data);
            return null;
        } catch (err: any) {
            if (err.response.data.title === 'ALREADY_EXISTS')
                return 'Campaign name already exists';
            return 'Unable to schedule message';
        }
    }
}
