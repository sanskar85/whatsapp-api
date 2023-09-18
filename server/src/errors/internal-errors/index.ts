import InternalError from './InternalError';
import COMMON_ERRORS from './common-errors';
import USER_ERRORS from './user-errors';
import RAZORPAY_ERRORS from './razorpay-errors';
import PAYMENT_ERROR from './payment-error';

export default InternalError;

const INTERNAL_ERRORS = {
	COMMON_ERRORS: COMMON_ERRORS,
	USER_ERRORS: USER_ERRORS,
	RAZORPAY_ERRORS: RAZORPAY_ERRORS,
	PAYMENT_ERROR: PAYMENT_ERROR,
};

export { INTERNAL_ERRORS, COMMON_ERRORS, USER_ERRORS };
