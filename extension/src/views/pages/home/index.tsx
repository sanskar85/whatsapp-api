import {
    Box,
    Icon,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiFillEyeInvisible } from 'react-icons/ai';
import { BsBarChartFill } from 'react-icons/bs';
import { PiExportBold } from 'react-icons/pi';
import { SiProbot } from 'react-icons/si';
import { TbMessage2Minus } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import { useNetwork } from '../../../hooks/useNetwork';
import '../../../index.css';
import Header from '../../components/header';
import ChatBot from '../chat-bot';
import Enhancements from '../enhancements';
import Exports from '../exports';
import Message from '../message';
import Reports from '../reports';

const TABS = [
    {
        name: 'Privacy',
        icon: AiFillEyeInvisible,
        component: <Enhancements />,
        disabled: false,
    },
    {
        name: 'Exports',
        icon: PiExportBold,
        component: <Exports />,
        disabled: false,
    },

    {
        name: 'Message',
        icon: TbMessage2Minus,
        component: <Message />,
        disabled: false,
    },
    {
        name: 'Chat-Bot',
        icon: SiProbot,
        component: <ChatBot />,
        disabled: false,
    },
    {
        name: 'Reports',
        icon: BsBarChartFill,
        component: <Reports />,
        disabled: false,
    },
];

export default function Home() {
    const [tabIndex, setTabIndex] = useState(0);

    const navigate = useNavigate();
    const status = useNetwork();
    useEffect(() => {
        if (status === 'NO-NETWORK') {
            navigate(NAVIGATION.NETWORK_ERROR);
        }
    }, [status, navigate]);

    return (
        <Box width="full" py={'1rem'} px={'1rem'} className="custom-scrollbar">
            <Header />

            <Tabs index={tabIndex} onChange={setTabIndex} pt={'1rem'} isLazy>
                <TabList
                    className="bg-[#ECECEC] border-[#ECECEC] dark:bg-[#3c3c3c] dark:!border-[#3c3c3c]"
                    rounded={'lg'}
                    padding={'0.25rem'}
                >
                    {TABS.map((tab, index) => (
                        <Tab
                            key={index}
                            width={'12.5%'}
                            padding={0}
                            rounded={'lg'}
                            isDisabled={tab.disabled}
                            _selected={{ width: '50%', bgColor: '#4CB072' }}
                            transition="0.3s"
                        >
                            <Box
                                width="full"
                                height="full"
                                rounded="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent={'center'}
                                gap={'0.5rem'}
                                padding={'0.5rem'}
                            >
                                <Icon
                                    as={tab.icon}
                                    color={
                                        tabIndex === index
                                            ? 'white'
                                            : 'green.400'
                                    }
                                    width={4}
                                />
                                {tabIndex === index ? (
                                    <Text
                                        textColor="white"
                                        fontSize={'sm'}
                                        fontWeight="bold"
                                        transition="0.3s"
                                    >
                                        {tab.name}
                                    </Text>
                                ) : null}
                            </Box>
                        </Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {TABS.map((tab, index) => (
                        <TabPanel key={index} padding={0}>
                            {tab.component}
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
}
