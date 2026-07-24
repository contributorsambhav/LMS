import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    text = f.read()

text = re.sub(r"        \{\/\* PENDING TASKS TAB \*\/\}\n        \{activeTab === 'tasks'.*?\/>\n        \)\}\n\n", "", text, flags=re.DOTALL)
text = re.sub(r"        \{\/\* PENDING GRADING TAB \(FACULTY\) \*\/\}\n        \{activeTab === 'grading'.*?\/>\n        \)\}\n\n", "", text, flags=re.DOTALL)

with open(filepath, "w") as f:
    f.write(text)

print("Tasks and Grading tabs removed correctly.")
