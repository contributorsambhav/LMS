import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_modals/CourseModals.tsx"
with open(filepath, "r") as f:
    text = f.read()

text = re.sub(r'setSessionTopics\(\(prev\) =>', 'setSessionTopics((prev: any) =>', text)
text = re.sub(r'setSessionTopics\(prev =>', 'setSessionTopics((prev: any) =>', text)

text = re.sub(r'setQuizQuestions\(\(prev\) =>', 'setQuizQuestions((prev: any) =>', text)
text = re.sub(r'setQuizQuestions\(prev =>', 'setQuizQuestions((prev: any) =>', text)

text = re.sub(r'setQuizAnswers\(\(prev\) =>', 'setQuizAnswers((prev: any) =>', text)
text = re.sub(r'setQuizAnswers\(prev =>', 'setQuizAnswers((prev: any) =>', text)

text = re.sub(r'setSubjectiveGrades\(\(prev\) =>', 'setSubjectiveGrades((prev: any) =>', text)
text = re.sub(r'setSubjectiveGrades\(prev =>', 'setSubjectiveGrades((prev: any) =>', text)

text = re.sub(r'quizAnswers\.map\(ans =>', 'quizAnswers.map((ans: any) =>', text)
text = re.sub(r'quizQuestions\.map\(\(q, i\) =>', 'quizQuestions.map((q: any, i: number) =>', text)
text = re.sub(r'quizQuestions\.map\(q =>', 'quizQuestions.map((q: any) =>', text)
text = re.sub(r'sessionTopics\.map\(\(t, i\) =>', 'sessionTopics.map((t: any, i: number) =>', text)
text = re.sub(r'sessionTopics\.map\(t =>', 'sessionTopics.map((t: any) =>', text)

with open(filepath, "w") as f:
    f.write(text)

print("Fixed implicit any in CourseModals.tsx")
