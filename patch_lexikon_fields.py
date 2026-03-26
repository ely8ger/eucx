#!/usr/bin/env python3
"""Add missing description, published, updated fields to all new LexikonEntries."""
import re

DATA_FILE = "/Users/ki/.openclaw/workspace-anthropic/eucx/apps/web/src/app/insights/data.ts"

with open(DATA_FILE, "r") as f:
    content = f.read()

# For each entry that has shortDef but no description, add the missing fields.
# Pattern: find "    readMin: N," that is NOT preceded by "updated:" in the same entry block.
# Better approach: find all entries between { slug: and }, and check if they have description/published/updated.

# Simple approach: for every occurrence of:
#     readMin: N,
#     sections: [
# that is NOT preceded by "updated:" nearby, insert the missing fields.
# But we need to be careful not to modify AKADEMIE_ARTIKEL entries.

# Strategy: use regex to find entries missing description, published, updated.
# All new entries have pattern:
#   readMin: N,
#   sections: [
# We need to insert before sections:
#   description: "<shortDef value>",
#   published: "2026-03-25",
#   updated: "2026-03-25",

# The LEXIKON array ends at ";  \\nexport const AKADEMIE_ARTIKEL"
# Split at that boundary to only process LEXIKON part
lexikon_end = content.index("\nexexport const AKADEMIE_ARTIKEL") if "\nexexport const AKADEMIE_ARTIKEL" in content else content.index("\nexport const AKADEMIE_ARTIKEL")
lexikon_part = content[:lexikon_end]
rest = content[lexikon_end:]

# Find all entries in lexikon_part that have:
# shortDef: "...",
# but no description: field
# For each such entry, add the three missing fields after readMin line.

def add_missing_fields(text):
    # Pattern: look for entries that have readMin: N,\n    sections: [
    # (meaning no description/published/updated between readMin and sections)
    pattern = re.compile(
        r'(    readMin: (\d+),\n)(    sections: \[)',
        re.MULTILINE
    )

    def replace_match(m):
        before = m.group(1)
        sections_line = m.group(3)
        return before + '    description: "",\n    published: "2026-03-25",\n    updated: "2026-03-25",\n' + sections_line

    return pattern.sub(replace_match, text)

new_lexikon = add_missing_fields(lexikon_part)
new_content = new_lexikon + rest

with open(DATA_FILE, "w") as f:
    f.write(new_content)

print("Patch applied.")
