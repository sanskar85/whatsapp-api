import APIInstance from '../config/APIInstance';
export default class AttachmentService {
    static async getAttachments() {
        try {
            const { data } = await APIInstance.get(`/uploads/attachment`);
            return data.attachments;
        } catch (err) {
            return [];
        }
    }

    static async deleteAttachment(id: string) {
        try {
            await APIInstance.delete(`/uploads/attachment/${id}`);
            return true;
        } catch (err) {
            return false;
        }
    }

    static async uploadAttachment(
        file: File,
        name: string,
        caption: string,
        custom_caption: boolean,
        onUploadProgress: (progress: number) => void
    ) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);
            formData.append('caption', caption);
            formData.append('custom_caption', custom_caption.toString());
            return await APIInstance.post(`/uploads/attachment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    onUploadProgress(
                        Math.round(
                            (progressEvent.loaded * 100) /
                                (progressEvent.total ?? 1)
                        )
                    );
                },
            });
        } catch (err) {
            return false;
        }
    }

    static async updateAttachmentDetails(attachment_details: {
        id: string;
        name: string;
        caption: string;
        custom_caption: boolean;
    }) {
        try {
            const { data } = await APIInstance.patch(
                `/uploads/attachment/${attachment_details.id}`,
                {
                    name: attachment_details.name,
                    caption: attachment_details.caption,
                    custom_caption: attachment_details.custom_caption,
                }
            );
            return data.attachment;
        } catch (err) {
            return false;
        }
    }

    static updateAttachmentFile(id: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return APIInstance.put(`/uploads/attachment/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}
