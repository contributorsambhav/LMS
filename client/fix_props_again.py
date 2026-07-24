filepaths = [
    "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx",
    "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_modals/CourseModals.tsx"
]

for filepath in filepaths:
    with open(filepath, "r") as f:
        text = f.read()
    
    # Remove handleEditQuiz prop
    text = text.replace("            handleEditQuiz={handleEditQuiz}\n", "")
    text = text.replace("    handleEditQuiz,\n", "")
    
    # Add Plus to lucide-react import
    if "CourseModals.tsx" in filepath:
        text = text.replace("import { X, UploadCloud, FileUp, Sparkles, AlertCircle, Clock, CheckCircle2, ChevronRight, FileText, CheckCircle, Video }", "import { X, UploadCloud, FileUp, Sparkles, AlertCircle, Clock, CheckCircle2, ChevronRight, FileText, CheckCircle, Video, Plus }")
    
    with open(filepath, "w") as f:
        f.write(text)

print("Removed handleEditQuiz and imported Plus.")
