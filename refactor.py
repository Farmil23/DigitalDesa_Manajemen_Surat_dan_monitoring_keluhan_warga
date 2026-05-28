import os

base_dir = r"d:\LIFE\_KULIAH_ITENAS_\SEMESTER 4\PRAK PBO\PERTEMUAN 13\DesaDigital\src\main\java\com\DigitalVillageHub\demo"

replacements = {
    "package com.DigitalVillageHub.demo.entity;": "package com.DigitalVillageHub.demo.model.entity;",
    "import com.DigitalVillageHub.demo.entity.": "import com.DigitalVillageHub.demo.model.entity.",
    "package com.DigitalVillageHub.demo.dto;": "package com.DigitalVillageHub.demo.model.dto;",
    "import com.DigitalVillageHub.demo.dto.": "import com.DigitalVillageHub.demo.model.dto.",
    "package com.DigitalVillageHub.demo.repository;": "package com.DigitalVillageHub.demo.persistence;",
    "import com.DigitalVillageHub.demo.repository.": "import com.DigitalVillageHub.demo.persistence."
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".java"):
            process_file(os.path.join(root, file))

print("Done.")
