# Decision log

## Decision 1: Централізація мапінгу статусів оплати у модулі Payments

**Problem:** У стартовому коді перетворення статусів Stripe дублювалося в кількох різних модулях (`Orders`, `Reports`, `Notifications`).

**Evidence:** `src/orders/createOrder.ts:28`, `src/reports/salesReport.ts:19`.

**Decision:** Створити єдину функцію `normalizePaymentStatus` у `src/payments/index.ts`, яка переводить відповіді провайдера у системні статуси (`paid`, `processing`, `failed`).

**Why:** Забезпечує Принцип приховання інформації (Information Hiding). Інші модулі більше не залежать від форматів чи назв статусів конкретного платіжного провайдера.

**Alternative:** Винести мапінг у спільний модуль `src/shared`.

**Why rejected:** Shared-код не повинен містити специфічної логіки окремих зовнішніх сервісів чи платіжних провайдерів.

**Trade-off:** З'являється проміжний крок нормалізації статусів у модулі `Payments`, зате повністю усувається дублювання у викликаючих модулях.

**Verification:** Нові unit-тести в `tests/paymentNormalization.test.ts` перевіряють нормалізацію для статусів `paid`, `processing`, `failed` та невідомих відповідей.