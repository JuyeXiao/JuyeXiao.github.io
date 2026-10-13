"""Browser acceptance for the content sync. Requires local server + Playwright/Edge.
Usage: python -B scripts/check_report_browser.py [page-key ...]
Screenshots stay outside the repository; JSON receipts are local delivery evidence.
"""
import json
import sys
import hashlib
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT/'docs/portfolio-presentation-2026-10-13'
IMAGES = Path('C:/Users/xjy19/.codex/visualizations/2026/10/13/01a132f8-9350-7cd1-9816-e09673a8a800/presentation')
BASE = 'http://127.0.0.1:8765/'

def run():
    IMAGES.mkdir(parents=True,exist_ok=True)
    entries=json.loads((AUDIT/'render-ledger.json').read_text(encoding='utf-8'))['pages']
    entries += [dict(path='index.html',key='home',language='zh'),dict(path='index-en.html',key='home',language='en')]
    layout_only = '--layout-refresh' in sys.argv[1:]
    keys = [x for x in sys.argv[1:] if x != '--layout-refresh']
    if keys: entries=[x for x in entries if x['key'] in keys]
    if layout_only:
        before = json.loads((AUDIT/'before-hashes.json').read_text(encoding='utf-8'))
        entries = [x for x in entries if hashlib.sha256((ROOT/x['path']).read_bytes()).hexdigest()!=before[x['path']]]
    receipts=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='msedge',headless=True)
        for item in entries:
            # Initialize once so actual language and theme switching can persist.
            context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce',color_scheme='light')
            context.add_init_script("if (!sessionStorage.getItem('sync-test-init')) { localStorage.setItem('language',"+json.dumps(item['language'])+"); localStorage.setItem('theme','light'); sessionStorage.setItem('sync-test-init','1'); }")
            page=context.new_page();page.set_default_timeout(12000)
            record={**item,'views':[],'interactions':{},'page_errors':[],'resource_failures':[]}
            page.on('pageerror',lambda e:record['page_errors'].append(str(e)))
            page.on('requestfailed',lambda r:record['resource_failures'].append({'url':r.url,'failure':r.failure}))
            try:
                response=page.goto(BASE+quote(item['path']),wait_until='networkidle',timeout=45000)
                assert response.status==200,response.status
                assert unquote(urlsplit(page.url).path).lstrip('/')==item['path'],page.url
                page.evaluate('document.fonts.ready')
                for width in (1440,390):
                    page.set_viewport_size({'width':width,'height':1000 if width==1440 else 844})
                    for theme in ('light','dark'):
                        dark=page.locator('html').evaluate("e=>e.classList.contains('dark')")
                        if dark!=(theme=='dark'):page.locator('#theme-toggle').click()
                        assert page.locator('html').evaluate("e=>e.classList.contains('dark')")==(theme=='dark')
                        page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
                        prefix=f"{item['key']}-{item['language']}-{width}-{theme}"
                        page.screenshot(path=str(IMAGES/f'{prefix}-hero.png'))
                        layout=page.evaluate('''() => ({viewport:innerWidth, scrollWidth:document.documentElement.scrollWidth,
                          overflow:[...document.querySelectorAll('h1,h2,h3,p,figure,.hero-stat,.report-equation,.report-table-wrap')].filter(e=>{
                           const r=e.getBoundingClientRect();return r.width>0 && (r.left < -1 || r.right > innerWidth+1) && !e.closest('dialog,.report-table-wrap');
                          }).map(e=>({tag:e.tagName,text:e.textContent.slice(0,90)}))})''')
                        assert layout['scrollWidth']<=width+1,layout
                        assert not layout['overflow'],layout
                        view={'width':width,'theme':theme,'layout':layout,'hero_screenshot':str(IMAGES/f'{prefix}-hero.png')}
                        if layout_only:
                            equations=page.locator('.report-equation')
                            for n in range(equations.count()):
                                equations.nth(n).scroll_into_view_if_needed()
                                assert equations.nth(n).locator('math').evaluate('e=>e.getBoundingClientRect().height>0')
                                page.screenshot(path=str(IMAGES/f'{prefix}-equation-{n+1}.png'))
                            page.locator('#projects' if item['key']=='home' else '#related').scroll_into_view_if_needed()
                            page.screenshot(path=str(IMAGES/f'{prefix}-updated-cards.png'))
                            view['equations_checked']=equations.count()
                            record['views'].append(view)
                            continue
                        if item['key']!='home':
                            toc=page.locator('.toc-link')
                            # Click a real TOC link, including a late section; check final position.
                            last=toc.last
                            target=last.get_attribute('href')
                            last.click()
                            offset=page.locator(target).evaluate('e=>e.getBoundingClientRect().top')
                            assert abs(offset-96)<3,('toc',offset,target)
                            view['toc_target']=target;view['toc_offset']=offset
                            table=page.locator('.report-table-wrap').first
                            if table.count():
                                table.scroll_into_view_if_needed()
                                table.evaluate('e=>e.scrollLeft=e.scrollWidth')
                                view['table_scroll']=table.evaluate('e=>({left:e.scrollLeft,width:e.clientWidth,total:e.scrollWidth})')
                                table.evaluate('e=>e.scrollLeft=0')
                                page.screenshot(path=str(IMAGES/f'{prefix}-body.png'))
                                view['body_screenshot']=str(IMAGES/f'{prefix}-body.png')
                            figures=page.locator('.figure-zoom')
                            # Figure files and bindings are unchanged; check the viewer once per view.
                            to_check=min(1,figures.count())
                            opened=0
                            for n in range(to_check):
                                trigger=figures.nth(n)
                                trigger.scroll_into_view_if_needed()
                                page.wait_for_function('(n)=>{const i=document.querySelectorAll(".figure-zoom img")[n];return i.complete&&i.naturalWidth>0}',arg=n)
                                before=page.evaluate('scrollY')
                                trigger.click()
                                dialog=page.locator('.figure-viewer')
                                assert dialog.is_visible()
                                page.wait_for_function('()=>{const i=document.querySelector(".figure-viewer img");return i.complete&&i.naturalWidth>0}')
                                fit=dialog.locator('img').evaluate('e=>{const r=e.getBoundingClientRect(),c=e.parentElement.getBoundingClientRect();return {width:r.width,height:r.height,cw:c.width,ch:c.height}}')
                                assert fit['width']<=fit['cw']+1 and fit['height']<=fit['ch']+1,fit
                                if n==0:
                                    page.screenshot(path=str(IMAGES/f'{prefix}-figure.png'))
                                    dialog.locator('[data-size]').click()
                                    assert 'is-original' in dialog.get_attribute('class')
                                    canvas=dialog.locator('.figure-viewer__canvas')
                                    canvas.evaluate('e=>{e.scrollLeft=e.scrollWidth;e.scrollTop=e.scrollHeight}')
                                    view['original_scroll']=canvas.evaluate('e=>({x:e.scrollLeft,y:e.scrollTop,width:e.clientWidth,totalWidth:e.scrollWidth})')
                                    dialog.locator('[data-size]').click()
                                if theme=='dark':dialog.locator('[data-close]').click()
                                else:page.keyboard.press('Escape')
                                assert not dialog.is_visible()
                                assert abs(page.evaluate('scrollY')-before)<3,('reading-position',before,page.evaluate('scrollY'))
                                assert trigger.evaluate('e=>e===document.activeElement')
                                opened+=1
                            view['figures_opened']=opened
                            if figures.count():
                                figures.first.focus();page.keyboard.press('Enter')
                                assert page.locator('.figure-viewer').is_visible()
                                page.keyboard.press('Escape')
                                view['keyboard_open_close']=True
                        else:
                            assert page.locator('#projects .bento-item').count()==8
                            page.locator('#projects').scroll_into_view_if_needed()
                            page.screenshot(path=str(IMAGES/f'{prefix}-projects.png'))
                        record['views'].append(view)
                if layout_only:
                    assert not record['page_errors'],record['page_errors']
                    record['status']='pass'
                    receipts.append(record)
                    print(item['key'],item['language'],'layout-refresh pass',flush=True)
                    context.close()
                    (AUDIT/'browser-layout-refresh.json').write_text(json.dumps({'browser':browser.version,'pages':receipts},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
                    continue
                # Click language switch both ways, with persistence enabled.
                original=item['path']
                mirror=original.replace('-en.html','.html') if item['language']=='en' else original.replace('.html','-en.html')
                page.locator('#lang-toggle').click();page.wait_for_url('**/'+quote(mirror),wait_until='domcontentloaded')
                assert unquote(urlsplit(page.url).path).lstrip('/')==mirror
                page.locator('#lang-toggle').click();page.wait_for_url('**/'+quote(original),wait_until='domcontentloaded')
                record['interactions']['language_round_trip']=True
                if item['key']!='home':
                    series=page.locator('.report-series__link:not(.is-current)').first
                    if series.count():
                        dest=series.get_attribute('href');series.click();page.wait_for_load_state('domcontentloaded')
                        assert page.locator('h1').count()==1
                        page.go_back(wait_until='domcontentloaded');record['interactions']['series_navigation']=dest
                    related=page.locator('.related-project-card').first
                    dest=related.get_attribute('href');related.click();page.wait_for_load_state('domcontentloaded')
                    assert page.locator('h1').count()==1
                    page.go_back(wait_until='domcontentloaded');record['interactions']['related_navigation']=dest
                    page.locator('.navbar-logo').click();page.wait_for_load_state('domcontentloaded')
                    expected='index.html' if item['language']=='zh' else 'index-en.html'
                    assert unquote(urlsplit(page.url).path)=='/'+expected,page.url
                    record['interactions']['logo_return']=True
                else:
                    page.locator('#menu-toggle').click()
                    assert page.locator('#menu-toggle').get_attribute('aria-expanded')=='true'
                    page.locator('#mobile-menu a[href="#projects"]').click()
                    record['interactions']['mobile_menu']=True
                assert not record['page_errors'],record['page_errors']
                assert not [r for r in record['resource_failures'] if r['url'].startswith(BASE) and r['failure']!='net::ERR_ABORTED'],record['resource_failures']
                record['status']='pass'
            except Exception as e:
                record['status']='fail';record['failure']=str(e)
                try:page.screenshot(path=str(IMAGES/f"{item['key']}-{item['language']}-failure.png"))
                except Exception:pass
            receipts.append(record)
            print(item['key'],item['language'],record['status'],record.get('failure',''),flush=True)
            context.close()
            # Keep completed receipts if a later page is interrupted.
            suffix='-'+'-'.join(sys.argv[1:]) if sys.argv[1:] else ''
            (AUDIT/f'browser-validation{suffix}.json').write_text(json.dumps({'browser':browser.version,'pages':receipts},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        browser.close()
    return any(x['status']!='pass' for x in receipts)

if __name__=='__main__':sys.exit(run())
