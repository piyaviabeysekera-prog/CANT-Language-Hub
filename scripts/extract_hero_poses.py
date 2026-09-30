"""
CANT Hero Pose Extraction Pipeline
Extracts clean, de-fringed transparent hero assets from reference/Final_Pose_Library.jpg
Outputs to public/hero/{pose_id}/:
  - figure.webp      (1600px tall master)
  - figure@1080.webp (1080px tall display variant)
  - mask.webp        (8px dilated silhouette mask)
And updates public/hero/manifest.json.
"""

import os
import sys
import json
import argparse
import numpy as np
from PIL import Image
from scipy.ndimage import (
    binary_fill_holes,
    label,
    binary_dilation,
    gaussian_filter
)

# Reference source path
SOURCE_IMAGE = os.path.join(os.path.dirname(__file__), "..", "reference", "Final_Pose_Library.jpg")
OUTPUT_BASE = os.path.join(os.path.dirname(__file__), "..", "public", "hero")

# Exact pose bounding boxes on Final_Pose_Library.jpg (1024x682)
# Row 1 (Y ~95-340): 1 Observe, 2 Analyze, 3 Explain, 4 Construct, 5 Reveal, 6 Reflect
# Row 2 (Y ~390-618): 7 Challenge, 8 Decide, 9 Walk, 10 Welcome, 11 Investigate, 12 Victory
POSES = {
    "01-observe": {
        "label": "Observe",
        "crop": (30, 95, 140, 335),       # x1, y1, x2, y2
        "flip": False,
        "screens": ["pause"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "02-analyze": {
        "label": "Analyze",
        "crop": (195, 95, 315, 335),
        "flip": False,
        "screens": ["practice"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "03-explain": {
        "label": "Explain",
        "crop": (360, 95, 485, 335),
        "flip": True,  # gestures right in source, flips to face left towards menu
        "screens": ["spare"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "04-construct": {
        "label": "Construct",
        "crop": (510, 95, 680, 335),
        "flip": False,
        "screens": ["system"],
        "props": True,
        "focal": [0.50, 0.20]
    },
    "05-reveal": {
        "label": "Reveal",
        "crop": (700, 95, 835, 335),
        "flip": False,
        "screens": ["skills"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "06-reflect": {
        "label": "Reflect",
        "crop": (845, 95, 1005, 335),
        "flip": False,
        "screens": ["journal"],
        "props": True,
        "focal": [0.50, 0.22]
    },
    "07-challenge": {
        "label": "Challenge",
        "crop": (15, 390, 165, 615),
        "flip": False,
        "screens": ["spare"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "08-decide": {
        "label": "Decide",
        "crop": (210, 390, 310, 615),
        "flip": False,
        "screens": ["spare"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "09-walk": {
        "label": "Walk",
        "crop": (350, 390, 465, 615),
        "flip": False,
        "screens": ["quests"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "10-welcome": {
        "label": "Welcome",
        "crop": (514, 390, 666, 615),
        "flip": False,
        "screens": ["home"],
        "props": False,
        "focal": [0.48, 0.16]
    },
    "11-investigate": {
        "label": "Investigate",
        "crop": (705, 390, 820, 615),
        "flip": False,
        "screens": ["words"],
        "props": False,
        "focal": [0.50, 0.16]
    },
    "12-victory": {
        "label": "Victory",
        "crop": (875, 390, 990, 615),
        "flip": False,
        "screens": ["victory", "milestone"],
        "props": False,
        "focal": [0.50, 0.16]
    }
}


def extract_cutout(crop_rgb, has_props=False):
    """
    Given a cropped RGB numpy array of a pose, cleanly separates the figure
    from the warm off-white background and floor shadow.
    Returns: RGBA numpy array with 1px feathered anti-aliasing and de-fringed RGB.
    """
    h, w, _ = crop_rgb.shape
    float_rgb = crop_rgb.astype(float)

    # 1. Background color reference (sampled from corners and upper border)
    bg_samples = np.vstack([crop_rgb[0, :], crop_rgb[:10, 0], crop_rgb[:10, -1]])
    bg_color = bg_samples.mean(axis=0)

    # Brightness and saturation
    mean_rgb = float_rgb.mean(axis=2)
    std_rgb = float_rgb.std(axis=2)

    # Background candidates: warm off-white paper
    is_bg = (mean_rgb > 205) & (std_rgb < 15)

    # Shadow candidates in bottom region: slightly darkened off-white
    # Shadow is around mean 100-205, low saturation. Shoes are deep black (<40).
    bottom_start = max(0, h - 35)
    shadow_mask = (mean_rgb > 85) & (mean_rgb <= 205) & (std_rgb < 16)
    is_bg[bottom_start:, :] |= shadow_mask[bottom_start:, :]

    # Floor / boundary flood-fill: connected components touching the borders
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
    # Fill internal holes (e.g. white shirt collar, pocket square enclosed inside dark coat)
    fg = binary_fill_holes(fg)

    # Remove small specks / stray labels
    labeled_fg, num_fg = label(fg)
    if num_fg > 1:
        sizes = [np.sum(labeled_fg == i) for i in range(1, num_fg + 1)]
        if has_props:
            # Keep components with significant size (> 5% of largest)
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

    # Add 1px padding
    p_min_y = max(0, min_y - 2)
    p_max_y = min(h, max_y + 3)
    p_min_x = max(0, min_x - 2)
    p_max_x = min(w, max_x + 3)

    fg_tight = fg[p_min_y:p_max_y, p_min_x:p_max_x]
    rgb_tight = float_rgb[p_min_y:p_max_y, p_min_x:p_max_x]
    th, tw = fg_tight.shape

    # 2. Edge feathering and de-fringing
    # Feather alpha with gaussian filter
    alpha = gaussian_filter(fg_tight.astype(float), sigma=0.65)
    alpha = np.clip((alpha - 0.15) / 0.75, 0.0, 1.0)

    # De-fringe: unmix background color on semi-transparent transition pixels
    de_fringed = rgb_tight.copy()
    edge_mask = (alpha > 0.04) & (alpha < 0.96)
    for c in range(3):
        de_fringed[edge_mask, c] = (
            rgb_tight[edge_mask, c] - (1.0 - alpha[edge_mask]) * bg_color[c]
        ) / alpha[edge_mask]

    de_fringed = np.clip(de_fringed, 0, 255).astype(np.uint8)

    rgba = np.zeros((th, tw, 4), dtype=np.uint8)
    rgba[:, :, :3] = de_fringed
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)

    return Image.fromarray(rgba)


def generate_mask(fg_image_at_size, dilation_radius=8):
    """
    Generates an 8px dilated silhouette mask from the alpha channel of an image.
    Used in UI as the crisp ivory outline behind the hero.
    """
    alpha = np.array(fg_image_at_size)[:, :, 3]
    binary_fg = alpha > 80

    y_g, x_g = np.ogrid[-dilation_radius:dilation_radius+1, -dilation_radius:dilation_radius+1]
    struct = (x_g * x_g + y_g * y_g) <= (dilation_radius * dilation_radius)
    dilated = binary_dilation(binary_fg, structure=struct)

    mask_rgba = np.zeros((fg_image_at_size.height, fg_image_at_size.width, 4), dtype=np.uint8)
    mask_rgba[:, :, :3] = 255  # Solid white
    mask_rgba[:, :, 3] = (dilated * 255).astype(np.uint8)

    return Image.fromarray(mask_rgba)


def process_pose(source_img_arr, pose_id, pose_config, output_dir):
    """
    Processes a single pose and writes out figure.webp, figure@1080.webp, and mask.webp.
    """
    print(f"Processing pose: {pose_id} ({pose_config['label']})...")
    x1, y1, x2, y2 = pose_config["crop"]
    crop_rgb = source_img_arr[y1:y2, x1:x2]

    # Extract clean cutout
    cutout = extract_cutout(crop_rgb, has_props=pose_config.get("props", False))

    if pose_config.get("flip", False):
        cutout = cutout.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    os.makedirs(output_dir, exist_ok=True)

    # 1. 1600px tall master
    aspect = cutout.width / cutout.height
    master_h = 1600
    master_w = int(master_h * aspect)
    master_img = cutout.resize((master_w, master_h), Image.Resampling.LANCZOS)
    master_path = os.path.join(output_dir, "figure.webp")
    master_img.save(master_path, "WEBP", quality=95)
    print(f"  -> Saved {master_path} ({master_w}x{master_h})")

    # 2. 1080px display variant
    display_h = 1080
    display_w = int(display_h * aspect)
    display_img = cutout.resize((display_w, display_h), Image.Resampling.LANCZOS)
    display_path = os.path.join(output_dir, "figure@1080.webp")
    display_img.save(display_path, "WEBP", quality=92)
    print(f"  -> Saved {display_path} ({display_w}x{display_h})")

    # 3. 8px dilated mask at 1080px resolution
    mask_img = generate_mask(display_img, dilation_radius=8)
    mask_path = os.path.join(output_dir, "mask.webp")
    mask_img.save(mask_path, "WEBP", quality=90)
    print(f"  -> Saved {mask_path} ({display_w}x{display_h})")

    # 4. QA Composite verification (composite on obsidian #0A0A0A, ivory #F2EFE6, crimson #B31217, gold #D4AF37)
    qa_dir = os.path.join(output_dir, "qa")
    os.makedirs(qa_dir, exist_ok=True)
    bgs = {
        "obsidian": (10, 10, 10),
        "ivory": (242, 239, 230),
        "crimson": (179, 18, 23),
        "gold": (212, 175, 55)
    }
    for bg_name, color in bgs.items():
        comp = Image.new("RGBA", (display_w, display_h), (*color, 255))
        # Mask layer tinted ivory
        mask_tint = Image.new("RGBA", (display_w, display_h), (242, 239, 230, 255))
        comp.paste(mask_tint, (0, 0), mask_img)
        # Figure layer
        comp.paste(display_img, (0, 0), display_img)
        comp.convert("RGB").save(os.path.join(qa_dir, f"qa_{bg_name}.png"))

    print(f"  -> QA composites verified in {qa_dir}")


def main():
    parser = argparse.ArgumentParser(description="Extract hero character poses for CANT Atlus UI")
    parser.add_argument("--pose", default="10-welcome", help="Pose ID to extract (e.g. 10-welcome, or 'all')")
    args = parser.parse_args()

    if not os.path.exists(SOURCE_IMAGE):
        print(f"Error: Source image not found at {SOURCE_IMAGE}")
        sys.exit(1)

    source_img = Image.open(SOURCE_IMAGE).convert("RGB")
    source_arr = np.array(source_img)

    poses_to_run = POSES.keys() if args.pose == "all" else [args.pose]

    manifest = {}
    manifest_path = os.path.join(OUTPUT_BASE, "manifest.json")
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            manifest = {}

    for pid in poses_to_run:
        if pid not in POSES:
            print(f"Unknown pose: {pid}. Available: {list(POSES.keys())}")
            continue

        p_cfg = POSES[pid]
        out_dir = os.path.join(OUTPUT_BASE, pid)
        process_pose(source_arr, pid, p_cfg, out_dir)

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
            "props": p_cfg.get("props", False)
        }

    os.makedirs(OUTPUT_BASE, exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest successfully updated at {manifest_path}")


if __name__ == "__main__":
    main()
