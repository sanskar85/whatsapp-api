import { useEffect, useState } from 'react';
import BotService, { BotDetails } from '../services/bot.service';

export default function useBot() {
    const [addingBot, setAddingBot] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [bots, setBots] = useState<BotDetails[]>([]);

    useEffect(() => {
        setLoading(true);
        BotService.listBots()
            .then(setBots)
            .finally(() => setLoading(false));
    }, []);

    const add = (data: {
        trigger: string;
        message: string;
        respond_to: string;
        trigger_gap_seconds: number;
        options: string;
        shared_contact_cards: {
            first_name?: string;
            last_name?: string;
            title?: string;
            organization?: string;
            email_personal?: string;
            email_work?: string;
            contact_number_phone?: string;
            contact_number_work?: string;
            contact_number_others?: string[];
            link?: string[];
            street?: string;
            city?: string;
            state?: string;
            country?: string;
            pincode?: string;
        }[];
        attachments: string[];
        group_respond: boolean;
    }) => {
        return new Promise<void>((resolve) => {
            setAddingBot(true);
            BotService.createBot(data)
                .then((res) => {
                    if (!res) return;
                    setBots((prev) => [...prev, res]);
                })
                .finally(() => {
                    setAddingBot(false);
                    resolve();
                });
        });
    };

    const deleteBot = (id: string) => {
        BotService.deleteBot(id).then((res) => {
            if (res) {
                setBots((prev) => prev.filter((bot) => bot.bot_id !== id));
            }
        });
    };

    return { addingBot, add, bots, isLoading, deleteBot };
}
