const fs = require('fs');
const filePath = 'src/app/dashboard/courses/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add uploadProgress state
if (!content.includes('const [uploadProgress')) {
  content = content.replace(
    /const \[materialSubmitting, setMaterialSubmitting\] = useState\(false\);/,
    "const [materialSubmitting, setMaterialSubmitting] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState(0);"
  );
}

// 2. Add uploadFileWithProgress helper
const helperCode = `
  const uploadFileWithProgress = (endpoint: string, file: File, token: string, fieldName: string, extraData?: Record<string, string>): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);
      
      const formData = new FormData();
      formData.append(fieldName, file);
      if (courseData?.instituteId) {
        formData.append("instituteId", courseData.instituteId);
      }
      if (extraData) {
        Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch(e) { resolve({}); }
        } else {
          try {
             reject(new Error(JSON.parse(xhr.responseText).message || "Upload failed"));
          } catch(e) { reject(new Error("Upload failed")); }
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  };
`;

if (!content.includes('uploadFileWithProgress = (endpoint: string')) {
  content = content.replace(
    /const forceRefresh = \(\) => {/,
    helperCode + "\n  const forceRefresh = () => {"
  );
}

// 3. Update handleAddMaterial
const oldHandleAddMaterial = /const handleAddMaterial = async \(e: React.FormEvent\) => \{[\s\S]*?finally \{\s*setMaterialSubmitting\(false\);\s*\}\s*\};/;
const newHandleAddMaterial = `const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !courseData) return;
    if (!materialFile) {
      toast.error('Please select a PDF file.');
      return;
    }

    setMaterialError('');
    setMaterialSuccess('');
    setMaterialSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload to stream-service
      const uploadRes = await uploadFileWithProgress('http://localhost:4000/api/upload/document', materialFile, session.token, 'document');
      
      // Step 2: Save to central server
      const payload = {
        title: materialTitle,
        fileUrl: uploadRes.url,
        sizeInBytes: uploadRes.sizeInBytes
      };

      const res = await fetch(\`\${API_BASE_URL}/api/courses/\${courseId}/materials\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${session.token}\` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to upload material.');
      } else {
        toast.success('Material uploaded successfully!');
        setMaterialTitle('');
        setMaterialFile(null);
        forceRefresh();
        setTimeout(() => setShowAddMaterialModal(false), 1200);
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error uploading material.');
    } finally {
      setMaterialSubmitting(false);
      setUploadProgress(0);
    }
  };`;
content = content.replace(oldHandleAddMaterial, newHandleAddMaterial);

// 4. Update handleAddLesson
const oldHandleAddLesson = /const handleAddLesson = async \(e: React.FormEvent\) => \{[\s\S]*?finally \{\s*setLessonCreateSubmitting\(false\);\s*\}\s*\};/;
const newHandleAddLesson = `const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !courseData) return;
    if (!lessonTitle) {
      toast.error('Lesson Title is required.');
      return;
    }

    setLessonCreateSubmitting(true);
    setLessonCreateError('');
    setLessonCreateSuccess('');
    setUploadProgress(0);

    try {
      let fileUrl = "";
      let sizeInBytes = 0;

      if (lessonFile) {
        // Step 1: Upload to stream-service
        const uploadRes = await uploadFileWithProgress('http://localhost:4000/api/upload/video', lessonFile, session.token, 'video', {
          resolution: '1080p' // Optional default
        });
        fileUrl = uploadRes.masterUrl || uploadRes.url;
        sizeInBytes = uploadRes.sizeInBytes || 0;
      }

      // Step 2: Save to central server
      const payload = {
        title: lessonTitle,
        description: lessonDesc,
        duration: lessonDuration,
        fileUrl,
        sizeInBytes
      };

      const res = await fetch(\`\${API_BASE_URL}/api/lessons/courses/\${courseId}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${session.token}\`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to create lesson.');
      } else {
        toast.success('Lesson created successfully! Video will process in the background.');
        setLessonTitle('');
        setLessonDesc('');
        setLessonDuration(0);
        setLessonFile(null);
        forceRefresh();
        setTimeout(() => {
          setShowAddLessonModal(false);
          setLessonCreateSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error occurred.');
    } finally {
      setLessonCreateSubmitting(false);
      setUploadProgress(0);
    }
  };`;
content = content.replace(oldHandleAddLesson, newHandleAddLesson);

// 5. Update handleSubmitAssignment
const oldHandleSubmitAssignment = /const handleSubmitAssignment = async \(e: React.FormEvent\) => \{[\s\S]*?finally \{\s*setAssignmentSubmittingFile\(false\);\s*\}\s*\};/;
const newHandleSubmitAssignment = `const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !selectedAssignment || !assignmentFile || !courseData) {
      toast.error('Please select a PDF file to upload.');
      return;
    }

    setAssignmentSubmittingFile(true);
    setUploadProgress(0);
    try {
      // Step 1: Upload to stream-service
      const uploadRes = await uploadFileWithProgress('http://localhost:4000/api/upload/document', assignmentFile, session.token, 'document');
      
      // Step 2: Save to central server
      const payload = {
        fileUrl: uploadRes.url,
        fileName: assignmentFile.name,
        sizeInBytes: uploadRes.sizeInBytes
      };

      const res = await fetch(\`\${API_BASE_URL}/api/assignments/\${selectedAssignment._id}/submit\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${session.token}\`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Assignment submitted successfully!');
        setShowSubmitAssignmentModal(false);
        setSelectedAssignment(null);
        setAssignmentFile(null);
        forceRefresh();
      } else {
        toast.error(data.message || 'Failed to submit assignment.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error uploading assignment.');
    } finally {
      setAssignmentSubmittingFile(false);
      setUploadProgress(0);
    }
  };`;
content = content.replace(oldHandleSubmitAssignment, newHandleSubmitAssignment);

// 6. Pass uploadProgress to CourseModals
if (!content.includes('uploadProgress={uploadProgress}')) {
  content = content.replace(
    /<CourseModals/g,
    "<CourseModals\n            uploadProgress={uploadProgress}"
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated page.tsx');
