"""Synchronize the explicitly selected formal reports; never execute analysis.

Usage: python scripts/sync_reports.py inventory|render|verify
Python dependencies for this maintenance script: markdown-it-py, beautifulsoup4, Pillow.
The published website remains plain HTML/CSS/JavaScript with no build requirement.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys
import html
import os
import shutil
from urllib.parse import unquote, urlsplit
from collections import Counter

from bs4 import BeautifulSoup
from markdown_it import MarkdownIt
from PIL import Image

MD = MarkdownIt('commonmark', {'html': True}).enable('table')

ROOT = Path(__file__).resolve().parents[1]
DATA = Path('D:/data projects')
CAP = Path('D:/S&P global climate consulting solution')
SOURCE_AUDIT = ROOT / 'docs/content-sync-2026-10-13'
AUDIT = ROOT / 'docs/portfolio-presentation-2026-10-13'

# Stable page identity, source directory, formal report basename, website route.
DATA_PAGES = [
    ('bank', 'Bank Customer Churn Prediction', 'Bank_Customer_Churn_Prediction_Report', 'Bank Customer Churn Prediction/Bank Customer Churn Prediction'),
    ('fraud', 'fraud detection', 'Fraud_Detection_Report', 'e-commerce fraud detection/e-commerce fraud detection'),
    ('loan', 'LendingClub loan prediction', 'LendingClub_Loan_Prediction_Report', 'lendingclub loan prediction/lendingclub loan prediction'),
    ('youtube', 'youtube comment analysis', 'YouTube_Comments_Analysis_Report', 'youtube comment analysis/youtube comment analysis'),
    ('ab', 'AB testing', 'AB_Testing_Cookie_Cats_Report', 'ab testing/ab testing'),
    ('healthy', 'Healthy Home Prediction & Map Visualization', 'Healthy_Home_Prediction_Report', 'healthy home/healthy home'),
    ('amazon', 'amazon user review - Document Clustering and Topic Modeling', 'Amazon_Watch_Reviews_Report', 'amazon watch reviews/amazon watch reviews'),
    ('loan-full', 'LendingClub loan prediction/All Lending Club loan data', 'LendingClub_Full_Data_Loan_Prediction_Report', 'lendingclub loan prediction/full data'),
]
CAP_PAGES = [
    ('climate', ['05_synthesis'], 'spglobal climate comparison'),
    ('comparison', ['01_comparison'], 'model comparison'),
    ('long-series', ['02_long_series'], 'long series'),
    ('projection', ['03_projection', '04_econ_overlay'], 'projection overlay'),
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], encoding='utf-8').strip()

def pages():
    result = []
    for lang in ('zh', 'en'):
        suffix = '_zh' if lang == 'zh' else ''
        mirror = '' if lang == 'zh' else '-en'
        for key, directory, basename, target in DATA_PAGES:
            result.append(dict(key=key, lang=lang, sources=[DATA / directory / f'{basename}{suffix}.md'], target=ROOT / f'projects/{target}{mirror}.html'))
        for key, dirs, target in CAP_PAGES:
            result.append(dict(key=key, lang=lang, sources=[CAP / f'reports/{d}/REPORT{suffix}.md' for d in dirs], target=ROOT / f'projects/spglobal climate comparison/{target}{mirror}.html'))
    return result

def inventory():
    AUDIT.mkdir(parents=True, exist_ok=True)
    out = dict(date='2026-10-13', repositories=[dict(path=str(p), head=git(p, 'rev-parse', 'HEAD'), status=git(p, 'status', '--porcelain')) for p in (ROOT, DATA, CAP)], protected={str(p.relative_to(ROOT)):sha(p) for p in [ROOT/'AGENTS.md', *sorted((ROOT/'.frontend-dispatch').rglob('*'))] if p.is_file()}, pages=[])
    for page in pages():
        item = dict(key=page['key'], language=page['lang'], target=page['target'].relative_to(ROOT).as_posix(), sources=[])
        for src in page['sources']:
            content = src.read_text(encoding='utf-8-sig')
            figures = []
            for alt, ref in re.findall(r'!\[([^\]]*)\]\(([^\n]+)\)', content):
                image = (src.parent / ref).resolve()
                figures.append(dict(alt=alt, reference=ref, source=str(image), sha256=sha(image)))
            item['sources'].append(dict(path=str(src), sha256=sha(src), title=content.splitlines()[0], headings=re.findall(r'^## (.+)$', content, re.M), figures=figures))
        out['pages'].append(item)
    (AUDIT/'source-manifest.json').write_text(json.dumps(out, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(dict(pages=len(out['pages']), reports=sum(len(p['sources']) for p in out['pages']), figure_references=sum(len(s['figures']) for p in out['pages'] for s in p['sources'])), indent=2))

def relative(path, parent):
    return Path(os.path.relpath(path, parent)).as_posix()

def sections(text):
    parts = re.split(r'^## (.+)\n', text, flags=re.M)
    title, _, intro = parts[0].partition('\n')
    return title.removeprefix('# ').strip(), intro.strip(), [(parts[i], parts[i+1].strip()) for i in range(1, len(parts), 2)]

def plain(node):
    # Serialize/reparse so adjacent text nodes created by link adaptation behave
    # exactly as they do in the saved HTML, without inventing word boundaries.
    copy = BeautifulSoup(str(node), 'html.parser')
    for caption in copy.select('.generated-alt-caption, .generated-table-label'):
        caption.decompose()
    return re.sub(r'\s+', ' ', copy.get_text(' ', strip=True)).strip()

def render():
    baseline = json.loads((SOURCE_AUDIT/'source-manifest.json').read_text(encoding='utf-8'))
    for p in baseline['pages']:
        for s in p['sources']:
            assert sha(Path(s['path'])) == s['sha256'], s['path']
    summaries = json.loads((ROOT/'scripts/report_summaries.json').read_text(encoding='utf-8'))
    presentation = json.loads((ROOT/'scripts/report_presentation.json').read_text(encoding='utf-8'))
    catalog = {(p['key'], p['lang']):p for p in pages()}
    sources_to_pages = {s.resolve(): p for p in pages() for s in p['sources']}
    audit = dict(adaptations=[], blocks=[], figures=[], pages=[])
    headers = {}
    for lang in ('zh', 'en'):
        home = ROOT / ('index.html' if lang == 'zh' else 'index-en.html')
        header = BeautifulSoup(home.read_text(encoding='utf-8'), 'html.parser').find('header')
        for link in header.select('a[href]'):
            href = link['href']
            link['href'] = '../../' + home.name + href if href.startswith('#') else '../../' + href
        headers[lang] = str(header)

    def change(page, kind, before, after, source):
        audit['adaptations'].append(dict(page=page['target'].relative_to(ROOT).as_posix(), source=str(source), kind=kind, before=before, after=after))

    def content(md_text, source, page, block_id):
        if page['key']=='loan-full':
            # Current sample CSV has 30 columns, verified against its header.
            before=md_text
            md_text=md_text.replace('FICO不在父项目29列中','FICO不在当前样本项目的30列中')
            md_text=md_text.replace("FICO is absent from the parent's 29 columns", "FICO is absent from the current sample project's 30 columns")
            md_text=md_text.replace('FICO is absent from the parent’s 29 columns', 'FICO is absent from the current sample project’s 30 columns')
            if before!=md_text: change(page,'current-csv-column-count',before,md_text,source)
        soup = BeautifulSoup(MD.render(md_text), 'html.parser')
        for link in list(soup.select('a[href]')):
            href = link['href']
            if href.startswith(('https://', 'http://', 'mailto:', '#')):
                continue
            local = (source.parent / unquote(urlsplit(href).path)).resolve()
            dest = sources_to_pages.get(local)
            if page['key'] == 'loan-full' and unquote(href) == '../README.md':
                dest = catalog[('loan', page['lang'])]
            if dest:
                adapted = relative(dest['target'], page['target'].parent)
                if dest['key'] == 'projection':
                    adapted += '#report-section-1' if '03_projection' in str(local) else '#report-section-9'
                link['href'] = adapted
                change(page, 'public-report-link', href, adapted, source)
            else:
                raise AssertionError(f'Add a presentation edit for internal reference: {source}: {href}')
        expected = plain(soup)
        # Preserve every figure byte-for-byte; source-relative subdirectories avoid collisions.
        for img in list(soup.find_all('img')):
            source_image = (source.parent / unquote(img['src'])).resolve()
            ref = unquote(img['src'])
            if source.is_relative_to(CAP):
                target_rel = 'figures/' + source_image.relative_to(CAP/'reanalysis/figures').as_posix()
            elif page['key'] == 'loan-full':
                target_rel = 'figures/full-data/' + source_image.relative_to(source.parent/'figures').as_posix()
            else:
                target_rel = ref
            target = page['target'].parent / target_rel
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists() or sha(target) != sha(source_image):
                shutil.copyfile(source_image, target)
            with Image.open(source_image) as image:
                width, height = image.size
            img['src'] = target_rel
            img['width'], img['height'] = str(width), str(height)
            img['loading'], img['decoding'] = 'lazy', 'async'
            parent = img.parent
            figure = soup.new_tag('figure', attrs={'class':'figure-editorial'})
            button = soup.new_tag('button', attrs={'type':'button', 'class':'figure-zoom', 'aria-haspopup':'dialog', 'aria-label':('放大图片：' if page['lang']=='zh' else 'Enlarge figure: ') + img.get('alt','')})
            img.replace_with(figure); button.append(img); figure.append(button)
            if parent.name == 'p' and not parent.get_text(strip=True):
                parent.unwrap()
            audit['figures'].append(dict(page=page['target'].relative_to(ROOT).as_posix(), source=str(source_image), target=target.relative_to(ROOT).as_posix(), sha256=sha(source_image), alt=img.get('alt','')))
        # Captions remain source text; only change their semantic container.
        for fig in soup.find_all('figure'):
            next_el = fig.find_next_sibling()
            if next_el and next_el.name == 'p' and (next_el.find('em', recursive=False) or re.match(r'^(图\s*\d|Figure\s*\d|Fig\.\s*\d)', next_el.get_text())):
                next_el.name = 'figcaption'; fig.append(next_el.extract())
            else:
                caption=soup.new_tag('figcaption', attrs={'class':'generated-alt-caption'})
                caption.string=fig.find('img').get('alt','')
                fig.append(caption)
        for table in soup.find_all('table'):
            table['class'] = 'report-table'
            headers = table.select('thead th')
            if len(headers) == 2 and all(not th.get_text(strip=True) for th in headers):
                labels = ('指标', '数值') if page['lang'] == 'zh' else ('Metric', 'Value')
                for th, label in zip(headers, labels):
                    span = soup.new_tag('span', attrs={'class': 'generated-table-label'})
                    span.string = label
                    th.append(span)
            for th in headers: th['scope'] = 'col'
            table.wrap(soup.new_tag('div',attrs={'class':'report-table-wrap','tabindex':'0','role':'region','aria-label':'数据表（可横向滚动）' if page['lang']=='zh' else 'Data table (scroll horizontally)'}))
        for math in soup.find_all('math'):
            parent = math.parent
            math.wrap(soup.new_tag('div', attrs={'class':'report-equation'}))
            if parent.name == 'p' and len(parent.find_all(recursive=False)) == 1:
                parent.unwrap()
        assert plain(soup) == expected, (source, block_id, 'rendered text changed')
        audit['blocks'].append(dict(page=page['target'].relative_to(ROOT).as_posix(), id=block_id, source=str(source), source_markdown_sha256=hashlib.sha256(md_text.encode()).hexdigest(), expected_text=expected))
        return f'<div class="report-block" id="{block_id}">\n{soup}\n</div>'

    for page in pages():
        lang, key = page['lang'], page['key']
        cfg = summaries[key][lang]
        edits = presentation.get(key, {}).get(lang, [])
        applied = set()
        data = []
        for source in page['sources']:
            text = source.read_text(encoding='utf-8-sig')
            for n, edit in enumerate(edits):
                if edit['before'] in text:
                    assert text.count(edit['before']) == 1, (source, edit['before'])
                    text = text.replace(edit['before'], edit['after'])
                    applied.add(n)
                    change(page, 'portfolio-presentation', edit['before'], edit['after'], source)
            data.append(sections(text))
        assert len(applied) == len(edits), (key, lang, 'stale presentation edit', set(range(len(edits))) - applied)
        title = cfg['title'] if key == 'projection' else data[0][0]
        chunks = []
        for n,(source,parsed) in enumerate(zip(page['sources'],data)):
            if parsed[1]: chunks.append(content(parsed[1],source,page,f'report-intro-{n+1}'))
        groups = []
        if key != 'projection':
            groups = [(heading, [(page['sources'][0],text)]) for heading,text in data[0][2]]
        else:
            # Follow the current source site's projection-then-exposure reading order,
            # while retaining unique paragraphs omitted by its coarse section skips.
            schedule = [[(0,1),(1,1)],[(0,2)],[(0,3)],[(0,4),(1,3),(1,4)],[(0,5),(1,6)],[(0,7),(1,9)],[(0,8)],[(0,9)],[(1,2)],[(1,5)],[(0,6),(1,7)],[(1,8)],[(1,10)]]
            number_map = {(part,n):i+1 for i,items in enumerate(schedule) for part,n in items}
            for i,items in enumerate(schedule):
                heading = data[items[0][0]][2][items[0][1]-1][0]
                if i==0: heading = '情景与暴露评估摘要' if lang=='zh' else 'Scenario and exposure assessment summary'
                heading = f'{i+1}. ' + re.sub(r'^\d+\.\s*','',heading)
                blocks, seen = [], set()
                for part,n in items:
                    source=page['sources'][part]
                    text=data[part][2][n-1][1]
                    pattern=r'第\s*(\d+)\s*节' if lang=='zh' else r'(?i)Section\s+(\d+)'
                    adapted=re.sub(pattern,lambda m: (f'第 {number_map[(part,int(m[1]))]} 节' if lang=='zh' else f'Section {number_map[(part,int(m[1]))]}'),text)
                    if adapted!=text: change(page,'merged-cross-reference',text,adapted,source)
                    unique=[]
                    for block in re.split(r'\n\s*\n', adapted):
                        normalized=re.sub(r'\s+',' ',block).strip()
                        if normalized in seen:
                            change(page,'merged-identical-block',block,'Retained once in this merged section.',source)
                        else:
                            unique.append(block); seen.add(normalized)
                    if unique: blocks.append((source,'\n\n'.join(unique)))
                groups.append((heading,blocks))
            change(page,'merged-section-map','03_projection + 04_econ_overlay',str(number_map),page['sources'][0])
        toc=[]
        for i,(heading,blocks) in enumerate(groups,1):
            sid=f'report-section-{i}'
            toc.append(f'<li><a class="toc-link" href="#{sid}">{html.escape(heading)}</a></li>')
            inside='\n'.join(content(text,src,page,f'report-{i}-{j}') for j,(src,text) in enumerate(blocks,1))
            chunks.append(f'<section id="{sid}" class="section-padding section--editorial" data-section-num="{i:02}"><div class="section-header"><h2 class="section-title">{html.escape(heading)}</h2></div>{inside}</section>')
        related_keys = {'loan':['loan-full','bank'], 'loan-full':['loan','fraud'], 'bank':['loan','ab'], 'fraud':['loan','ab'], 'youtube':['amazon','ab'], 'ab':['bank','youtube'], 'healthy':['climate','comparison'], 'amazon':['youtube','ab']}.get(key, ['healthy','loan'])
        series_keys = ['climate','comparison','long-series','projection'] if key in ('climate','comparison','long-series','projection') else (['loan','loan-full'] if key in ('loan','loan-full') else [])
        def readlink(k,cls):
            dest=catalog[(k,lang)]['target']; c=summaries[k][lang]
            return f'<a class="{cls}" href="{html.escape(relative(dest,page["target"].parent),quote=True)}">{html.escape(c["title"])}</a>'
        series = '<nav class="report-series" aria-label="'+('系列阅读' if lang=='zh' else 'Series navigation')+'">'+''.join(readlink(k,'report-series__link'+(' is-current' if k==key else '')) for k in series_keys)+'</nav>' if series_keys else ''
        related=''.join(f'<a href="{html.escape(relative(catalog[(k,lang)]["target"],page["target"].parent),quote=True)}" class="related-project-card"><h3 class="related-project-title">{html.escape(summaries[k][lang]["title"])}</h3><p class="related-project-description">{html.escape(summaries[k][lang]["description"])}</p><span class="related-project-link">'+('查看详情' if lang=='zh' else 'Read case')+'</span></a>' for k in related_keys)
        stats=''.join(f'<div class="hero-stat"><div class="hero-stat__num">{html.escape(n)}</div><div class="hero-stat__label">{html.escape(label)}</div></div>' for n,label in cfg['stats'])
        home='index.html' if lang=='zh' else 'index-en.html'
        report_name=page['target'].relative_to(ROOT).as_posix()
        url='https://juyexiao.github.io/'+report_name.replace(' ','%20')
        structured=json.dumps({'@context':'https://schema.org','@type':'Article','headline':title,'description':cfg['description'],'inLanguage':'zh-CN' if lang=='zh' else 'en','author':{'@type':'Person','name':'Juye Xiao'}},ensure_ascii=False).replace('</','<\\/')
        document=f'''<!DOCTYPE html>
<html lang="{'zh-CN' if lang=='zh' else 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add('js');</script>
  <title>{html.escape(title)} - {'数据诗学' if lang=='zh' else 'Data Poetics'}</title>
  <meta name="description" content="{html.escape(cfg['description'],quote=True)}">
  <meta property="og:title" content="{html.escape(title,quote=True)}">
  <meta property="og:description" content="{html.escape(cfg['description'],quote=True)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:description" content="{html.escape(cfg['description'],quote=True)}">
  <link rel="canonical" href="{url}">
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../assets/css/utilities.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&amp;family=Inter:wght@200;300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;700&amp;family=Noto+Sans+SC:wght@400;500;600&amp;family=Noto+Serif+SC:wght@500&amp;display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="../../assets/css/index.css">
  <link rel="stylesheet" href="../../assets/css/project.css">
  <script type="application/ld+json">{structured}</script>
</head>
<body class="transition-colors duration-300 report-page">
<div class="scroll-progress" id="scroll-progress"></div>
{headers[lang]}
<main class="container-main">
  <section id="project-hero" class="section-padding report-hero">
    <div class="section-eyebrow"><span class="section-kicker">{html.escape(cfg['tag'])}</span></div>
    <h1 class="hero-title">{html.escape(title)}</h1>
    <p class="subtitle report-standfirst">{html.escape(cfg['description'])}</p>
    <p class="reading-time">{'2026 · 分析更新' if lang=='zh' else 'Analysis updated in 2026'}</p>
    <div class="hero-stats">{stats}</div>
    <div class="report-actions"><a class="btn btn-primary" href="#content">{'开始阅读' if lang=='zh' else 'Read report'}</a><a class="btn btn-secondary" href="../../{home}#projects">{'返回项目概览' if lang=='zh' else 'All projects'}</a></div>
  </section>
{series}
  <section id="content" class="section-padding report-layout">
    <aside><nav class="project-toc" id="project-toc" aria-label="{'报告目录' if lang=='zh' else 'Report contents'}"><p class="project-toc__title">{'目录' if lang=='zh' else 'Contents'}</p><ul id="toc-list">{''.join(toc)}</ul></nav></aside>
    <article class="content-area report-body" id="report-body">{''.join(chunks)}</article>
  </section>
{series}
  <section id="related" class="section-padding"><div class="section-header"><h2 class="section-title">{'相关项目' if lang=='zh' else 'Related projects'}</h2></div><div class="grid md:grid-cols-2 gap-6">{related}</div></section>
</main>
<script src="../../assets/js/logo.js"></script>
<script src="../../assets/js/common.js"></script>
<script src="../../assets/js/project.js"></script>
<script src="../../assets/js/language-switcher.js"></script>
</body>
</html>
'''
        page['target'].parent.mkdir(parents=True,exist_ok=True)
        page['target'].write_text(document,encoding='utf-8')
        audit['pages'].append(dict(path=report_name,key=key,language=lang,sections=len(groups)))
    # Replace only the project grid; leave every unrelated homepage byte alone.
    for lang in ('zh','en'):
        home=ROOT/('index.html' if lang=='zh' else 'index-en.html')
        raw=home.read_bytes().decode('utf-8'); newline='\r\n' if '\r\n' in raw else '\n'
        cards=[]
        for n,k in enumerate(['climate','youtube','bank','fraud','loan','ab','healthy','amazon'],1):
            c=summaries[k][lang]; path=catalog[(k,lang)]['target'].relative_to(ROOT).as_posix()
            cards.append(f'''                <a href="{path}" class="bento-item" data-grid-col="{8 if n==1 else 4}"{(' data-grid-row="2"' if n<3 else '')}>
                    <div class="bento-content"><div class="flex-grow">
                        <span class="bento-tag">{html.escape(c['tag'])}</span>
                        <h3 class="mt-4 text-xl">{html.escape(c['title'])}</h3>
                        <p class="mt-2 text-sm">{html.escape(c.get('card_description', c['description']))}</p>
                    </div><div class="mt-4 text-right"><span class="text-link">{'查看详情' if lang=='zh' else 'Read case'}</span></div></div>
                    <div class="number-decoration">{n:02}</div>
                </a>''')
        start=raw.index('<div class="bento-grid')
        end=raw.index('</section>',start)
        replacement='<div class="bento-grid reveal stagger-children">\n'+'\n'.join(cards)+'\n            </div>\n        '
        home.write_bytes((raw[:start]+replacement.replace('\n',newline)+raw[end:]).encode('utf-8'))
    (AUDIT/'render-ledger.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(dict(pages=len(audit['pages']),body_blocks=len(audit['blocks']),figure_references=len(audit['figures']),unique_figure_files=len({x['target'] for x in audit['figures']}),adaptations=len(audit['adaptations'])),indent=2))

def verify():
    baseline=json.loads((SOURCE_AUDIT/'source-manifest.json').read_text(encoding='utf-8'))
    ledger=json.loads((AUDIT/'render-ledger.json').read_text(encoding='utf-8'))
    failures=[]
    docs={p['path']:BeautifulSoup((ROOT/p['path']).read_text(encoding='utf-8'),'html.parser') for p in ledger['pages']}
    previous=json.loads((SOURCE_AUDIT/'render-ledger.json').read_text(encoding='utf-8'))
    if ledger['figures'] != previous['figures']: failures.append(['figure-references-changed'])
    for block in ledger['blocks']:
        node=docs[block['page']].find(id=block['id'])
        if node is None or plain(node)!=block['expected_text']: failures.append(['body-text',block['page'],block['id']])
    for image in ledger['figures']:
        if sha(ROOT/image['target'])!=image['sha256'] or sha(Path(image['source']))!=image['sha256']: failures.append(['figure-hash',image['target']])
    for p in baseline['pages']:
        for s in p['sources']:
            if sha(Path(s['path']))!=s['sha256']: failures.append(['source-changed',s['path']])
    for path,value in baseline['protected'].items():
        if not (ROOT/path).exists() or sha(ROOT/path)!=value: failures.append(['protected-changed',path])
    for repo in baseline['repositories'][1:]:
        if git(repo['path'],'rev-parse','HEAD')!=repo['head'] or git(repo['path'],'status','--porcelain')!=repo['status']: failures.append(['source-git-changed',repo['path']])
    local_links=0; external=set()
    for file,soup in {**docs,**{name:BeautifulSoup((ROOT/name).read_text(encoding='utf-8'),'html.parser') for name in ['index.html','index-en.html']}}.items():
        text=soup.get_text(' ',strip=True).casefold()
        for phrase in ('未公开','not public','作者本地','author-local','源码及配套','不可公开','物理单位尚未确认','健康安全标准','not published on this site'):
            if phrase in text: failures.append(['publication-boilerplate',file,phrase])
        if soup.select('.report-access'): failures.append(['publication-banner',file])
        ids=[x['id'] for x in soup.select('[id]')]
        if len(ids)!=len(set(ids)): failures.append(['duplicate-ids',file])
        for el in soup.select('a[href],img[src],script[src],link[href]'):
            attr='src' if el.name in ('img','script') else 'href'; ref=el[attr]
            u=urlsplit(ref)
            if u.scheme in ('https','http'):
                if el.name=='a': external.add(ref)
                continue
            if u.scheme in ('mailto','tel'):continue
            if ref=='#': failures.append(['placeholder',file]);continue
            target=(ROOT/file).parent/unquote(u.path) if u.path else ROOT/file
            target=target.resolve()
            if not target.exists(): failures.append(['missing-local',file,ref]);continue
            if u.fragment and target.suffix=='.html':
                dest=soup if target==ROOT/file else BeautifulSoup(target.read_text(encoding='utf-8'),'html.parser')
                if dest.find(id=unquote(u.fragment)) is None: failures.append(['missing-anchor',file,ref])
            if re.search(r'\.scratch|\.ipynb|README\.md|results\.json|sp-global-climate-capstone|data-analysis-projects',ref):failures.append(['private-link',file,ref])
            local_links+=1
    for page in pages():
        rendered=docs[page['target'].relative_to(ROOT).as_posix()]
        tables=[plain(t) for t in rendered.select('#report-body table')]
        for source in page['sources']:
            for table in BeautifulSoup(MD.render(source.read_text(encoding='utf-8-sig')),'html.parser').find_all('table'):
                if plain(table) not in tables: failures.append(['source-table-changed',str(source),plain(table)[:120]])
    for key in {p['key'] for p in ledger['pages']}:
        pair=[p for p in ledger['pages'] if p['key']==key]
        if len(pair)!=2 or pair[0]['sections']!=pair[1]['sections']: failures.append(['bilingual-sections',key])
    summary=dict(status='pass' if not failures else 'fail',report_pages=len(docs),body_blocks=len(ledger['blocks']),figure_references=len(ledger['figures']),unique_figures=len({x['target'] for x in ledger['figures']}),local_links_checked=local_links,external_article_links=sorted(external),source_reports_unchanged=not any(x[0].startswith('source-') for x in failures),protected_files_unchanged=not any(x[0]=='protected-changed' for x in failures),failures=failures)
    (AUDIT/'static-validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))
    return bool(failures)

if __name__ == '__main__':
    if sys.argv[1:] == ['inventory']:
        inventory()
    elif sys.argv[1:] == ['render']:
        render()
    elif sys.argv[1:] == ['verify']:
        sys.exit(verify())
    else:
        raise SystemExit('Usage: sync_reports.py inventory|render|verify')
