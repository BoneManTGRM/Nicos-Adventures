'use strict';

const LandingArt = (() => {
  // The approach is keyed to the same frame index as the living animal. The
  // first 32 poses depend on that stride; the last 48 share one landing.
  const columns = 8, entryFrames = 32, totalFrames = 80;
  const sheets = new Map();
  function loadImage(url) {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    // Start decoding during the approach so the first visible pose is cheap.
    if (image.decode) image.decode().catch(() => {});
    return image;
  }
  function warm(species) {
    let sheet = sheets.get(species);
    if (sheet) {
      sheets.delete(species);
    } else {
      const base = 'assets/landings/' + species + '/';
      sheet = {base, settle:loadImage(base + 'settle.webp?v=20'), entries:[]};
      if (sheets.size >= 6) sheets.delete(sheets.keys().next().value);
    }
    sheets.set(species,sheet);
    return sheet;
  }
  function entryFor(sheet, frame) {
    const perGroup = frame.phaseCount / 4;
    const group = Math.floor(frame.phaseIndex / perGroup);
    return sheet.entries[group] ||= loadImage(sheet.base + group + '.webp?v=20');
  }
  function prime(species,frame,coat) {
    if (typeof coat === 'string' && coat !== 'legend') return;
    if (!frame.stride && TimberStride.supports(species)) return;
    entryFor(sheets.get(species) || warm(species), frame);
  }

  // Older wildlife has hand-assigned palettes. Learn its coat from corresponding
  // painted pixels so a white, gold or blue coat carries through the landing.
  function coatTable(common, colored) {
    const bins = Array.from({ length: 64 }, () => [0, 0, 0, 0]);
    for (let i = 0; i < common.length; i++) {
      const a = common[i], b = colored[i];
      if (!(a >>> 24) || !(b >>> 24)) continue;
      const tone = ((a & 255) * .30 + (a >>> 8 & 255) * .58 + (a >>> 16 & 255) * .12) >> 2;
      const bin = bins[tone];
      bin[0] += b & 255; bin[1] += b >>> 8 & 255; bin[2] += b >>> 16 & 255; bin[3]++;
    }
    const anchors = bins.map((b, i) => b[3] ? i : -1).filter(i => i >= 0);
    return bins.map((_, i) => {
      const lo = anchors.filter(j => j <= i).at(-1) ?? anchors[0];
      const hi = anchors.find(j => j >= i) ?? lo;
      const t = hi === lo ? 0 : (i - lo) / (hi - lo);
      return [0, 1, 2].map(c => bins[lo][c] / bins[lo][3] * (1 - t) + bins[hi][c] / bins[hi][3] * t);
    });
  }

  function create(species, gait, coat, standing) {
    if (typeof coat === 'string' && coat !== 'legend') return null;
    if (!standing.stride && TimberStride.supports(species)) return null;
    const sheet = warm(species);
    const animation = {
      settle:sheet.settle, entry:entryFor(sheet,standing),
      firstRow:(standing.phaseIndex % (standing.phaseCount / 4)) * (entryFrames / columns),
      species, coat, standing, stride:!!standing.stride, tinted:[]
    };
    if (coat) {
      if (!animation.stride) animation.table = coatTable(TimberWildlife.sprite(species, gait, false).px, standing.px);
    }
    return animation;
  }

  function ready(a) {
    return !!(a && a.entry.complete && a.settle.complete && a.entry.naturalWidth && a.settle.naturalWidth);
  }
  function canvasContext(w,h,readPixels=false) {
    const canvas=document.createElement('canvas');
    canvas.width=w; canvas.height=h;
    return canvas.getContext('2d',{willReadFrequently:readPixels});
  }
  function stamp(ctx,a,frame,w,h) {
    if (frame===0) {
      const s=a.standing;
      ctx.drawImage(s.surface,(w-s.w)/2,h-s.h);
      return;
    }
    const index=frame-1, early=index<entryFrames;
    const image=early?a.entry:a.settle;
    const cell=early?a.firstRow*columns+index:index-entryFrames;
    const x=cell%columns*w, y=Math.floor(cell/columns)*h;
    if (!a.coat) {
      ctx.drawImage(image,x,y,w,h,0,0,w,h);
      return;
    }
    // Adjacent draws normally share a pose. Keep both already tinted.
    const slot=index%2;
    let ink=a.tinted[slot];
    if (!ink) ink=a.tinted[slot]={ctx:canvasContext(w,h,true),index:-1};
    if (ink.index!==index) {
      const c=ink.ctx;
      c.clearRect(0,0,w,h);
      c.drawImage(image,x,y,w,h,0,0,w,h);
      const pixels=c.getImageData(0,0,w,h), data=pixels.data;
      if (a.stride) TimberStride.tint(data,a.coat,a.species);
      else {
        for (let i=0;i<data.length;i+=4) {
          if (!data[i+3]) continue;
          const color=a.table[(data[i]*.30+data[i+1]*.58+data[i+2]*.12)>>2];
          data[i]=color[0]; data[i+1]=color[1]; data[i+2]=color[2];
        }
      }
      c.putImageData(pixels,0,0);
      ink.index=index;
    }
    ctx.drawImage(ink.ctx.canvas,0,0);
  }
  function draw(g,a,progress,size,dir) {
    const w=a.settle.naturalWidth/columns;
    const h=a.settle.naturalHeight/((totalFrames-entryFrames)/columns);
    // The forequarters take weight at 3/8 of the fall. Keep timing independent
    // of the display refresh and the number of samples in either atlas.
    const at=progress<=.375 ? progress*entryFrames/.375
      : entryFrames+(progress-.375)*(totalFrames-entryFrames)/.625;
    const first=Math.min(totalFrames,Math.floor(at)), mix=at-first;
    const c=a.composite ||= canvasContext(w,h);
    if (a.at!==at) {
      c.clearRect(0,0,w,h);
      c.globalAlpha=1-mix;
      stamp(c,a,first,w,h);
      if (mix>0 && first<totalFrames) {
        // Add weighted premultiplied samples in isolation. Ordinary source-over
        // makes an opaque shoulder go translucent halfway between two poses.
        c.globalCompositeOperation='lighter';
        c.globalAlpha=mix;
        stamp(c,a,first+1,w,h);
        c.globalCompositeOperation='source-over';
      }
      c.globalAlpha=1; a.at=at;
    }
    const scale=size/a.standing.h;
    g.save(); g.scale(scale*dir,scale);
    g.imageSmoothingEnabled=true; g.imageSmoothingQuality='low';
    g.drawImage(c.canvas,-w/2,-h); g.restore();
  }
  return {warm, prime, create, ready, draw};
})();
