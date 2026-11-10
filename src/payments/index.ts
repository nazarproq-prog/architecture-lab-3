export type PaymentStatus = 'paid' | 'processing' | 'failed';

export function normalizePaymentStatus(rawStatus: string | undefined | null): PaymentStatus {
    switch (rawStatus) {
        case 'succeeded':
        case 'paid':
            return 'paid';
        case 'requires_action':
        case 'pending':
        case 'in_progress':
        case 'processing':
            return 'processing';
        case 'payment_failed':
        case 'canceled':
        case 'declined':
        case 'failed':
            return 'failed';
        default:
            return 'failed';
    }
}