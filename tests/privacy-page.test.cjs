const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const publicPages = [
  'index.html',
  'vtorichka/index.html',
  'novostroyki/index.html',
  'kommercia/index.html',
  'sanuzel/index.html',
  'demontazh/index.html',
  'ceny/index.html',
];

test('privacy page describes website lead data handling and contact route', () => {
  const page = fs.readFileSync(path.join(root, 'privacy/index.html'), 'utf8');

  assert.match(page, /Политика конфиденциальности/);
  assert.match(page, /имя/i);
  assert.match(page, /номер телефона/i);
  assert.match(page, /WhatsApp/i);
  assert.match(page, /TitovStroy/i);
});

test('every public landing page links to the privacy page', () => {
  for (const pagePath of publicPages) {
    const page = fs.readFileSync(path.join(root, pagePath), 'utf8');
    assert.match(
      page,
      /href="\/privacy\/"[^>]*>Политика конфиденциальности</,
      `${pagePath} must link to the privacy page`,
    );
  }
});

test('sitemap contains the canonical privacy page URL', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/titovstroy\.kz\/privacy\//);
});
