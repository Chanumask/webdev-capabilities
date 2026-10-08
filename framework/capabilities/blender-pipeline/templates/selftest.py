"""Tiny scene used by `npm run blender -- selftest`: proves Blender, the GPU and webdev_bpy work. No assets needed."""

import webdev_bpy as wb

wb.reset()
wb.setup_cycles(samples=4)
mat = wb.plain('floor', (0.6, 0.55, 0.5, 1), rough=0.8)
wb.box('floor', (4, 4, 0.1), (0, 0, -0.05), mat)
wb.box('cube', (0.5, 0.5, 0.5), (0, 0, 0.25), wb.plain('cube', (0.8, 0.2, 0.1, 1), rough=0.3), bevel=0.02)
wb.sun(elevation_deg=45, azimuth_deg=30, energy=4)
wb.camera((2.2, -2.2, 1.4), (0, 0, 0.25), focal=40)
wb.still('still')
