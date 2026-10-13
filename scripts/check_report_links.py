"""Anonymous browser checks for the report's already inventoried public links."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

AUDIT = Path(__file__).resolve().parents[1] / 'docs/content-sync-2026-10-13'

async def main():
    urls = [row['url'] for row in json.loads((AUDIT/'external-links.json').read_text(encoding='utf-8'))]
    results = []
    limit = asyncio.Semaphore(3)
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='msedge', headless=True)
        async def check(url):
            async with limit:
                context = await browser.new_context()
                page = await context.new_page()
                row = {'url': url, 'access': 'fresh Edge browser context; no account cookies; normal TLS validation'}
                try:
                    response = await page.goto(url, wait_until='domcontentloaded', timeout=35000)
                    await page.locator('body').wait_for()
                    # Script-rendered dataset pages need their public title to arrive.
                    if 'kaggle.com' in url:
                        await page.locator('h1').first.wait_for(timeout=20000)
                    body = await page.locator('body').inner_text(timeout=10000)
                    row.update(status=response.status, final_url=page.url, title=await page.title(), visible_excerpt=body[:2500])
                    if response.status in (404,410):
                        row['result'] = 'confirmed-missing'
                    elif response.status in (401,403) or any(x in body.lower() for x in ('verify you are human','checking your browser','enable javascript and cookies to continue')):
                        row['result'] = 'access-blocked'
                    elif response.ok and len(body.strip())>100:
                        row['result'] = 'anonymous-page-accessible'
                    else:
                        row['result'] = 'unverified-response'
                except Exception as e:
                    row.update(result='network-or-render-failure-unverified', error=str(e))
                await context.close()
                results.append(row)
                print(row['result'], url, flush=True)
                (AUDIT/'external-browser-links.json').write_text(json.dumps(sorted(results,key=lambda x:x['url']),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        await asyncio.gather(*(check(url) for url in urls))
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
