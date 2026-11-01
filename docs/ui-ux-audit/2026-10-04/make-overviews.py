from pathlib import Path
from PIL import Image, ImageDraw
import json

base = Path(__file__).parent
rows = json.loads((base / 'coverage.json').read_text(encoding='utf-8'))
for group in ['account', 'learner', 'teacher']:
    routes = list(dict.fromkeys(row['route'] for row in rows if row['group'] == group))
    for start in range(0, len(routes), 2):
        panels = []
        for route in routes[start:start + 2]:
            panel = Image.new('RGB', (1060, 2150), '#dbe4e8')
            ImageDraw.Draw(panel).text((12, 12), route, fill='black')
            for width, x, maximum in [(1440, 0, 690), (375, 700, 350)]:
                row = next((row for row in rows if row['route'] == route and row['width'] == width), None)
                if row:
                    shot = Image.open(base / (row['name'] + '.png')).convert('RGB')
                    shot.thumbnail((maximum, 2075))
                    panel.paste(shot, (x, 45))
            panels.append(panel)
        overview = Image.new('RGB', (1060 * len(panels), 2150), '#dbe4e8')
        for index, panel in enumerate(panels):
            overview.paste(panel, (index * 1060, 0))
        overview.save(base / f'overview-{group}-{start // 2 + 1}.jpg', quality=90)
