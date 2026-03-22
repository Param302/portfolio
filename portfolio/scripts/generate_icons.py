from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
APP = ROOT / "src" / "app"
SOURCE = PUBLIC / "parampreet.png"


def open_source_image() -> Image.Image:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Source image not found: {SOURCE}")
    return Image.open(SOURCE).convert("RGBA")


def make_square_canvas(image: Image.Image, size: int, scale: float = 0.86) -> Image.Image:
    bg = Image.new("RGBA", (size, size), (248, 250, 252, 255))
    max_side = int(size * scale)
    layer = image.copy()
    layer.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    x = (size - layer.width) // 2
    y = (size - layer.height) // 2
    bg.paste(layer, (x, y), layer)
    return bg


def make_og_canvas(image: Image.Image, width: int = 1200, height: int = 630) -> Image.Image:
    bg = Image.new("RGBA", (width, height), (11, 15, 25, 255))
    layer = image.copy()
    layer.thumbnail((int(width * 0.42), int(height * 0.84)),
                    Image.Resampling.LANCZOS)
    x = int(width * 0.1)
    y = (height - layer.height) // 2
    bg.paste(layer, (x, y), layer)
    return bg


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG")


def save_ico(image: Image.Image, path: Path) -> None:
    icon = make_square_canvas(image, 256, scale=0.9)
    icon.save(path, format="ICO", sizes=[
              (16, 16), (32, 32), (48, 48), (64, 64)])


def main() -> None:
    img = open_source_image()

    save_png(make_square_canvas(img, 192), PUBLIC / "icon-192.png")
    save_png(make_square_canvas(img, 512), PUBLIC / "icon-512.png")
    save_png(make_square_canvas(img, 192, scale=0.8),
             PUBLIC / "icon-192-maskable.png")
    save_png(make_square_canvas(img, 512, scale=0.8),
             PUBLIC / "icon-512-maskable.png")
    save_png(make_square_canvas(img, 180), PUBLIC / "apple-touch-icon.png")
    save_png(make_square_canvas(img, 152), PUBLIC / "apple-touch-icon-152.png")

    save_png(make_og_canvas(img, 1200, 630), PUBLIC / "og-image.png")
    save_png(make_square_canvas(img, 1200), PUBLIC / "og-image-square.png")

    save_ico(img, PUBLIC / "favicon.ico")
    save_ico(img, APP / "favicon.ico")

    print("Generated favicon and PWA assets from public/parampreet.png")


if __name__ == "__main__":
    main()
