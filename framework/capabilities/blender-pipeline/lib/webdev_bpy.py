"""
Helpers for headless Blender scene scripts (decision 0016). Run through `npm run blender -- render <site> <scene.py>`;
that sets the environment variables read here. Everything is plain bpy, nothing is downloaded.

Environment (set by framework/tools/blender.mjs):
  WEBDEV_ASSETS   site folder with assets/polyhaven/{models,textures,hdris}/<id>/
  WEBDEV_OUT      output folder for this render job
  W, H, S         width, height, samples
  SET             'desktop' (landscape) or 'phone' (portrait); scripts frame the shot differently per set
  N, ONLY         frames of a sequence; ONLY=<i> renders just frame i (cheap look at a sequence)
"""

import math
import os
import time

import bpy
from mathutils import Matrix, Vector

ASSETS = os.environ.get('WEBDEV_ASSETS', '')
SET = os.environ.get('SET', 'desktop')


def env(name, default, cast=str):
    v = os.environ.get(name)
    return default if v in (None, '') else cast(v)


def asset_path(kind, name, *parts):
    return os.path.join(ASSETS, 'assets', 'polyhaven', kind, name, *parts)


# ---------------------------------------------------------------- scene and renderer
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def setup_cycles(w=None, h=None, samples=None, denoise=True):
    """Cycles on the GPU (OptiX when present), AgX view transform, PNG output."""
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('OPTIX', 'CUDA', 'HIP', 'METAL', 'NONE'):
        try:
            prefs.compute_device_type = kind
        except TypeError:
            continue
        prefs.get_devices()
        if any(d.type == kind for d in prefs.devices) or kind == 'NONE':
            break
    for d in prefs.devices:
        d.use = d.type == prefs.compute_device_type
    sc.cycles.device = 'GPU' if prefs.compute_device_type != 'NONE' else 'CPU'
    sc.cycles.samples = samples or env('S', 128, int)
    sc.cycles.use_denoising = denoise
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.render.resolution_x = w or env('W', 1920, int)
    sc.render.resolution_y = h or env('H', 1080, int)
    sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Base Contrast'
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_depth = '8'
    print('DEVICE', prefs.compute_device_type, sc.cycles.device)
    return sc


def world_hdri(name, res='2k', strength=1.0, rot_deg=0.0):
    sc = bpy.context.scene
    w = bpy.data.worlds.new('W')
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    env_tex = nt.nodes.new('ShaderNodeTexEnvironment')
    env_tex.image = bpy.data.images.load(asset_path('hdris', name, f'{name}_{res}.hdr'))
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Rotation'].default_value[2] = math.radians(rot_deg)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    bg = nt.nodes.new('ShaderNodeBackground')
    bg.inputs['Strength'].default_value = strength
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], env_tex.inputs['Vector'])
    nt.links.new(env_tex.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])
    return bg


# ---------------------------------------------------------------- models
def import_model(name):
    """Imports assets/polyhaven/models/<name>/*.gltf. Returns (root_empty, [objects])."""
    before = set(bpy.data.objects)
    d = asset_path('models', name)
    f = [x for x in os.listdir(d) if x.endswith('.gltf')][0]
    bpy.ops.import_scene.gltf(filepath=os.path.join(d, f))
    new = [o for o in bpy.data.objects if o not in before]
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    for o in new:
        if o.parent is None or o.parent not in new:
            o.parent = root
    return root, new


