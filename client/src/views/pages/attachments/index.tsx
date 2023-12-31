import { EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Checkbox,
    HStack,
    Icon,
    IconButton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tooltip,
    Tr,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { MdDelete, MdOutlineAttachment } from 'react-icons/md';
import { RiAttachment2 } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import AttachmentService from '../../../services/attachment.service';
import { StoreNames, StoreState } from '../../../store';
import {
    clearSelectedAttachment,
    clearSelectedAttachments,
    deleteAttachment,
    findAttachmentById,
    setSelectedAttachment,
    startAttachmentDeleting,
    startAttachmentUpdating,
    toggleSelected,
} from '../../../store/reducers/AttachmentReducers';
import ConfirmationDialog, {
    ConfirmationDialogHandle,
} from '../../components/confirmation-alert';
import AttachmentDetailsInputDialog, {
    AttachmentDetailsInputDialogHandle,
} from './components/attachment-details-input-dialog';

const AttachmentPage = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const AttachmentDetailsInputRef =
        React.useRef<AttachmentDetailsInputDialogHandle>(null);
    const confirmationDialogRef = React.useRef<ConfirmationDialogHandle>(null);

    const { attachments, uiDetails, selectedAttachments } = useSelector(
        (state: StoreState) => state[StoreNames.ATTACHMENT]
    );

    const { isDeleting } = uiDetails;

    useEffect(() => {
        pushToNavbar({
            title: 'Attachments',
            icon: RiAttachment2,
            link: NAVIGATION.ATTACHMENTS,
            actions: (
                <HStack>
                    <Button
                        leftIcon={
                            <Icon
                                as={MdOutlineAttachment}
                                height={5}
                                width={5}
                            />
                        }
                        colorScheme={'green'}
                        variant={'solid'}
                        size={'sm'}
                        onClick={() => {
                            AttachmentDetailsInputRef.current?.open();
                        }}
                    >
                        Add Attachment
                    </Button>

                    <Button
                        leftIcon={<Icon as={MdDelete} height={5} width={5} />}
                        colorScheme={'red'}
                        variant={'solid'}
                        size={'sm'}
                        onClick={() => {
                            confirmationDialogRef.current?.open('');
                        }}
                        isLoading={isDeleting}
                        isDisabled={selectedAttachments.length === 0}
                    >
                        Delete Attachment
                    </Button>
                </HStack>
            ),
        });
        return () => {
            popFromNavbar();
        };
    }, [isDeleting, selectedAttachments.length]);

    const handleDeleteAttachments = async () => {
        dispatch(startAttachmentDeleting());
        selectedAttachments.forEach(async (attachment_id) => {
            AttachmentService.deleteAttachment(attachment_id);
            dispatch(deleteAttachment(attachment_id as string));
        });
        dispatch(clearSelectedAttachment());
        dispatch(clearSelectedAttachments());
    };

    const handleAttachmentDetailsEdit = (id: string) => {
        dispatch(startAttachmentUpdating());
        dispatch(findAttachmentById({ id }));
        AttachmentDetailsInputRef.current?.open();
    };

    const handleFileChange = (id: string) => {
        dispatch(startAttachmentUpdating());
        dispatch(setSelectedAttachment({ id }));
        document.getElementById('attachment-file-input')?.click();
    };

    return (
        <Box py={'1rem'}>
            <AttachmentDetailsInputDialog ref={AttachmentDetailsInputRef} />
            <TableContainer
                pt={'0.5rem'}
                textColor={theme === 'dark' ? 'white' : 'black'}
            >
                <Table>
                    <Thead>
                        <Tr>
                            <Th width={'5%'}>Sl no</Th>
                            <Th width={'10%'}>Name</Th>
                            <Th width={''}>Caption</Th>
                            <Th width={'5%'}>Custom Caption</Th>
                            <Th width={'10%'}>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {attachments.map((attachment, index) => (
                            <Tr key={index} verticalAlign={'top'}>
                                <Td>
                                    <Checkbox
                                        colorScheme="green"
                                        mr={2}
                                        isChecked={selectedAttachments.includes(
                                            attachment.id
                                        )}
                                        onChange={() =>
                                            dispatch(
                                                toggleSelected(attachment.id)
                                            )
                                        }
                                    />
                                    {index + 1}.
                                </Td>
                                <Td>{attachment.name}</Td>
                                <Td>
                                    {attachment.caption
                                        .split('\n')
                                        .map((caption, index) => (
                                            <Box key={index}>{caption}</Box>
                                        ))}
                                </Td>
                                <Td>
                                    {attachment.custom_caption ? 'Yes' : 'No'}
                                </Td>
                                <Td>
                                    <HStack>
                                        <Tooltip
                                            hasArrow
                                            label="Edit Attachment Detail"
                                            bg="gray.300"
                                            color="black"
                                        >
                                            <IconButton
                                                aria-label="Edit"
                                                icon={
                                                    <Icon
                                                        as={EditIcon}
                                                        height={5}
                                                        width={5}
                                                    />
                                                }
                                                onClick={() =>
                                                    handleAttachmentDetailsEdit(
                                                        attachment.id
                                                    )
                                                }
                                            />
                                        </Tooltip>
                                        <Box as="span">
                                            <Tooltip
                                                hasArrow
                                                label="Edit Attachment File"
                                                bg="gray.300"
                                                color="black"
                                            >
                                                <IconButton
                                                    aria-label="change file"
                                                    icon={
                                                        <Icon
                                                            as={
                                                                MdOutlineAttachment
                                                            }
                                                            height={5}
                                                            width={5}
                                                        />
                                                    }
                                                    onClick={() =>
                                                        handleFileChange(
                                                            attachment.id
                                                        )
                                                    }
                                                />
                                            </Tooltip>
                                        </Box>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            <ConfirmationDialog
                type={'Attachment'}
                ref={confirmationDialogRef}
                onConfirm={handleDeleteAttachments}
            />
        </Box>
    );
};

export default AttachmentPage;
