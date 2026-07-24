import re
import os

filepath = "page.tsx"
with open(filepath, "r") as f:
    content = f.read()

# Remove tasks and grading from tab menu
content = content.replace("...(isStudent ? ['tasks'] : []), ...(!isStudent ? ['grading'] : [])", "")
content = content.replace(" : tab === 'tasks' ? 'Pending Tasks' : tab === 'grading' ? 'Pending Grading'", "")

# Write back
with open(filepath, "w") as f:
    f.write(content)
