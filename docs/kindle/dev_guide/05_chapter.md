# ЧАСТИНА 5: Автономний Компілятор EPUB 3.0

Скрипт `scripts/generate_legal_book.py` реалізує пряму генерацію книг стандарту EPUB 3.0 без застосування Calibre чи Pandoc:
- Генерує структуру `mimetype`, `META-INF/container.xml`, `OEBPS/content.opf`, `OEBPS/nav.xhtml`.
- Конвертує Markdown-файли у семантичний валідний XHTML.
- Забезпечує коректне відображення на читалках Kindle Paperwhite та сумісність із сервісом Amazon Whispersync.

---
