import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* 3. ROSTER TAB */}" in line:
        start_idx = i
    elif "{/* 4. PROGRESS / ANALYTICS TAB */}" in line:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    jsx_lines = lines[start_idx:end_idx]
    
    props = [
        "enrolledStudents", "isAdmin", "isFaculty", "course",
        "setShowAddStudentModal", "handleRemoveStudent", "setShowAssignFacultyModal", "handleRemoveFaculty"
    ]
    
    imports = """import React from 'react';
import { Users, UserCheck, UserMinus, Plus, Mail } from 'lucide-react';

interface RosterTabProps {
"""
    for prop in props:
        imports += f"  {prop}: any;\n"
    imports += "}\n\nexport default function RosterTab(props: RosterTabProps) {\n  const {\n"
    for prop in props:
        imports += f"    {prop},\n"
    imports += "  } = props;\n\n  return (\n"
    
    jsx_text = "".join(jsx_lines)
    jsx_text = re.sub(r"\{\s*activeTab\s*===\s*'roster'\s*&&\s*\(\s*", "", jsx_text)
    
    jsx_text = jsx_text.rstrip()
    if jsx_text.endswith(")}"):
        jsx_text = jsx_text[:-2]
        
    out = imports + jsx_text + "\n  );\n}\n"
    
    with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/RosterTab.tsx", "w") as f:
        f.write(out)
    
    print("RosterTab extracted!")
