# Privacy Policy Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a stable TitovStroy privacy-policy URL that Meta can validate before the Marketing API application is made live.

**Architecture:** Add one standalone static page at `/privacy/` that documents the website lead form's collection and use of name, phone, quiz answers, and anti-spam data. Add a consistent footer link to the policy from every public landing page, without changing lead submission behavior.

**Tech Stack:** Static HTML, existing site CSS conventions, Node.js test runner.

## Global Constraints

- Policy URL must be `https://titovstroy.kz/privacy/` after deployment.
- Do not change `/api/lead`, form payloads, analytics events, or CRM integration.
- Add the footer link to all seven public pages: root, vtorichka, novostroyki, kommercia, sanuzel, demontazh, and ceny.
- Policy copy must accurately describe only data that the site currently collects and forwards.

---

### Task 1: Create the policy document

**Files:**
- Create: `privacy/index.html`
- Test: `tests/privacy-page.test.cjs`

**Interfaces:**
- Consumes: public website URL and the existing lead payload fields (`name`, `tel`, `answers`, `website`).
- Produces: a public, static `/privacy/` page with a page title and required privacy disclosures.

- [ ] **Step 1: Write the failing test**

```js
test('privacy page states what lead data is collected and how to contact TitovStroy', () => {
  const page = fs.readFileSync(path.join(root, 'privacy/index.html'), 'utf8');
  assert.match(page, /Политика конфиденциальности/);
  assert.match(page, /имя/i);
  assert.match(page, /номер телефона/i);
  assert.match(page, /WhatsApp/i);
  assert.match(page, /ТОО|TitovStroy/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/privacy-page.test.cjs`

Expected: FAIL because `privacy/index.html` does not exist.

- [ ] **Step 3: Write the minimal implementation**

```html
<main>
  <h1>Политика конфиденциальности</h1>
  <p>Мы обрабатываем имя, номер телефона и ответы формы только для ответа на заявку и расчёта ремонта.</p>
  <p>Для вопросов об обработке данных напишите в WhatsApp или позвоните по номеру, указанному на сайте.</p>
</main>
```

Include an effective date, the TitovStroy business name, a back link to the home page, and a responsive style consistent with the site’s dark footer palette.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/privacy-page.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add privacy/index.html tests/privacy-page.test.cjs
git commit -m "feat: add privacy policy page"
```

### Task 2: Make the policy discoverable from every landing page

**Files:**
- Modify: `index.html`
- Modify: `vtorichka/index.html`
- Modify: `novostroyki/index.html`
- Modify: `kommercia/index.html`
- Modify: `sanuzel/index.html`
- Modify: `demontazh/index.html`
- Modify: `ceny/index.html`
- Modify: `sitemap.xml`
- Test: `tests/privacy-page.test.cjs`

**Interfaces:**
- Consumes: the existing `.ft` footer navigation markup.
- Produces: one accessible `Политика конфиденциальности` link to `/privacy/` on every public page and a sitemap entry.

- [ ] **Step 1: Write the failing test**

```js
for (const page of publicPages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.match(html, /href="\/privacy\/"[^>]*>Политика конфиденциальности</);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/privacy-page.test.cjs`

Expected: FAIL because no public page links to `/privacy/`.

- [ ] **Step 3: Write the minimal implementation**

```html
<a href="/privacy/">Политика конфиденциальности</a>
```

Place the link in the existing footer navigation after `Цены` and add `https://titovstroy.kz/privacy/` to `sitemap.xml`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/privacy-page.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html vtorichka/index.html novostroyki/index.html kommercia/index.html sanuzel/index.html demontazh/index.html ceny/index.html sitemap.xml tests/privacy-page.test.cjs
git commit -m "feat: link privacy policy sitewide"
```

### Task 3: Verify the deployment-ready result

**Files:**
- Verify: `privacy/index.html`
- Verify: `tests/privacy-page.test.cjs`

**Interfaces:**
- Consumes: the completed static page and footer links.
- Produces: verified content suitable for Meta’s “Privacy Policy URL” requirement.

- [ ] **Step 1: Run the focused regression test**

Run: `node --test tests/privacy-page.test.cjs`

Expected: PASS.

- [ ] **Step 2: Run the existing full test suite**

Run: `node --test tests/*.test.cjs`

Expected: PASS with no failures.

- [ ] **Step 3: Verify HTML references manually**

Run: `rg -n 'href="/privacy/"|https://titovstroy.kz/privacy/' index.html vtorichka/index.html novostroyki/index.html kommercia/index.html sanuzel/index.html demontazh/index.html ceny/index.html sitemap.xml`

Expected: seven footer links and one sitemap URL.

- [ ] **Step 4: Commit verification-safe changes if any remain**

```bash
git status --short
```

Expected: clean working tree after the two implementation commits.
