#!/usr/bin/env python3
"""
Fix router paths to use explicit full paths like anagrafiche
"""
import re

def fix_router_file(filename, prefix):
    """Fix all router decorators in a file to use explicit paths"""
    with open(f'app/routes/{filename}', 'r') as f:
        content = f.read()

    # Fix @router.METHOD("") -> @router.METHOD("/prefix")
    content = re.sub(r'@router\.(get|post)\s*\(\s*""\s*\)', f'@router.\\1("/{prefix}")', content)

    # Fix @router.METHOD("/{param}") -> @router.METHOD("/prefix/{param}")
    # But only if it doesn't already have the prefix
    def replace_path(match):
        method = match.group(1)
        path = match.group(2)
        # If path starts with /, check if it already has prefix
        if path.startswith(prefix):
            return match.group(0)  # Already has prefix, don't change
        # Add prefix
        return f'@router.{method}("/{prefix}{path}")'

    content = re.sub(r'@router\.(\w+)\s*\(\s*"(/[^"]+)"\s*\)', replace_path, content)

    with open(f'app/routes/{filename}', 'w') as f:
        f.write(content)

    print(f"✅ Fixed {filename} with prefix /{prefix}")

# Fix all router files
fix_router_file('config.py', 'config')
fix_router_file('fasi.py', 'fasi')
fix_router_file('fasi_tipo.py', 'fasi-tipo')

print("\n✅ All router files fixed!")
print("\nVerifying...")

# Verify
for filename, prefix in [('config.py', 'config'), ('fasi.py', 'fasi'), ('fasi_tipo.py', 'fasi-tipo')]:
    with open(f'app/routes/{filename}', 'r') as f:
        for i, line in enumerate(f, 1):
            if '@router.' in line:
                print(f"{filename}:{i}: {line.strip()}")
