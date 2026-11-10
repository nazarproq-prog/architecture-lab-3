# Architecture review
| Principle | Evidence (file:line) | Practical risk | Fix |
| :--- | :--- | :--- | :--- |
| **Information Hiding & High Cohesion** | `src/orders/createOrder.ts:28`, `src/reports/salesReport.ts:19`, `src/notifications/sendReceipt.ts:15` | Мапінг сирих статусів Stripe (`succeeded`, `requires_action`, `payment_failed`) дублюється у трьох різних модулях. Додавання нового статусу або зміна провайдера вимагає синхронної правки всіх файлів. | Зібрати перетворення статусів провайдера в єдину функцію `normalizePaymentStatus` у модулі `Payments`, повертаючи лише стабільні статуси: `paid`, `processing`, `failed`. |
| **Explicit Contracts & Low Coupling** | `src/checkout/checkoutService.ts:12`, `src/orders/createOrder.ts:9` | Зовнішні модулі напряму імпортують внутрішній клієнт Stripe і формують його специфічний payload (`amount_cents`). Будь-яка зміна API Stripe зламає оформлення замовлення. | Створити провайдеро-незалежний публічний контракт у `src/payments/index.ts`, приховавши деталі Stripe у папці `internal`. |
| **Ownership** | `src/orders/createOrder.ts:41-52` | Модуль `Orders` сам читає і списує залишки товарів у циклі без захисту інваріанта залишків. | Передати захист залишків модулю `Inventory` через публічний метод резервування. |
| **Dependency Direction** | `src/payments/internal/stripeProcessor.ts:6` | Циклічна залежність `Orders <-> Payments`: `Orders` викликає `Payments`, а `Payments` лізе у сховище `Orders`. | Прибрати імпорт `orders/internal` із модуля `Payments`. `Payments` має лише повертати результат оплати. |
| **Local Reasoning** | `src/shared/calculateTotal.ts:8-34` | Функція читає глобальний `runtimeConfig` і мутує переданий масив прямо під час обчислення. | Передавати податки/знижки явно через аргументи функції та не мутувати вхідний масив. |

## Change impact prediction (заповнив до реалізації change request)

**Requirement:** Підтримка нового платіжного статусу `processing` та безпечна нормалізація невідомих статусів від провайдера.

**Expected files:** `src/payments/index.ts`, `tests/paymentNormalization.test.ts`, `DECISIONS.md`.

**Modules that should not change:** Модуль `Inventory` та функція `calculateTotal`.

## Actual impact (заповниві після реалізації)

**Actual files changed:** `src/payments/index.ts`, `tests/paymentNormalization.test.ts`, `DECISIONS.md`, `REVIEW.md`.

**Difference from prediction and explanation:** Відхилень немає. Зміни торкнулися лише модуля `Payments` та тестів нормалізації статусів.