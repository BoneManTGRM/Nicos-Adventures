"""Repair reviewed matte regions in existing sprites without regenerating artwork.
Run against pinned originals with Pillow 12.3.0, numpy 2.3.5 and scipy 1.17.0.
Outputs are pre-baked WebP files. No color-keying runs on phones.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

NAMES = (["art/becca-premium-v2.webp", "art/lua-premium-v2.webp"]
         + [f"art/unicorn-{p}-v2.webp" for p in ["prance", "float", "rest", "turn"]]
         + ["art/arctic-fox-premium-v2.webp", "art/polar-bear-premium-v2.webp"]
         + [f"pets/sparky-{p}-v2.webp" for p in ["idle", "sit", "high-five", "fetch-tool"]]
         + ["art/wildlife-premium-clean-atlas.webp"])
# Reviewed lower-ground regions in 320px cells, not the subject's face/body.
FLOORS = {0:224,1:247,5:238,8:230,9:239,10:219,11:259,16:252,17:185,
          19:233,20:247,22:275,23:270,24:238,25:237,27:258,28:233,29:239,30:241,31:245}
SEEDS = {0:[(197,255),(145,275)],1:[(143,262)],2:[(184,136),(100,144)],
         5:[(108,268),(250,269)],8:[(130,264),(183,261)],9:[(237,262),(159,257)],
         10:[(178,255),(140,262),(203,267)],11:[(177,272)],
         16:[(163,270),(100,270),(127,289),(135,264)],17:[(248,244),(221,233),(171,247)],
         19:[(125,265),(41,290),(272,238),(186,271),(265,258),(228,241)],
         20:[(93,270),(175,263),(49,296),(233,268)],23:[(86,281),(198,275)],
         24:[(59,252),(166,276),(105,269)],25:[(247,263),(113,264)],
         27:[(109,266),(208,280),(261,268)],28:[(109,254),(186,250)],
         29:[(219,260),(136,264)],30:[(153,262),(194,272)],31:[(243,265),(131,279),(198,285)]}

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def repair_edge(source: np.ndarray, band: float) -> tuple[np.ndarray, np.ndarray]:
    """Unmatte a narrow silhouette band; pale fur is never keyed to alpha."""
    result = source.copy()
    rgb = source[:,:,:3].astype(np.float32)
    alpha = source[:,:,3].astype(np.float32)
    core = ndi.distance_transform_edt(alpha >= 128) > band
    if not core.any():
        raise ValueError("Sprite has no solid interior")
    near, indices = ndi.distance_transform_edt(~core, return_indices=True)
    reference = rgb[indices[0], indices[1]]
    white_direction = 255 - reference
    difference = rgb - reference
    fraction = np.clip((difference * white_direction).sum(2)
                       / np.maximum((white_direction ** 2).sum(2), 1), 0, 1)
    residual = np.sqrt(((difference - fraction[:,:,None] * white_direction) ** 2).mean(2))
    contaminated = ((alpha > 0) & ~core & (near <= band + 3)
                    & (reference.min(2) < 215) & (fraction > .06)
                    & (difference.min(2) > -8) & (residual < 22))
    alpha[contaminated] *= 1 - fraction[contaminated]
    rgb[contaminated] = reference[contaminated]
    result[:,:,:3] = np.round(rgb).astype(np.uint8)
    result[:,:,3] = np.round(alpha).astype(np.uint8)
    # Extend adjacent subject RGB under transparency so texture interpolation
    # cannot reveal an invisible white matte around the 3D companion.
    visible = result[:,:,3] > 0
    _, nearest = ndi.distance_transform_edt(~visible, return_indices=True)
    result[~visible,:3] = result[nearest[0][~visible], nearest[1][~visible], :3]
    assert np.array_equal(result[core], source[core]), "Interior changed"
    return result, core

def remove_becca_paper(source: np.ndarray) -> np.ndarray:
    result = source.copy()
    rgb = source[:,:,:3].astype(np.int16)
    paper = (rgb.min(2) > 205) & (rgb.max(2) - rgb.min(2) < 32)
    paper[775:] = False
    protected = [(230,455,330,570), (443,393,642,549)]  # white cuff and collar
    for x1,y1,x2,y2 in protected:
        paper[y1:y2,x1:x2] = False
    clear = source[:,:,3] < 8
    exterior = ndi.binary_propagation(clear, mask=clear | paper)
    # White islands enclosed by dark curls are negative space, not highlights.
    hair = np.zeros(paper.shape, dtype=bool)
    hair[370:775,:440] = True
    hair[390:775,668:] = True
    for x1,y1,x2,y2 in protected:
        hair[y1:y2,x1:x2] = False
    result[(exterior | hair) & paper, 3] = 0
    return result

def remove_cell_paper(source: np.ndarray, index: int) -> np.ndarray:
    result = source.copy()
    if index not in FLOORS and index != 2:
        return result
    rgb = source[:,:,:3].astype(np.int16)
    paper = (rgb.min(2) > 170) & (rgb.max(2) - rgb.min(2) < 22)
    if index == 2:
        region = np.zeros(paper.shape, dtype=bool)
        region[112:181,78:201] = True
        paper &= region
    else:
        paper[:FLOORS[index]] = False
    seeds = (source[:,:,3] < 8) & paper
    for x,y in SEEDS.get(index, []):
        if paper[y,x]:
            seeds[y,x] = True
    removed = ndi.binary_propagation(seeds, mask=paper)
    result[removed,3] = 0
    return result

def run(root: Path, output: Path, pins_path: Path) -> dict:
    pins = json.loads(pins_path.read_text())
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for name in NAMES:
        raw = (root/name).read_bytes()
        if digest(raw) != pins[name]:
            raise ValueError(f"Original asset changed, review required: {name}")
        original = np.array(Image.open(root/name).convert("RGBA"))
        work = original.copy()
        core = np.zeros(original.shape[:2], dtype=bool)
        if name.endswith("wildlife-premium-clean-atlas.webp"):
            assert original.shape == (1280,2560,4)
            for index in range(32):
                x,y = index % 8 * 320,index // 8 * 320
                cell = remove_cell_paper(original[y:y+320,x:x+320], index)
                work[y:y+320,x:x+320], preserved = repair_edge(cell, 2.5)
                core[y:y+320,x:x+320] = preserved & (cell[:,:,3] == original[y:y+320,x:x+320,3])
            # Bake the same approved replacements already used at runtime into
            # the two damaged atlas cells, keeping their inset and scale.
            atlas = Image.fromarray(work)
            for index,replacement in [(12,"polar-bear"),(13,"arctic-fox")]:
                image = Image.open(output/f"art/{replacement}-premium-v2.webp").convert("RGBA")
                scale = min(294.4/image.width,294.4/image.height)
                image = image.resize((round(image.width*scale),round(image.height*scale)), Image.Resampling.LANCZOS)
                x,y = index % 8 * 320,index // 8 * 320
                atlas.paste((0,0,0,0),(x,y,x+320,y+320))
                atlas.paste(image,(x+(320-image.width)//2,y+(320-image.height)//2))
                core[y:y+320,x:x+320] = False
            work = np.array(atlas)
        else:
            if "becca-premium" in name:
                work = remove_becca_paper(original)
            work, core = repair_edge(work, 4 if "becca-premium" in name else 2)
            core &= work[:,:,3] == original[:,:,3]
        assert np.array_equal(work[core],original[core]), f"Protected RGB/alpha changed in {name}"
        target = output/name
        target.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(work).save(target, lossless=True, exact=True, method=6)
        decoded = np.array(Image.open(target).convert("RGBA"))
        assert np.array_equal(work,decoded), "Lossless output failed pixel equality"
        assert original.shape == decoded.shape, "Canvas size or frame alignment changed"
        records.append({"path":f"web/src/assets/{name}","sourceSha256":digest(raw),
                        "sha256":digest(target.read_bytes()),"width":int(original.shape[1]),
                        "height":int(original.shape[0]),"preservedInteriorPixels":int(core.sum()),
                        "changedProtectedPixels":0,
                        "removedMattePixels":int(((original[:,:,3]>0)&(decoded[:,:,3]==0)).sum()),
                        "bytes":target.stat().st_size})
    report = {"schema":1,"sourceCommit":"70c597b73707a3ca37040c66fd3f19abee643e98",
              "method":"reviewed negative-space masks plus narrow-edge white-matte decontamination",
              "regeneratedArtwork":False,"wildlifeSpecies":32,"records":records}
    (output/"cutout-repair.provenance.json").write_text(json.dumps(report,indent=2)+"\n")
    return report

if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--pins",type=Path,required=True)
    args=parser.parse_args()
    print(json.dumps(run(args.root,args.output,args.pins),indent=2))
