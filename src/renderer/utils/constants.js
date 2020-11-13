export const statuses = {
    waiting: 'waiting',
    received: 'received',
    confirming: 'confirming',
    exchanging: 'exchanging',
    confirmed: 'confirmed',
    failed: 'failed',
    refunded: 'refunded',
    expired: 'expired'
};

export const finishedStatuses = ['confirmed', 'failed', 'refunded', 'expired'];

export const exchangingStatuses = ['received', 'exchanging'];