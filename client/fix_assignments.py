with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/AssignmentsTab.tsx", "r") as f:
    text = f.read()

text = text.replace("submissions.filter(s => s.graded)", "submissions.filter((s: any) => s.graded)")
text = text.replace("graded.map(sub => sub.grade || 0)", "graded.map((sub: any) => sub.grade || 0)")

with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/AssignmentsTab.tsx", "w") as f:
    f.write(text)
