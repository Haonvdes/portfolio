import asyncio, sys, json
from playwright.async_api import async_playwright
WIDTHS=[320,390,430,560,700,768,769,900,1024,1180,1280,1440,1520,1600,1920,2560]
PAGES=["about.html","index.html","work.html","case-studies/healthcare.html"]
JS="""()=>{
  const out={};
  document.querySelectorAll('section,div,header,footer,main').forEach(e=>{
    if(!e.className || typeof e.className!=='string') return;
    const r=e.getBoundingClientRect(); if(r.width<50) return;
    const cs=getComputedStyle(e);
    const ink=Math.round(r.left+parseFloat(cs.paddingLeft||0));
    const key=e.className.trim().split(/\\s+/)[0];
    (out[key]=out[key]||[]).push(ink);
  });
  return out;
}"""
async def main(tag):
    res={}
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        for page in PAGES:
            for w in WIDTHS:
                await pg.set_viewport_size({"width":w,"height":900})
                await pg.goto(f"http://localhost:8765/{page}", wait_until="networkidle")
                res[f"{page}@{w}"]=await pg.evaluate(JS)
        await b.close()
    json.dump(res, open(tag,'w'), sort_keys=True, indent=0)
    print("wrote", tag)
asyncio.run(main(sys.argv[1]))
