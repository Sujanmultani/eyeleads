import os
import re

root_dir = r"src"

# Regular expression to match sub-11px tailwind classes, e.g., text-[6px] to text-[10.5px]
font_pattern = re.compile(r"text-\[\s*([0-9](\.\d+)?|10(\.\d+)?)\s*px\s*\]")

# Match img tag
img_pattern = re.compile(r"<img\b([^>]*)>", re.IGNORECASE)

print("Starting audit...")

font_matches = {}
img_no_alt_matches = []

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if not file.endswith((".js", ".jsx")):
            continue
        
        file_path = os.path.join(root, file)
        
        # Skip Admin.jsx for font size checks, but include it for img alt checks
        is_admin = "Admin.jsx" in file
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                
            for idx, line in enumerate(lines):
                line_num = idx + 1
                
                # Check font size
                if not is_admin:
                    fonts = font_pattern.findall(line)
                    if fonts:
                        if file_path not in font_matches:
                            font_matches[file_path] = []
                        font_matches[file_path].append((line_num, line.strip()))
                
                # Check image tags
                for match in img_pattern.finditer(line):
                    attributes_str = match.group(1)
                    # Check if 'alt=' is present in attributes
                    if "alt=" not in attributes_str.lower():
                        img_no_alt_matches.append((file_path, line_num, line.strip()))
                        
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

print(f"\nFound {sum(len(v) for v in font_matches.values())} instances of sub-11px text sizes across {len(font_matches)} files:")
for path, matches in font_matches.items():
    print(f"  {path}: {len(matches)} instances")
    for line, content in matches[:3]:
        print(f"    Line {line}: {content[:80]}")

print(f"\nFound {len(img_no_alt_matches)} <img> tags missing 'alt':")
for path, line, content in img_no_alt_matches:
    print(f"  {path}:{line} -> {content[:80]}")
