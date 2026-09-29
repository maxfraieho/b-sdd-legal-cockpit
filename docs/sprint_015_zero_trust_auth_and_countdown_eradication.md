# B-SDD LEGAL COCKPIT · ЗВІТ ЗАКРИТТЯ СПРИНТУ 015 (S00-AUTH REMEDIATION)
**Дата:** 29 вересня 2026 року  
**Стандарт:** B-SDD Methodology v1.3 (Правило T4) / Art. 73 CPP Suisse / ISO/IEC 27037  
**Цільовий реліз:** v2.7.2 (Commit `e01465a`)  
**Продакшн URL:** https://b-sdd-legal-ui.pages.dev/  

---

## 1. Ліквідація зворотного відліку строків оскарження (Правило T4 / Проблема №1)
* **Контекст інваріанта:** Згідно з правилом B-SDD T4, у судових та процесуальних інтерфейсах суворо заборонено використовувати динамічні таймери або відліки секунд/хвилин/годин до процесуальних строків, оскільки вони спотворюють юридичну дійсність і порушують вимоги офіційного обчислення процесуальних строків (ст. 89-91 КПК Швейцарії).
* **Виявлена невідповідність:** У компоненті `ProceduralWorkflowView.tsx` на 4-му етапі ("Clôture & 10-Day Appeal Countdown") зберігався зашитий таймер зворотного відліку: `08 ДНІВ : 14 ГОДИН : 32 ХВИЛИН`.
* **Вжиті заходи:**
  - Динамічний годинник видалено.
  - Встановлено нормативну статичну панель строку оскарження згідно зі ст. 396 al. 1 CPP (`manual entry — not computed`, `verified_by_lawyer`).
  - Проведено повний пошук по скомпільованому бандлу: рядки `Appeal Countdown` та `ДНІВ : ГОДИН : ХВИЛИН` відсутні на 100%.

---

## 2. Усунення мертвого циклу авторизації Google OAuth в Appwrite Cloud
* **Діагностика першопричини:**
  - Appwrite Cloud функціонує на домені `fra.cloud.appwrite.io`, тоді як фронтенд розгорнуто на `b-sdd-legal-ui.pages.dev`.
  - Попередній механізм авторизації викликав `account.createOAuth2Session`, який покладався на міждоменні cookies (`Set-Cookie` від `fra.cloud.appwrite.io`).
  - Сучасні браузери (Google Chrome, Apple Safari, Firefox) блокують сторонні сесійні cookies (Third-Party Cookie Deprecation & ITP).
  - У результаті після повернення з Google виклик `account.get()` не отримував cookie і повертав помилку `401 Unauthorized: User (role: guests) missing scopes (["account"])`.
  - Користувача перенаправляло на екран помилки або повертало назад на кнопку входу Google, унеможливлюючи доступ.
* **Архітектурне рішення:**
  - Метод входу в `src/lib/appwrite.ts` переведено з `createOAuth2Session` на `account.createOAuth2Token({ provider: OAuthProvider.Google, success, failure, scopes: ['email', 'profile', 'openid'] })`.
  - Appwrite передає параметри `userId` та `secret` безпосередньо у параметрах URL редіректу (`/auth/success?userId=...&secret=...`), минаючи будь-які обмеження на cookies.
  - У `src/pages/AuthSuccessPage.tsx` викликом `account.createSession({ userId, secret })` активується сесія, клієнт отримує токен і зчитує підтверджену адресу користувача.
  - Реалізовано подвійний захист: якщо `account.get()` не повертає email, виконується прямий запит до Google UserInfo API (`https://www.googleapis.com/oauth2/v2/userinfo`) за допомогою `session.providerAccessToken`.

---

## 3. Відновлення нульової довіри (Zero-Trust) та видалення обхідних кнопок
* **Принцип:** Судове досьє кримінальної справи (ст. 73 КПК) вимагає суворого дотримання таємниці слідства. Будь-які кнопки «прямого входу» чи «локального режиму» без авторизації є неприпустимими.
* **Реалізація:**
  - Усі тимчасові кнопки «Увійти за захищеним PIN-кодом (0523)» та «локальний режим» повністю видалено з `AuthGate.tsx`, `AuthPage.tsx` та `AuthFailurePage.tsx`.
  - Двоконтурний шлюз захисту працює у суворому режимі:
    1. Контур 1: Локальний захисний PIN `0523`.
    2. Контур 2: Google Identity Gate з обов'язковою верифікацією за `HARDENED_WHITELIST` (`tukroschu@gmail.com` — Super Administrator).

---

## 4. Результати верифікації та синхронізація з NotebookLM
* **Деплой:** Опубліковано та успішно верифіковано на **https://b-sdd-legal-ui.pages.dev/** (актуальні асети: `index-B1zw76Aq.js`, `index-Mb70cgFN.css`).
* **NotebookLM Синхронізація:** 
  - Проведено оновлення у записнику `B-SDD Legal: Swiss Advocate Cockpit & Evidence Architecture` (`c816473e-6fec-4689-90b7-98843f10bf91`).
  - Оновлено 4 модульних дампи вихідного коду (`backend`, `frontend-views`, `frontend-modals`, `frontend-core`).
  - Додано цей звіт Спринту 015.
