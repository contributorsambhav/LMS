import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    lines = f.readlines()

# Find start and end of Quizzes tab
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* QUIZZES TAB */}" in line:
        start_idx = i
    elif "{/* ASSIGNMENTS TAB */}" in line:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    jsx_lines = lines[start_idx:end_idx]
    
    # We need to wrap it in a component
    # Also find all undeclared variables to create props
    props = [
        "quizzes", "isAdmin", "isFaculty", "isStudent", 
        "selectedQuiz", "setSelectedQuiz", "quizAttempts", 
        "quizAttemptsLoading", "quizAttemptsError", "fetchQuizAttempts", 
        "studentCourseProgress", "setShowAddQuizModal", "setQuizQuestions", 
        "setQuizTitle", "setQuizDesc", "setQuizTimeLimit", 
        "handleOpenEditQuiz", "handleDeleteQuiz", "setShowTakeQuizModal", 
        "setShowViewAttemptsModal", "setShowGradeAttemptModal", "setSelectedAttempt"
    ]
    
    imports = """import React from 'react';
import { Plus, FileQuestion, Clock, FileText, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface QuizzesTabProps {
"""
    for prop in props:
        imports += f"  {prop}: any;\n"
    imports += "}\n\nexport default function QuizzesTab(props: QuizzesTabProps) {\n  const {\n"
    for prop in props:
        imports += f"    {prop},\n"
    imports += "  } = props;\n\n  return (\n"
    
    # We need to strip the condition '{activeTab === 'quizzes' && (' from the first line and ')}' from the last line
    
    jsx_text = "".join(jsx_lines)
    # Removing {activeTab === 'quizzes' && (
    jsx_text = re.sub(r"\{\s*activeTab\s*===\s*'quizzes'\s*&&\s*\(\s*", "", jsx_text)
    # Removing )} at the end
    jsx_text = jsx_text.rstrip()
    if jsx_text.endswith(")}"):
        jsx_text = jsx_text[:-2]
        
    out = imports + jsx_text + "\n  );\n}\n"
    
    with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/QuizzesTab.tsx", "w") as f:
        f.write(out)
    
    print("QuizzesTab extracted!")
