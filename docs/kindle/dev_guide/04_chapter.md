# ЧАСТИНА 4: Пайплайн Збірки та Cloudflare Pages

Проєкт автоматизовано розгортається на платформі Cloudflare Pages через CLI `wrangler`:
1. Виконання pre-flight перевірок: `python3 -m unittest discover tests`.
2. Компіляція клієнтського бандлу: `npm run build` у `b-sdd-legal-ui/`.
3. Публікація артефактів:
   `CLOUDFLARE_ACCOUNT_ID='...' CLOUDFLARE_API_TOKEN='...' npx wrangler pages deploy dist/ --project-name='b-sdd-legal-ui' --branch=main`.

---
