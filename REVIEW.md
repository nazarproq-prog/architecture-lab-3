# Architecture Review (До початку рефакторингу)

**Виконали:** Поліщук Назар, Приходько Артем (група ІПЗ-21)  
**Заявлений рівень:** 60 балів

## 1. Знайдені порушення принципів системного дизайну

| Principle | Evidence (file:line) | Practical risk | Fix direction |
| :--- | :--- | :--- | :--- |
| **Information Hiding & High Cohesion** | `src/orders/createOrder.ts:28`, `src/reports/salesReport.ts:19`, `src/notifications/sendReceipt.ts:15` | Мапінг сирих статусів Stripe (`succeeded`, `requires_action`, `payment_failed`) дублюється у трьох різних модулях. Додавання статусу `processing` або зміна провайдера вимагає синхронної правки всіх трьох файлів, інакше звітність і сповіщення розійдуться зі станом замовлення. | Зібрати перетворення статусів провайдера в одному місці в модулі `Payments` (`normalizePaymentStatus`), щоб назовні повертався лише стабільний статус: `paid`, `processing`, `failed`. |
| **Explicit Contracts & Low Coupling** | `src/checkout/checkoutService.ts:12`, `src/orders/createOrder.ts:9` (імпорт `src/payments/internal/stripeClient.ts`) | Зовнішні модулі напряму імпортують внутрішній клієнт Stripe і формують його специфічний payload (`amount_cents`). Будь-яка зміна API Stripe зламає код оформлення замовлення. | Створити провайдеро-незалежний публічний контракт у `src/payments/index.ts`, приховавши деталі Stripe в `internal`. |
| **Ownership** | `src/orders/createOrder.ts:41-52` (прямий запис у `src/inventory/internal/stockStorage.ts`) | Модуль `Orders` сам читає і списує залишки товарів у циклі. Якщо другого товару в кошику не вистачає, перший вже залишається списаним (часткова мутація), а правило `available >= 0` ніким централізовано не захищене. | Передати захист інваріанта залишків модулю `Inventory` через публічний метод резервування. |
| **Dependency Direction** | `src/payments/internal/stripeProcessor.ts:6` імпортує `src/orders/internal/orderStore.ts` | Виникає циклічна залежність `Orders <-> Payments`: `Orders` викликає `Payments`, а `Payments` лізе у внутрішнє сховище `Orders`. Модулі неможливо тестувати і змінювати ізольовано. | Прибрати імпорт `orders/internal` із модуля `Payments`. `Payments` має лише повертати нормалізований результат оплати. |
| **Local Reasoning** | `src/shared/calculateTotal.ts:8-34` | Функція читає глобальний `runtimeConfig`, мутує переданий масив `cartLines` і записує `auditLog` прямо під час обчислення. Результат залежить від прихованого глобального стану, а вхідні дані змінюються. | Передавати податки і знижки явно через аргументи функції, не мутувати вхідний масив і винести логування на рівень оркестрації. |

## 2. Прогноз змін до рефакторингу (Prediction)

* **Які файли мають змінитися для change request:** файли модуля `src/payments` (додавання єдиної функції нормалізації статусів та підтримки `processing`), а також місця мапінгу статусів у `src/orders`, `src/reports` та `src/notifications`, щоб перевести їх на нормалізований статус. Додадуться unit-тести у папці `test/`.
* **Які модулі не повинні змінюватися:** модуль `Inventory` (робота зі складом) та функція розрахунку вартості `calculateTotal` не стосуються зміни платіжних статусів та провайдера оплати, тому змінюватися не повинні.
