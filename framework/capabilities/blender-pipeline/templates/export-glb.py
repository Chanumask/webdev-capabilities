"""
Template: export Poly Haven models as web GLBs for a real-time scene (tier T2). Run with
  npm run blender -- run <site> scenes/export-glb.py --out public/models
The tool validates every GLB afterwards (a GLB that references a missing image makes GLTFLoader throw).
Rules (decision 0016): textures at most 1024 px as WebP, meshopt compression, no lights in the file.
Do not use scanned trees here: they are 0.5 to 1 GB.
"""

import os

import webdev_bpy as wb

MODELS = ['pocket_watch', 'magnifying_glass_01']

wb.reset()
for name in MODELS:
    root, objs = wb.import_model(name)
    wb.export_glb(root, objs, os.path.join(wb.env('WEBDEV_OUT', '.'), f'{name}.glb'))
    root.hide_set(True)
    for o in objs:
        o.hide_set(True)
