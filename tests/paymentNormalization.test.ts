import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { normalizePaymentStatus } from '../src/payments/index';

test('normalizePaymentStatus: переводить успішну оплату у paid', () => {
    assert.equal(normalizePaymentStatus('succeeded'), 'paid');
    assert.equal(normalizePaymentStatus('paid'), 'paid');
});

test('normalizePaymentStatus: переводить незавершений платіж у processing', () => {
    assert.equal(normalizePaymentStatus('requires_action'), 'processing');
    assert.equal(normalizePaymentStatus('pending'), 'processing');
    assert.equal(normalizePaymentStatus('processing'), 'processing');
});

test('normalizePaymentStatus: переводить помилку оплати у failed', () => {
    assert.equal(normalizePaymentStatus('payment_failed'), 'failed');
    assert.equal(normalizePaymentStatus('canceled'), 'failed');
});

test('normalizePaymentStatus: безпечно переводить невідомий статус у failed', () => {
    assert.equal(normalizePaymentStatus('unknown_code'), 'failed');
    assert.equal(normalizePaymentStatus(''), 'failed');
    assert.equal(normalizePaymentStatus(undefined), 'failed');
});