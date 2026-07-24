import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_modals/CourseModals.tsx"
with open(filepath, "r") as f:
    text = f.read()

text = text.replace("import { X, UploadCloud, FileUp, Sparkles, AlertCircle, Clock, CheckCircle2, ChevronRight, FileText, CheckCircle, Video, Plus }", "import { X, UploadCloud, FileUp, Sparkles, AlertCircle, Clock, CheckCircle2, ChevronRight, FileText, CheckCircle, Video, Plus, Trash2 }")
text = text.replace("courseFaculty.map(f =>", "courseFaculty.map((f: any) =>")
text = text.replace("instituteStudents.map((stud) =>", "instituteStudents.map((stud: any) =>")
text = text.replace("students.some(s =>", "students.some((s: any) =>")
text = text.replace("selectedStudentIds.filter(id =>", "selectedStudentIds.filter((id: any) =>")
text = text.replace("instituteFaculty.map((fac) =>", "instituteFaculty.map((fac: any) =>")
text = text.replace("courseFaculty.some(f =>", "courseFaculty.some((f: any) =>")
text = text.replace("selectedFacultyIds.filter(id =>", "selectedFacultyIds.filter((id: any) =>")
text = text.replace("quizQuestions.map((q, idx) =>", "quizQuestions.map((q: any, idx: number) =>")
text = text.replace("quizQuestions.filter((_, qIdx) =>", "quizQuestions.filter((_: any, qIdx: number) =>")
text = text.replace("quizAnswers.find(a =>", "quizAnswers.find((a: any) =>")
text = text.replace("file.name", "(file as any).name")
text = text.replace("file.size", "(file as any).size")

with open(filepath, "w") as f:
    f.write(text)

print("Fixed implicit any 2 in CourseModals.tsx")
