import os
import re

def check_imports(directory):
    files_dict = {}
    for root, dirs, files in os.walk(directory):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, directory)
            files_dict[rel_path] = True
            if rel_path.endswith(".jsx"):
                files_dict[rel_path[:-4]] = True
            elif rel_path.endswith(".js"):
                files_dict[rel_path[:-3]] = True
            elif rel_path.endswith(".css"):
                files_dict[rel_path[:-4]] = True

    errors = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".js") or file.endswith(".jsx"):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                imports = re.findall(r"import\s+.*?from\s+[\"'](.*?)[\"']", content)
                imports += re.findall(r"import\s+[\"'](.*?)[\"']", content)
                for imp in imports:
                    if imp.startswith("."):
                        imp_path = os.path.normpath(os.path.join(os.path.dirname(file_path), imp))
                        rel_imp_path = os.path.relpath(imp_path, directory)
                        found = False
                        for ext in ["", ".jsx", ".js", ".css", "/index.js", "/index.jsx"]:
                            if (rel_imp_path + ext) in files_dict:
                                found = True
                                break
                        if not found:
                            errors.append(f"{file}: Invalid or case-mismatched import: {imp}")
    return errors

errors = check_imports("/Users/shriyanshchandra/Coding/Projects/Project 1/book-seller/src")
if errors:
    print("Found case-sensitive import errors:")
    for e in errors:
        print(e)
else:
    print("No case-sensitive import errors found.")
