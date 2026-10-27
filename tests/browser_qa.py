from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
css=(root/'styles.css').read_text()
core=(root/'core.mjs').read_text()
game=(root/'game.mjs').read_text()
core=core.replace('export const ','const ').replace('export function ','function ')
game=game.replace("import {GAME_LENGTH,MODES,POSITIONS,KITS,createPuzzle,startGame,useHint,answerQuestion,advance,expireBlitz,rank} from './core.mjs';",'')
game += "\nwindow.__testGame={answer:()=>puzzle?.answer,stage:()=>state?.stage,phase:()=>state?.phase,score:()=>state?.score};"
html=html.replace('<link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="styles.css">','<link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><style>'+css+'</style>')
html=html.replace('<script type="module" src="game.mjs"></script>','')
html=html.replace('</body>','<script>'+core+'\n'+game+'</script></body>')
errs=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [320,375,430,768,1024,1440]:
  page=browser.new_page(viewport={'width':width,'height':780},device_scale_factor=1)
  page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_timeout(180)
  assert page.locator('#startBtn').count()==1
  assert page.locator('#positionSelect option').count()==12
  overflow=page.evaluate('document.documentElement.scrollWidth - window.innerWidth')
  assert overflow <= 1, (width,overflow)
  page.locator('#startBtn').click()
  assert page.locator('#receivers .receiver').count()==3
  assert page.locator('#playerOptions .player-card').count()==3
  assert page.locator('#instruction').inner_text().startswith('Pass to')
  page.locator('#hintBtn').click()
  assert 'HINT' in page.locator('#feedback').inner_text()
  correct=page.evaluate('window.__testGame.answer()')
  page.locator(f'#playerOptions .player-card[data-index="{int(correct.split("-")[1])}"]').click()
  assert 'PASS COMPLETE!' in page.locator('#feedback').inner_text()
  page.keyboard.press('Enter')
  assert page.locator('#stageStat').inner_text()=='02 / 24'
  # pause, resume with Escape, theme and sound toggle
  page.locator('#pauseBtn').click()
  assert page.locator('#modalTitle').inner_text()=='MATCH PAUSED'
  page.keyboard.press('Escape')
  assert page.locator('#modal').is_hidden()
  page.locator('#themeBtn').click()
  page.locator('#soundBtn').click()
  page.locator('#soundBtn').click()
  if width==375:
   page.screenshot(path=str(root/'tests/mobile.png'),full_page=True)
  if width==1440:
   page.screenshot(path=str(root/'tests/desktop.png'),full_page=True)
  print('viewport',width,'horizontal_overflow',overflow,'first question + feedback + pause + prefs ok')
  page.close()
 # Complete a 24-stage Matchday run via simulated browser actions, preserving real rendering and button handlers
 page=browser.new_page(viewport={'width':1280,'height':820});page.on('pageerror',lambda e:errs.append(str(e)))
 page.set_content(html)
 page.locator('#startBtn').click()
 for stage in range(1,25):
  assert page.evaluate('window.__testGame.stage()')==stage
  correct=page.evaluate('window.__testGame.answer()')
  btnidx=int(correct.split('-')[1]);page.locator(f'#playerOptions .player-card[data-index="{btnidx}"]').click()
  if stage<24:page.keyboard.press('Enter')
 page.wait_for_timeout(1800)
 assert page.locator('#modalTitle').is_visible()
 assert page.locator('#modalTitle').inner_text()=='PLATINUM PLAYMAKER'
 print('matchday 24/24 autoplay through actual browser controls passed; score',page.evaluate('window.__testGame.score()'))
 # test Practice mode and wrong answer handling
 page.locator('#modalSecondary').click()
 assert page.locator('#modeChip').inner_text()=='PRACTICE'
 for _ in range(4):
  correct=page.evaluate('window.__testGame.answer()')
  badidx=next(i for i in range(3) if f'player-{i}'!=correct)
  page.locator(f'#playerOptions .player-card[data-index="{badidx}"]').click()
  page.keyboard.press('Enter')
 assert '04' in page.locator('#stageStat').inner_text() or '05' in page.locator('#stageStat').inner_text()
 print('practice incorrect answers and progression passed')
 page.close();browser.close()
print('JS errors',errs)
assert not errs, errs