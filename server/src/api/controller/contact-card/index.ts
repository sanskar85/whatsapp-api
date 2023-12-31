import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ContactCardService from '../../../database/services/contact-card';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond, idValidator, validatePhoneNumber } from '../../../utils/ExpressUtils';

async function listContactCards(req: Request, res: Response, next: NextFunction) {
	const contact_cards = await new ContactCardService(req.locals.user).listContacts();

	return Respond({
		res,
		status: 200,
		data: {
			contact_cards,
		},
	});
}

async function createContactCard(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const reqValidator = z.object({
		first_name: z.string().default(''),
		middle_name: z.string().default(''),
		last_name: z.string().default(''),
		title: z.string().default(''),
		organization: z.string().default(''),
		email_personal: z.string().default(''),
		email_work: z.string().default(''),
		contact_details_phone: z.string().default(''),
		contact_details_work: z.string().default(''),
		contact_details_other: z.string().array().default([]),
		links: z.string().array().default([]),
		street: z.string().default(''),
		city: z.string().default(''),
		state: z.string().default(''),
		country: z.string().default(''),
		pincode: z.string().default(''),
	});
	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const data = reqValidatorResult.data;
	const service = new ContactCardService(req.locals.user);
	const details: {
		contact_details_phone?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_work?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_other: {
			contact_number: string;
			whatsapp_id?: string;
		}[];
	} = {
		contact_details_other: [],
	};

	if (data.contact_details_phone) {
		const number = data.contact_details_phone.startsWith('+')
			? data.contact_details_phone.substring(1)
			: data.contact_details_phone;
		if (!validatePhoneNumber(number)) {
			details.contact_details_phone = {
				contact_number: `+${number}`,
			};
		} else {
			const numberId = await whatsapp.getClient().getNumberId(number);
			if (numberId) {
				details.contact_details_phone = {
					contact_number: `+${numberId.user}`,
					whatsapp_id: numberId.user,
				};
			} else {
				details.contact_details_phone = {
					contact_number: `+${number}`,
				};
			}
		}
	}

	if (data.contact_details_work) {
		const number = data.contact_details_work.startsWith('+')
			? data.contact_details_work.substring(1)
			: data.contact_details_work;
		if (!validatePhoneNumber(number)) {
			details.contact_details_work = {
				contact_number: `+${number}`,
			};
		} else {
			const numberId = await whatsapp.getClient().getNumberId(number);
			if (numberId) {
				details.contact_details_work = {
					contact_number: `+${numberId.user}`,
					whatsapp_id: numberId.user,
				};
			} else {
				details.contact_details_work = {
					contact_number: `+${number}`,
				};
			}
		}
	}

	for (const number of data.contact_details_other) {
		const formattedNumber = number.startsWith('+') ? number.substring(1) : number;
		if (!validatePhoneNumber(formattedNumber)) {
			details.contact_details_other.push({
				contact_number: `+${formattedNumber}`,
			});
		} else {
			const numberId = await whatsapp.getClient().getNumberId(formattedNumber);
			if (numberId) {
				details.contact_details_other.push({
					contact_number: `+${numberId.user}`,
					whatsapp_id: numberId.user,
				});
			} else {
				details.contact_details_other.push({
					contact_number: `+${formattedNumber}`,
				});
			}
		}
	}
	const contact_card = await service.createContactCard({
		...data,
		contact_details_phone: details.contact_details_phone,
		contact_details_work: details.contact_details_work,
		contact_details_other: details.contact_details_other,
	});

	return Respond({
		res,
		status: 200,
		data: {
			contact_card,
		},
	});
}

async function updateContactCard(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const [isIDValid, id] = idValidator(req.params.id);

	const reqValidator = z.object({
		first_name: z.string().default(''),
		middle_name: z.string().default(''),
		last_name: z.string().default(''),
		title: z.string().default(''),
		organization: z.string().default(''),
		email_personal: z.string().default(''),
		email_work: z.string().default(''),
		contact_details_phone: z.string().default(''),
		contact_details_work: z.string().default(''),
		contact_details_other: z.string().array().default([]),
		links: z.string().array().default([]),
		street: z.string().default(''),
		city: z.string().default(''),
		state: z.string().default(''),
		country: z.string().default(''),
		pincode: z.string().default(''),
	});
	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success || !isIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const data = reqValidatorResult.data;
	const service = new ContactCardService(req.locals.user);
	const details: {
		contact_details_phone?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_work?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_other: {
			contact_number: string;
			whatsapp_id?: string;
		}[];
	} = {
		contact_details_other: [],
	};

	if (data.contact_details_phone) {
		const number = data.contact_details_phone.startsWith('+')
			? data.contact_details_phone.substring(1)
			: data.contact_details_phone;
		if (!validatePhoneNumber(number)) {
			details.contact_details_phone = {
				contact_number: `+${number}`,
			};
		} else {
			const numberId = await whatsapp.getClient().getNumberId(number);
			if (numberId) {
				details.contact_details_phone = {
					contact_number: `+${numberId.user}`,
					whatsapp_id: numberId.user,
				};
			} else {
				details.contact_details_phone = {
					contact_number: `+${number}`,
				};
			}
		}
	}

	if (data.contact_details_work) {
		const number = data.contact_details_work.startsWith('+')
			? data.contact_details_work.substring(1)
			: data.contact_details_work;
		if (!validatePhoneNumber(number)) {
			details.contact_details_work = {
				contact_number: `+${number}`,
			};
		} else {
			const numberId = await whatsapp.getClient().getNumberId(number);
			if (numberId) {
				details.contact_details_work = {
					contact_number: `+${numberId.user}`,
					whatsapp_id: numberId.user,
				};
			} else {
				details.contact_details_work = {
					contact_number: `+${number}`,
				};
			}
		}
	}

	for (const number of data.contact_details_other) {
		const formattedNumber = number.startsWith('+') ? number.substring(1) : number;
		if (!validatePhoneNumber(formattedNumber)) {
			details.contact_details_other.push({
				contact_number: `+${formattedNumber}`,
			});
		} else {
			const numberId = await whatsapp.getClient().getNumberId(formattedNumber);
			if (numberId) {
				details.contact_details_other.push({
					contact_number: `+${numberId.user}`,
					whatsapp_id: numberId.user,
				});
			} else {
				details.contact_details_other.push({
					contact_number: `+${formattedNumber}`,
				});
			}
		}
	}
	const contact_card = await service.updateContactCard(id, {
		...data,
		contact_details_phone: details.contact_details_phone,
		contact_details_work: details.contact_details_work,
		contact_details_other: details.contact_details_other,
	});

	return Respond({
		res,
		status: 200,
		data: {
			contact_card,
		},
	});
}

async function deleteContactCard(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, id] = idValidator(req.params.id);

	if (!isIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	new ContactCardService(req.locals.user).deleteContactCard(id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}
const ContactCardController = {
	listContactCards,
	createContactCard,
	updateContactCard,
	deleteContactCard,
};

export default ContactCardController;
