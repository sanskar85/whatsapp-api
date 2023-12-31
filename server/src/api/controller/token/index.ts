import { Request, Response, NextFunction } from 'express';
import TokenService from '../../../database/services/token';
import { Respond } from '../../../utils/ExpressUtils';

async function generateToken(req: Request, res: Response, next: NextFunction) {
	const token = await TokenService.createToken();

	return Respond({
		res,
		status: 200,
		data: { token },
	});
}

async function validateToken(req: Request, res: Response, next: NextFunction) {
	const token = req.params.token_code;

	const isValid = await TokenService.validateToken(token);

	return Respond({
		res,
		status: isValid ? 200 : 400,
	});
}

const TokenController = {
	generateToken,
	validateToken,
};

export default TokenController;
