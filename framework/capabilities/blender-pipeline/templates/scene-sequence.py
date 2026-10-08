"""
Template: a rendered camera move for a scroll story (tier T3, decision 0015). Copy to sites/<site>/scenes/<name>.py,
add the assets with `npm run assets -- add <site> models/<id>`, then:

  npm run blender -- render <site> scenes/<name>.py --only 0 --samples 32     # look at one frame first
  npm run blender -- render <site> scenes/<name>.py --set both                # desktop and portrait sets
  npm run blender -- frames <site> <name>

Rules that kept renders photographic in the spikes: scanned models and materials instead of hand-built boxes,
a real HDRI for the light, a long lens and shallow depth of field for objects, a level camera for buildings.
"""

import webdev_bpy as wb

PORTRAIT = wb.SET == 'phone'

wb.reset()
wb.setup_cycles(samples=wb.env('S', 128, int))
wb.world_hdri('art_studio', strength=0.5)  # assets/polyhaven/hdris/art_studio/art_studio_2k.hdr

# ground or table from a scanned texture
ground = wb.pbr('ground', 'dark_wood', scale=0.9)
wb.box('ground', (1.6, 0.9, 0.04), (0, 0, -0.02), ground, bevel=0.004)

# a model from Poly Haven, placed so it rests on the ground
model = wb.import_model('pocket_watch')
wb.drop(*model, 0.0, 0.0, 0.0, rot_z=-12, rot_x=-90)

wb.area_light('Key', (-0.7, -0.25, 0.32), (0, 0, 0.01), 0.9, 130, (1.0, 0.85, 0.66))

cam = wb.camera((0.4, -0.8, 0.5), (0, 0.02, 0.02), focal=45, fstop=8)
wide = dict(pos=(0.38, -0.80, 0.50), tgt=(0, 0.06, 0.02), focal=45, fstop=8)
close = dict(pos=(0.14, -0.42, 0.17), tgt=(0, -0.01, 0.01), focal=85, fstop=5.6)
if PORTRAIT:  # frame for a tall screen: closer and centred on the subject
    wide['pos'], close['pos'] = (0.26, -0.55, 0.34), (0.1, -0.3, 0.13)
wb.sequence(cam, wide, close, n=wb.env('N', 60, int))
