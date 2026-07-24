import re

filepaths = [
    "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx",
    "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_modals/CourseModals.tsx"
]

for filepath in filepaths:
    with open(filepath, "r") as f:
        text = f.read()
    
    text = text.replace("handleUploadMaterial={handleUploadMaterial}", "handleAddMaterial={handleAddMaterial}")
    text = text.replace("handleCreateQuiz={handleCreateQuiz}", "handleAddQuiz={handleAddQuiz}")
    text = text.replace("handleUpdateQuiz={handleUpdateQuiz}", "handleEditQuiz={handleEditQuiz}")
    text = text.replace("handleGradeAttempt={handleGradeAttempt}", "handleGradeQuizAttempt={handleGradeQuizAttempt}")

    text = text.replace("handleUploadMaterial,", "handleAddMaterial,")
    text = text.replace("handleCreateQuiz,", "handleAddQuiz,")
    text = text.replace("handleUpdateQuiz,", "handleEditQuiz,")
    text = text.replace("handleGradeAttempt,", "handleGradeQuizAttempt,")
    
    with open(filepath, "w") as f:
        f.write(text)

print("Props fixed.")
