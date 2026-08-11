# Privacy Policy Page Design

## Purpose

Provide the public privacy-policy URL required to publish the TitovStroy Meta Marketing API application, while accurately describing the existing website lead flow.

## Scope

- Add a standalone, indexable static page at `/privacy/`.
- Describe collection of a visitor's name, telephone number, quiz answers, and technical analytics data.
- Disclose the existing CRM destination (Bitrix24), Yandex.Metrica, and Meta Pixel.
- Add a footer link from each of the seven public pages and a sitemap entry.

## Non-goals

- Do not alter form validation, lead payloads, Bitrix integration, tracking events, or advertising settings.
- Do not introduce cookies, consent-management software, or new third-party services.

## Design

The policy uses a small self-contained dark page consistent with TitovStroy's public-site palette. It gives visitors a plain-language description of data collection, purposes, recipients, retention, and contact options. A footer link uses the canonical trailing-slash URL `/privacy/`, matching the sitemap and the URL to provide to Meta.

## Verification

Node tests assert the public page's essential privacy disclosures, a footer link on each landing page, and the sitemap's canonical URL. Existing website lead tests remain unchanged and must continue to pass.