def import_person(pid, loc=(0, 0, 0), rot_z=0.0, arm_deg=48):
    """Microsoft Rocketbox avatar (MIT) fetched with `npm run assets -- add <site> people/<id>`.
    Wires the converted textures (assets/people/<id>/<prefix>_<part>_<kind>.jpg|png) into Principled materials with
    a little subsurface for skin, and lowers the arms from the T-pose. Returns (root, armature, objects).
    Suitable for rendered frames at medium and long distance; close-ups show game-era hair cards."""
    d = os.path.join(ASSETS, 'assets', 'people', pid)
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=os.path.join(d, pid + '.fbx'))
    new = [o for o in bpy.data.objects if o not in before]

    def find(prefix, part, kind):
        for ext in ('jpg', 'png'):
            p = os.path.join(d, f'{prefix}_{part}_{kind}.{ext}')
            if os.path.exists(p):
                return p
        return None

    for o in new:
        if o.type != 'MESH':
            continue
        for slot in o.material_slots:
            m = slot.material
            if not m:
                continue
            low = m.name.lower()
            part = 'opacity' if 'opacity' in low else ('head' if 'head' in low else 'body')
            prefix = m.name.split('_')[0]
            m.use_nodes = True
            nt = m.node_tree
            nt.nodes.clear()
            out = nt.nodes.new('ShaderNodeOutputMaterial')
            bs = nt.nodes.new('ShaderNodeBsdfPrincipled')
            nt.links.new(bs.outputs['BSDF'], out.inputs['Surface'])

            def tex(kind, cs):
                p = find(prefix, part, kind)
                if not p:
                    return None
                n = nt.nodes.new('ShaderNodeTexImage')
                n.image = bpy.data.images.load(p)
                n.image.colorspace_settings.name = cs
                return n

            c = tex('color', 'sRGB')
            if c:
                nt.links.new(c.outputs['Color'], bs.inputs['Base Color'])
                if part == 'opacity':
                    nt.links.new(c.outputs['Alpha'], bs.inputs['Alpha'])
            nrm = tex('normal', 'Non-Color')
            if nrm:
                nn = nt.nodes.new('ShaderNodeNormalMap')
                nt.links.new(nrm.outputs['Color'], nn.inputs['Color'])
                nt.links.new(nn.outputs['Normal'], bs.inputs['Normal'])
            bs.inputs['Roughness'].default_value = 0.55 if part != 'opacity' else 0.8
            if part in ('head', 'body'):
                bs.inputs['Subsurface Weight'].default_value = 0.15
                bs.inputs['Subsurface Radius'].default_value = (1.0, 0.35, 0.2)
                bs.inputs['Subsurface Scale'].default_value = 0.02
    arm = [o for o in new if o.type == 'ARMATURE'][0]
    for side, sign in (('L', 1), ('R', -1)):
        b = arm.pose.bones.get(f'Bip01 {side} UpperArm')
        if b:
            b.rotation_mode = 'XYZ'
            b.rotation_euler = (0, math.radians(arm_deg * sign), 0)
    root = bpy.data.objects.new(pid, None)
    bpy.context.collection.objects.link(root)
    arm.parent = root
    root.location = loc
    root.rotation_euler = (0, 0, math.radians(rot_z))
    return root, arm, new


def apply_animation(arm, name):
    """Plays a Rocketbox animation (`npm run assets -- add <site> animations/<name>`) on a Rocketbox armature.
    All avatars share one skeleton, so no retargeting is needed. Returns (first_frame, last_frame).
    Sets the scene frame range to the clip. Walks come in place ('xy'): move the avatar's root yourself."""
    path = os.path.join(ASSETS, 'assets', 'people', 'animations', name + '.fbx')
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    src = [o for o in new if o.type == 'ARMATURE'][0]
    action = src.animation_data.action
    arm.animation_data_create()
    arm.animation_data.action = action
    for o in new:
        bpy.data.objects.remove(o, do_unlink=True)
    first, last = int(action.frame_range[0]), int(action.frame_range[1])
    bpy.context.scene.frame_start, bpy.context.scene.frame_end = first, last
    return first, last


def bbox(objs):
    pts = []
    for o in objs:
        if o.type == 'MESH':
            pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def drop(root, objs, x, y, z=0.0, rot_z=0.0, scale=1.0, rot_x=0.0):
    """Places a model so its bounding box centre is at x, y and its lowest point at z."""
    root.scale = (scale,) * 3
    root.rotation_euler = (math.radians(rot_x), 0, math.radians(rot_z))
    bpy.context.view_layer.update()
    mn, mx = bbox(objs)
    root.location = (x - (mn.x + mx.x) / 2, y - (mn.y + mx.y) / 2, z - mn.z)
    bpy.context.view_layer.update()


def hide_source(root, objs):
    """Hides an imported model so only instances render (see instance())."""
    root.hide_render = True
    for o in objs:
        o.hide_render = True
        o.hide_viewport = True


def instance(model, x, y, rot_z=0.0, scale=1.0, z=0.0):
    """Linked copy of a hidden imported model: shares mesh data, so hundreds of trees stay cheap."""
    root, objs = model
    r = bpy.data.objects.new(root.name + '_i', None)
    bpy.context.collection.objects.link(r)
    mn, mx = bbox(objs)
    cx, cy = (mn.x + mx.x) / 2, (mn.y + mx.y) / 2
    for o in objs:
        if o.type != 'MESH':
            continue
        c = o.copy()
        bpy.context.collection.objects.link(c)
        c.matrix_world = o.matrix_world.copy()
        c.parent = r
        c.matrix_parent_inverse = Matrix.Translation((-cx, -cy, -mn.z))
        c.hide_render = False
        c.hide_viewport = False
    r.location = (x, y, z)
    r.rotation_euler = (0, 0, math.radians(rot_z))
    r.scale = (scale,) * 3
    return r


