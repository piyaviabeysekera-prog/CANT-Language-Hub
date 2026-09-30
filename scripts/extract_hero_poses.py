"""
CANT 5K Master Hero Pose Extraction Pipeline
Extracts clean, de-fringed transparent hero assets from reference/Final_Pose_Library_5K.jpg
Outputs to public/hero/{pose_id}/:
  - figure.webp        (2000px tall master)
  - figure@1080.webp   (1200px tall display variant)
  - figure_waist.webp  (1200px tall dynamic zoom waist crop)
  - mask.webp          (8px dilated silhouette mask)
  - mask_waist.webp    (8px dilated silhouette mask for waist crop)
And updates public/hero/manifest.json.
"""

import os
import sys
import json
import argparse
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import (
    binary_fill_holes,
    label,
    binary_dilation,
    gaussian_filter
)

# Reference source path: 5K Master Sheet (5056x3372)
SOURCE_5K = os.path.join(os.path.dirname(__file__), "..", "reference", "Final_Pose_Library_5K.jpg")
SOURCE_FALLBACK = os.path.join(os.path.dirname(__file__), "..", "reference", "Final_Pose_Library.jpg")
OUTPUT_BASE = os.path.join(os.path.dirname(__file__), "..", "public", "hero")

# Exact coordinates on Final_Pose_Library_5K.jpg (5056x3372)
POSES_5K = {
    "01-observe": {
        "label": "Observe",
        "crop": (170, 560, 610, 1648),
        "flip": False,
        "screens": ["pause"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "02-analyze": {
        "label": "Analyze",
        "crop": (1000, 560, 1530, 1648),
        "flip": False,
        "screens": ["practice"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "03-explain": {
        "label": "Explain",
        "crop": (1780, 560, 2390, 1648),
        "flip": True,  # gestures right in source, flips to face left towards menu
        "screens": ["spare"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "04-construct": {
        "label": "Construct",
        "crop": (2535, 465, 3360, 1648),
        "flip": False,
        "screens": ["system"],
        "props": True,
        "waist_ratio": 0.70,
        "focal": [0.50, 0.20]
    },
    "05-reveal": {
        "label": "Reveal",
        "crop": (3430, 560, 4130, 1648),
        "flip": False,
        "screens": ["skills"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "06-reflect": {
        "label": "Reflect",
        "crop": (4220, 465, 5045, 1648),
        "flip": False,
        "screens": ["journal"],
        "props": True,
        "waist_ratio": 0.72,
        "focal": [0.50, 0.22]
    },
    "07-challenge": {
        "label": "Challenge",
        "crop": (35, 1945, 835, 2985),
        "flip": False,
        "screens": ["spare"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "08-decide": {
        "label": "Decide",
        "crop": (1050, 1945, 1460, 3010),
        "flip": False,
        "screens": ["spare"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "09-walk": {
        "label": "Walk",
        "crop": (1730, 1945, 2330, 3015),
        "flip": False,
        "screens": ["quests"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "10-welcome": {
        "label": "Welcome",
        "crop": (2530, 1940, 3295, 3015),
        "flip": False,
        "screens": ["home"],
        "props": False,
        "waist_ratio": 0.62,
        "focal": [0.48, 0.16]
    },
    "11-investigate": {
        "label": "Investigate",
        "crop": (3490, 1940, 4050, 3010),
        "flip": False,
        "screens": ["words"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    },
    "12-victory": {
        "label": "Victory",
        "crop": (4325, 1940, 4880, 3015),
        "flip": False,
        "screens": ["victory", "milestone"],
        "props": False,
        "waist_ratio": 0.60,
        "focal": [0.50, 0.16]
    }
}


def extract_cutout_5k(crop_rgb, has_props=False):
    """
    Given a cropped RGB numpy array of a 5K pose, cleanly separates the figure
    from the warm off-white background and floor shadow.
    Returns: RGBA PIL Image with anti-aliasing, color de-fringing, and unsharp sharpening.
    """
    h, w, _ = crop_rgb.shape
    float_rgb = crop_rgb.astype(float)

    # 1. Background color sampling (top and outer margins)
    bg_samples = np.vstack([crop_rgb[0, :], crop_rgb[:25, 0], crop_rgb[:25, -1]])
    bg_color = bg_samples.mean(axis=0)

    mean_rgb = float_rgb.mean(axis=2)
    std_rgb = float_rgb.std(axis=2)

    # Background candidates (warm off-white paper)
    is_bg = (mean_rgb > 205) & (std_rgb < 15)

    # Floor shadow candidate in bottom rows
    bottom_start = max(0, h - 90)
    shadow_mask = (mean_rgb > 85) & (mean_rgb <= 205) & (std_rgb < 16)
    is_bg[bottom_start:, :] |= shadow_mask[bottom_start:, :]

    # Flood fill from borders
    border_mask = np.zeros((h, w), dtype=bool)
    border_mask[0, :] = True
    border_mask[-1, :] = True
    border_mask[:, 0] = True
    border_mask[:, -1] = True

    labeled_bg, _ = label(is_bg)
    border_labels = set(labeled_bg[border_mask]) - {0}
    final_bg = np.isin(labeled_bg, list(border_labels))

    # Foreground is inverse
    fg = ~final_bg
    fg = binary_fill_holes(fg)

    # Keep character (and props if present)
    labeled_fg, num_fg = label(fg)
    if num_fg > 1:
        sizes = [np.sum(labeled_fg == i) for i in range(1, num_fg + 1)]
        if has_props:
            max_size = max(sizes)
            fg = np.isin(labeled_fg, [i + 1 for i, s in enumerate(sizes) if s > max_size * 0.05])
        else:
            largest = np.argmax(sizes) + 1
            fg = (labeled_fg == largest)

    # Tight crop to foreground bounds
    y_indices, x_indices = np.where(fg)
    if len(y_indices) == 0:
        raise ValueError("No foreground detected in crop!")

    min_y, max_y = y_indices.min(), y_indices.max()
    min_x, max_x = x_indices.min(), x_indices.max()

    p_min_y = max(0, min_y - 4)
    p_max_y = min(h, max_y + 6)
    p_min_x = max(0, min_x - 4)
    p_max_x = min(w, max_x + 6)

    fg_tight = fg[p_min_y:p_max_y, p_min_x:p_max_x]
    rgb_tight = float_rgb[p_min_y:p_max_y, p_min_x:p_max_x]
    th, tw = fg_tight.shape

    # 2. Feather alpha edge
    alpha = gaussian_filter(fg_tight.astype(float), sigma=1.0)
    alpha = np.clip((alpha - 0.15) / 0.75, 0.0, 1.0)

    # 3. De-fringe: unmix background color
    de_fringed = rgb_tight.copy()
    edge_mask = (alpha > 0.03) & (alpha < 0.97)
    for c in range(3):
        de_fringed[edge_mask, c] = (
            rgb_tight[edge_mask, c] - (1.0 - alpha[edge_mask]) * bg_color[c]
        ) / alpha[edge_mask]

    de_fringed = np.clip(de_fringed, 0, 255).astype(np.uint8)

    # 4. Subtle unsharp mask on RGB to preserve crisp coat & splatter details
    rgb_pil = Image.fromarray(de_fringed)
    sharpened_pil = rgb_pil.filter(ImageFilter.UnsharpMask(radius=1.5, percent=125, threshold=3))

    rgba = np.zeros((th, tw, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.array(sharpened_pil)
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)

    return Image.fromarray(rgba)


def generate_mask(fg_image_at_size, dilation_radius=8):
    """Generates an 8px dilated silhouette mask for high-contrast ivory outline."""
    alpha = np.array(fg_image_at_size)[:, :, 3]
    binary_fg = alpha > 80

    y_g, x_g = np.ogrid[-dilation_radius:dilation_radius+1, -dilation_radius:dilation_radius+1]
    struct = (x_g * x_g + y_g * y_g) <= (dilation_radius * dilation_radius)
    dilated = binary_dilation(binary_fg, structure=struct)

    mask_rgba = np.zeros((fg_image_at_size.height, fg_image_at_size.width, 4), dtype=np.uint8)
    mask_rgba[:, :, :3] = 255
    mask_rgba[:, :, 3] = (dilated * 255).astype(np.uint8)

    return Image.fromarray(mask_rgba)


def process_pose_5k(source_arr, pid, p_cfg, out_dir):
    print(f"Processing 5K pose: {pid} ({p_cfg['label']})...")
    x1, y1, x2, y2 = p_cfg["crop"]
    crop_rgb = source_arr[y1:y2, x1:x2]

    cutout = extract_cutout_5k(crop_rgb, has_props=p_cfg.get("props", False))
    if p_cfg.get("flip", False):
        cutout = cutout.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    os.makedirs(out_dir, exist_ok=True)

    # 1. Full Body Master: 2000px tall
    aspect = cutout.width / cutout.height
    master_h = 2000
    master_w = int(master_h * aspect)
    master_img = cutout.resize((master_w, master_h), Image.Resampling.LANCZOS)
    master_path = os.path.join(out_dir, "figure.webp")
    master_img.save(master_path, "WEBP", quality=95)

    # 2. Full Body Display Variant: 1200px tall
    display_h = 1200
    display_w = int(display_h * aspect)
    display_img = cutout.resize((display_w, display_h), Image.Resampling.LANCZOS)
    display_path = os.path.join(out_dir, "figure@1080.webp")
    display_img.save(display_path, "WEBP", quality=92)

    # 3. Full Body 8px Dilated Mask
    mask_img = generate_mask(display_img, dilation_radius=8)
    mask_path = os.path.join(out_dir, "mask.webp")
    mask_img.save(mask_path, "WEBP", quality=90)

    # 4. Dynamic Zoom Waist Crop: top waist_ratio (typically 60-65% height)
    waist_ratio = p_cfg.get("waist_ratio", 0.60)
    w_crop_h = int(cutout.height * waist_ratio)
    waist_cutout = cutout.crop((0, 0, cutout.width, w_crop_h))
    w_aspect = waist_cutout.width / waist_cutout.height
    w_target_h = 1200
    w_target_w = int(w_target_h * w_aspect)
    waist_img = waist_cutout.resize((w_target_w, w_target_h), Image.Resampling.LANCZOS)
    waist_path = os.path.join(out_dir, "figure_waist.webp")
    waist_img.save(waist_path, "WEBP", quality=94)

    # 5. Waist 8px Dilated Mask
    mask_waist = generate_mask(waist_img, dilation_radius=8)
    mask_waist_path = os.path.join(out_dir, "mask_waist.webp")
    mask_waist.save(mask_waist_path, "WEBP", quality=90)

    # 6. QA Composites on Obsidian & Ivory
    qa_dir = os.path.join(out_dir, "qa")
    os.makedirs(qa_dir, exist_ok=True)
    for bg_name, color in [("obsidian", (10, 10, 10)), ("ivory", (242, 239, 230))]:
        comp = Image.new("RGBA", (w_target_w, w_target_h), (*color, 255))
        mask_tint = Image.new("RGBA", (w_target_w, w_target_h), (242, 239, 230, 255))
        comp.paste(mask_tint, (0, 0), mask_waist)
        comp.paste(waist_img, (0, 0), waist_img)
        comp.convert("RGB").save(os.path.join(qa_dir, f"qa_waist_{bg_name}.png"))

    print(f"  -> Extracted {pid}: Full ({master_w}x{master_h}) & Waist Zoom ({w_target_w}x{w_target_h})")


def main():
    parser = argparse.ArgumentParser(description="Extract 5K hero character poses for CANT Atlus UI")
    parser.add_argument("--pose", default="all", help="Pose ID to extract (e.g. 10-welcome, or 'all')")
    args = parser.parse_args()

    src_file = SOURCE_5K if os.path.exists(SOURCE_5K) else SOURCE_FALLBACK
    print(f"Using source image: {src_file}")

    source_img = Image.open(src_file).convert("RGB")
    source_arr = np.array(source_img)

    poses_to_run = POSES_5K.keys() if args.pose == "all" else [args.pose]
    manifest = {}
    manifest_path = os.path.join(OUTPUT_BASE, "manifest.json")

    for pid in poses_to_run:
        if pid not in POSES_5K:
            print(f"Unknown pose: {pid}. Available: {list(POSES_5K.keys())}")
            continue

        p_cfg = POSES_5K[pid]
        out_dir = os.path.join(OUTPUT_BASE, pid)
        process_pose_5k(source_arr, pid, p_cfg, out_dir)

        manifest[pid] = {
            "label": p_cfg["label"],
            "flip": p_cfg.get("flip", False),
            "crops": {
                "full": {"anchor": [0.5, 1.0], "scale": 1.00},
                "waist": {"anchor": [0.5, 0.55], "scale": 1.35},
                "bust": {"anchor": [0.5, 0.30], "scale": 1.90}
            },
            "focal": p_cfg.get("focal", [0.5, 0.16]),
            "screens": p_cfg.get("screens", []),
            "props": p_cfg.get("props", False),
            "source": "5k_master"
        }

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest successfully updated with 5K assets at {manifest_path}")


if __name__ == "__main__":
    main()
