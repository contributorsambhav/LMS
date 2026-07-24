with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/RosterTab.tsx", "r") as f:
    text = f.read()

text = text.replace("pendingRequests", "pendingEnrollments")
text = text.replace("  enrolledStudents: any;\n", "")
text = text.replace("    enrolledStudents,\n", "")
text = text.replace("pendingEnrollments.map((req)", "pendingEnrollments.map((req: any)")

with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/RosterTab.tsx", "w") as f:
    f.write(text)

with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "const [activeTab, setActiveTab] = useState<'sessions' | 'materials' | 'lessons' | 'quizzes' | 'assignments' | 'roster' | 'progress' | 'tasks' | 'grading'>('lessons');",
    "const [activeTab, setActiveTab] = useState<'sessions' | 'materials' | 'lessons' | 'quizzes' | 'assignments' | 'roster' | 'progress' | 'tasks' | 'grading' | 'doubts'>('lessons');"
)

with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx", "w") as f:
    f.write(text)

print("Fixed RosterTab and page.tsx types")
