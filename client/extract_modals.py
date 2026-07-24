import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    lines = f.readlines()

# Find state variables
state_vars = []
for line in lines:
    match = re.search(r'const \[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=\s*useState', line)
    if match:
        state_vars.append(match.group(1))
        state_vars.append(match.group(2))

# Also need other variables like: courseId, session, isAdmin, isFaculty, isStudent, router
other_vars = ["courseId", "session", "isAdmin", "isFaculty", "isStudent", "router", "handleUpdateCourse", "handleAddSession", "handleUploadMaterial", "handleEnrollStudents", "handleAssignFaculty", "handleAddLesson", "handleCreateQuiz", "handleUpdateQuiz", "handleStartQuizAttempt", "handleSubmitQuizAttempt", "handleGradeAttempt", "handleAddAssignment", "handleSubmitAssignment", "handleGradeSubmission", "copyToClipboard"]

all_props = state_vars + other_vars

props_jsx = "          <CourseModals\n"
for prop in all_props:
    props_jsx += f"            {prop}={{{prop}}}\n"
props_jsx += "          />"

# Get modals JSX
start_idx = -1
for i, line in enumerate(lines):
    if "{showEditModal && (" in line:
        start_idx = i
        break

end_idx = len(lines) - 4 # before last </div>

modals_jsx = "".join(lines[start_idx:end_idx])

# Create CourseModals.tsx
modals_file_content = f"""import React from 'react';
import {{ X, UploadCloud, FileUp, Sparkles, AlertCircle, Clock, CheckCircle2, ChevronRight, FileText, CheckCircle, Video }} from 'lucide-react';
import {{ API_BASE_URL }} from '../../../../../lib/api';

export default function CourseModals(props: any) {{
  const {{
{chr(10).join([f"    {prop}," for prop in all_props])}
  }} = props;

  return (
    <>
{modals_jsx}
    </>
  );
}}
"""

with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_modals/CourseModals.tsx", "w") as f:
    f.write(modals_file_content)

# Update page.tsx
new_page_lines = lines[:start_idx]
new_page_lines.append(props_jsx + "\n")
new_page_lines.extend(lines[end_idx:])

# add import
new_page_text = "".join(new_page_lines)
new_page_text = new_page_text.replace("import CourseDoubts from '../../../../components/CourseDoubts';", "import CourseDoubts from '../../../../components/CourseDoubts';\nimport CourseModals from './_modals/CourseModals';")

with open(filepath, "w") as f:
    f.write(new_page_text)

print("Modals extracted successfully!")