# ---------------------------------------------------------------- materials and primitives
def plain(name, color, rough=0.4, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m


def glass():
    """Fresnel mix of transparent and glossy. No refraction, so no caustic noise through windows."""
    m = bpy.data.materials.new('glass')
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    gl = nt.nodes.new('ShaderNodeBsdfGlossy')
    gl.inputs['Roughness'].default_value = 0.02
    fr = nt.nodes.new('ShaderNodeFresnel')
    fr.inputs['IOR'].default_value = 1.5
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(fr.outputs['Fac'], mix.inputs['Fac'])
    nt.links.new(tr.outputs['BSDF'], mix.inputs[1])
    nt.links.new(gl.outputs['BSDF'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    return m


def pbr(name, tex, res='2k', scale=1.0, normal_strength=1.0, tint=None, proj='BOX'):
    """Principled material from assets/polyhaven/textures/<tex>/<tex>_{Diffuse,Rough,nor_gl}_<res>.jpg, box-projected."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bs = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(bs.outputs['BSDF'], out.inputs['Surface'])
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    for i in range(3):
        mp.inputs['Scale'].default_value[i] = scale
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])

    def img(kind, cs):
        p = asset_path('textures', tex, f'{tex}_{kind}_{res}.jpg')
        if not os.path.exists(p):
            return None
        n = nt.nodes.new('ShaderNodeTexImage')
        n.image = bpy.data.images.load(p)
        n.image.colorspace_settings.name = cs
        n.projection = proj
        n.projection_blend = 0.2
        nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
        return n

    d = img('Diffuse', 'sRGB')
    if d:
        if tint:
            mix = nt.nodes.new('ShaderNodeMix')
            mix.data_type = 'RGBA'
            mix.blend_type = 'MULTIPLY'
            mix.inputs['Factor'].default_value = 1
            mix.inputs['B'].default_value = tint
            nt.links.new(d.outputs['Color'], mix.inputs['A'])
            nt.links.new(mix.outputs['Result'], bs.inputs['Base Color'])
        else:
            nt.links.new(d.outputs['Color'], bs.inputs['Base Color'])
    r = img('Rough', 'Non-Color')
    if r:
        nt.links.new(r.outputs['Color'], bs.inputs['Roughness'])
    n = img('nor_gl', 'Non-Color')
    if n:
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = normal_strength
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bs.inputs['Normal'])
    return m


def box(name, size, loc, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = o.modifiers.new('bevel', 'BEVEL')
        b.width = bevel
        b.segments = 3
        b.limit_method = 'ANGLE'
    o.data.materials.append(mat)
    return o


def fog_box(center, size, density=0.01, anisotropy=0.5, color=(0.9, 0.93, 1.0, 1)):
    """Haze as a bounded volume. A world volume would absorb the sky and render black (spike finding)."""
    m = bpy.data.materials.new('Fog')
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    vp = nt.nodes.new('ShaderNodeVolumePrincipled')
    vp.inputs['Density'].default_value = density
    vp.inputs['Anisotropy'].default_value = anisotropy
    vp.inputs['Color'].default_value = color
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(vp.outputs['Volume'], out.inputs['Volume'])
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.active_object
    o.scale = size
    o.data.materials.append(m)
    bpy.context.scene.cycles.volume_bounces = 2
    return o


# ---------------------------------------------------------------- lights and camera
def area_light(name, loc, target, size, energy, color=(1, 1, 1)):
    l = bpy.data.lights.new(name, 'AREA')
    l.energy = energy
    l.size = size
    l.color = color
    o = bpy.data.objects.new(name, l)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o


def sun(elevation_deg=40, azimuth_deg=0, energy=5.0, color=(1.0, 0.85, 0.65), angle_deg=1.0):
    """Sun lamp. Blender's rotation X tilts the light; 90 degrees minus elevation points it down."""
    l = bpy.data.lights.new('Sun', 'SUN')
    l.energy = energy
    l.angle = math.radians(angle_deg)
    l.color = color
    o = bpy.data.objects.new('Sun', l)
    bpy.context.collection.objects.link(o)
    o.rotation_euler = (math.radians(90 - elevation_deg), 0, math.radians(azimuth_deg))
    return o


def camera(loc, target, focal=50, fstop=0, sensor=36):
    cam = bpy.data.cameras.new('Cam')
    co = bpy.data.objects.new('Cam', cam)
    bpy.context.collection.objects.link(co)
    cam.lens = focal
    cam.sensor_width = sensor
    co.location = loc
    d = Vector(target) - Vector(loc)
    co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cam.dof.use_dof = fstop > 0
    cam.dof.aperture_fstop = fstop or 8
    cam.dof.focus_distance = d.length
    bpy.context.scene.camera = co
    return co


# ---------------------------------------------------------------- output
def render(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def still(name='still'):
    t = time.time()
    render(os.path.join(env('WEBDEV_OUT', '.'), name + '.png'))
    print('RENDER_SECONDS', round(time.time() - t, 1))


def sequence(cam_obj, k0, k1, n=None, name='f'):
    """Renders n frames from keyframe k0 to k1 (dicts with pos, tgt, focal, fstop), smoothstep eased.
    ONLY=<i> renders a single frame, N sets the frame count."""
    n = n or env('N', 60, int)
    only = os.environ.get('ONLY')
    out = env('WEBDEV_OUT', '.')
    cam = cam_obj.data
    t0 = time.time()
    done = 0
    for i in range(n):
        if only not in (None, '') and int(only) != i:
            continue
        u = i / max(1, n - 1)
        e = u * u * (3 - 2 * u)
        pos = Vector(k0['pos']).lerp(Vector(k1['pos']), e)
        tgt = Vector(k0['tgt']).lerp(Vector(k1['tgt']), e)
        cam_obj.location = pos
        d = tgt - pos
        cam_obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        cam.lens = k0['focal'] + (k1['focal'] - k0['focal']) * e
        if cam.dof.use_dof:
            cam.dof.aperture_fstop = k0.get('fstop', 8) + (k1.get('fstop', 8) - k0.get('fstop', 8)) * e
            cam.dof.focus_distance = d.length
        render(os.path.join(out, f'{name}{i:03d}.png'))
        done += 1
    print('SEQ_SECONDS', round(time.time() - t0, 1), 'frames', done)


# ---------------------------------------------------------------- GLB export for real-time (T2)
def _one_channel_to_rgb(objs):
    """WebP cannot store 1-channel images; Blender then writes a GLB that references a missing image."""
    for o in objs:
        for s in o.material_slots:
            if not (s.material and s.material.use_nodes):
                continue
            for nd in s.material.node_tree.nodes:
                if nd.type == 'TEX_IMAGE' and nd.image and nd.image.channels == 1:
                    old = nd.image
                    new = bpy.data.images.new(old.name + '_rgb', old.size[0], old.size[1], alpha=False)
                    new.pixels = old.pixels[:]
                    new.colorspace_settings.name = old.colorspace_settings.name
                    nd.image = new


def export_glb(root, objs, path, max_tex=1024, fmt='WEBP', quality=80):
    """Web GLB: textures scaled to max_tex, WebP, meshopt, no lights or cameras. Validate the result in Node."""
    _one_channel_to_rgb(objs)
    imgs = set()
    for o in objs:
        for s in o.material_slots:
            if s.material and s.material.use_nodes:
                for nd in s.material.node_tree.nodes:
                    if nd.type == 'TEX_IMAGE' and nd.image:
                        imgs.add(nd.image)
    for im in imgs:
        w, h = im.size
        if max(w, h) > max_tex:
            k = max_tex / max(w, h)
            im.scale(int(w * k), int(h * k))
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    root.select_set(True)
    os.makedirs(os.path.dirname(path), exist_ok=True)

    def write(image_format):
        bpy.ops.export_scene.gltf(
            filepath=path,
            export_format='GLB',
            use_selection=True,
            export_lights=False,
            export_cameras=False,
            export_image_format=image_format,
            export_image_quality=quality,
            export_meshopt_compression_enable=True,
        )

    write(fmt)
    if not glb_ok(path) and fmt != 'JPEG':
        # Blender writes a GLB that references an image it could not save (WebP and single-channel maps)
        print('GLB_FALLBACK', os.path.basename(path), 'WebP export left a missing image, writing JPEG textures')
        write('JPEG')
    print('EXPORTED', path, os.path.getsize(path))


def glb_ok(path):
    """True when every texture of the GLB points at an existing image (same check as blender.mjs validate)."""
    import json
    import struct

    with open(path, 'rb') as f:
        data = f.read()
    n = struct.unpack_from('<I', data, 12)[0]
    doc = json.loads(data[20:20 + n])
    images = doc.get('images', [])
    for t in doc.get('textures', []):
        src = t.get('source', t.get('extensions', {}).get('EXT_texture_webp', {}).get('source'))
        if src is None or src >= len(images):
            return False
    return True
