from pathlib import Path
import re
chars = r'\u0080-\u00bf\u20ac\u2018\u2019\u201a\u201c\u201d\u201e\u2013\u2014\u2026\u2122\u2020\u2021\u2022\u2030\u2039\u203a\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc'
pattern = re.compile(r'[\u00c2\u00c3][' + chars + r']|\u00e2[' + chars + r']{2}')
for name in ['src/features/speed.js', 'src/features/calculator.js', 'src/features/builder.js']:
    path = Path(name)
    text = path.read_text(encoding='utf-8')
    def fix(match):
        try:
            return match.group().encode('cp1252').decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            return match.group()
    path.write_text(pattern.sub(fix, text), encoding='utf-8')
