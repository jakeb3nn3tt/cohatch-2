import { SALE_STATUS } from "../types/sale";

export const HTTPS_FUNCTION_BASE = HTML_FUNCTIONS;

export const STATUS = {
  succeeded: SALE_STATUS.PAID,
  canceled: SALE_STATUS.CANCELED,
  processing: SALE_STATUS.PROCESSING,
}