import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* ASSIGNMENTS TAB */}" in line:
        start_idx = i
    elif "{/* 3. ROSTER TAB */}" in line:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    jsx_lines = lines[start_idx:end_idx]
    
    props = [
        "assignments", "isAdmin", "isFaculty", "isStudent",
        "selectedAssignment", "setSelectedAssignment",
        "setShowAddAssignmentModal", "handleOpenEditAssignment", "handleDeleteAssignment",
        "studentCourseProgress", "setShowSubmitAssignmentModal",
        "assignmentSubmissions", "assignmentSubmissionsLoading",
        "fetchAssignmentSubmissions", "setShowGradeAssignmentModal", "setSelectedSubmission"
    ]
    
    imports = """import React from 'react';
import { Plus, FileQuestion, Clock, FileText, Trash2, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../../../../../lib/api';

interface AssignmentsTabProps {
"""
    for prop in props:
        imports += f"  {prop}: any;\n"
    imports += "}\n\nexport default function AssignmentsTab(props: AssignmentsTabProps) {\n  const {\n"
    for prop in props:
        imports += f"    {prop},\n"
    imports += "  } = props;\n\n  return (\n"
    
    jsx_text = "".join(jsx_lines)
    jsx_text = re.sub(r"\{\s*activeTab\s*===\s*'assignments'\s*&&\s*\(\s*", "", jsx_text)
    
    jsx_text = jsx_text.rstrip()
    if jsx_text.endswith(")}"):
        jsx_text = jsx_text[:-2]
        
    out = imports + jsx_text + "\n  );\n}\n"
    
    with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/AssignmentsTab.tsx", "w") as f:
        f.write(out)
    
    print("AssignmentsTab extracted!")
