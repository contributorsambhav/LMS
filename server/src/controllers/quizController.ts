import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Quiz, IQuestion } from "../models/Quiz";
import { QuizAttempt } from "../models/QuizAttempt";
import { Course } from "../models/Course";

// Create a new Quiz (Faculty / Admin only)
export const createQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, title, description, testType, timeLimit, deadline, questions, shuffleQuestions, shuffleOptions, hideAnswersUntilDeadline, maxAttempts, scoringPolicy } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!courseId || !title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Missing required fields: courseId, title, questions array." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Verify ownership/institute match
    if (req.user.role !== "SuperAdmin" && course.instituteId.toString() !== req.user.instituteId) {
      return res.status(403).json({ message: "Forbidden: You do not belong to this course's institute." });
    }

    // Determine effective testType (if any question is subjective, testType must be Handgraded)
    const hasSubjectiveQuestion = questions.some((q: any) => q.type === "Subjective");
    const effectiveTestType = hasSubjectiveQuestion ? "Handgraded" : (testType || "Autogradable");

    const newQuiz = new Quiz({
      courseId,
      title,
      description,
      testType: effectiveTestType,
      timeLimit: timeLimit || 0,
      deadline: deadline ? new Date(deadline) : undefined,
      shuffleQuestions: shuffleQuestions || false,
      shuffleOptions: shuffleOptions || false,
      hideAnswersUntilDeadline: hideAnswersUntilDeadline || false,
      maxAttempts: maxAttempts || 1,
      scoringPolicy: scoringPolicy || "latest",
      questions,
      createdBy: req.user.id
    });

    await newQuiz.save();
    return res.status(201).json({ message: "Quiz created successfully.", quiz: newQuiz });
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    return res.status(500).json({ message: "Failed to create quiz.", error: error.message });
  }
};

// Get all quizzes for a course
export const getQuizzesByCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Verify ownership/institute match
    if (req.user.role !== "SuperAdmin" && course.instituteId.toString() !== req.user.instituteId) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    const quizzes = await Quiz.find({ courseId });

    // For students, strip out the correct answer & correctAnswers from the questions object
    const sanitizedQuizzes = quizzes.map((quiz) => {
      const qObj = quiz.toObject();
      if (req.user?.role === "Student") {
        qObj.questions = qObj.questions.map((q: any) => {
          const { correctAnswer, correctAnswers, ...rest } = q;
          return rest;
        });
      }
      return qObj;
    });

    return res.status(200).json(sanitizedQuizzes);
  } catch (error: any) {
    console.error("Error getting quizzes:", error);
    return res.status(500).json({ message: "Failed to fetch quizzes.", error: error.message });
  }
};

// Get single quiz by ID
export const getQuizById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course) {
      return res.status(404).json({ message: "Linked Course not found." });
    }

    // Verify ownership/institute match
    if (req.user.role !== "SuperAdmin" && course.instituteId.toString() !== req.user.instituteId) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    const quizObj = quiz.toObject();

    // If user is student, hide correct answers
    if (req.user.role === "Student") {
      quizObj.questions = quizObj.questions.map((q: any) => {
        const { correctAnswer, correctAnswers, ...rest } = q;
        return rest;
      });
    }

    return res.status(200).json(quizObj);
  } catch (error: any) {
    console.error("Error getting quiz:", error);
    return res.status(500).json({ message: "Failed to fetch quiz.", error: error.message });
  }
};

// Helper to calculate attempt score automatically
export const calculateAttemptScore = (quiz: any, attemptAnswers: any[], subjectiveMarks: { [questionId: string]: number } = {}) => {
  let totalScore = 0;
  let updatedAnswers: any[] = [];

  quiz.questions.forEach((q: any) => {
    const qIdStr = q._id.toString();
    const studentAns = attemptAnswers.find(a => a.questionId.toString() === qIdStr) || { questionId: q._id };
    const negPoints = q.negativePoints || 0;
    let questionScore = 0;

    if (q.type === "MCQ") {
      if (studentAns.answerText !== undefined && studentAns.answerText !== "") {
        if (studentAns.answerText === q.correctAnswer) {
          questionScore = q.points;
        } else if (negPoints > 0) {
          questionScore = -negPoints;
        }
      }
    } else if (q.type === "MultipleMCQ") {
      let studentSelections: string[] = studentAns.selectedOptions || [];
      if (!studentSelections.length && studentAns.answerText) {
        try {
          studentSelections = JSON.parse(studentAns.answerText);
        } catch {
          studentSelections = studentAns.answerText.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      if (studentSelections.length > 0) {
        const correctSelections = (q.correctAnswers || []).map(String);
        studentSelections = studentSelections.map(String);

        const isExactMatch =
          studentSelections.length === correctSelections.length &&
          studentSelections.every(val => correctSelections.includes(val));

        if (isExactMatch) {
          questionScore = q.points;
        } else if (negPoints > 0) {
          questionScore = -negPoints;
        }
      }
    } else if (q.type === "Subjective") {
      let mark = 0;
      if (subjectiveMarks[qIdStr] !== undefined) {
        mark = Number(subjectiveMarks[qIdStr]);
      } else if (studentAns.marksAwarded !== undefined) {
        mark = Number(studentAns.marksAwarded);
      }
      // Clamp marks between 0 and allotted question points
      questionScore = Math.min(q.points, Math.max(0, isNaN(mark) ? 0 : mark));
    }

    totalScore += questionScore;
    updatedAnswers.push({
      questionId: q._id,
      answerText: studentAns.answerText || "",
      selectedOptions: studentAns.selectedOptions || [],
      marksAwarded: questionScore
    });
  });

  return { totalScore: Math.max(0, totalScore), updatedAnswers };
};

// Submit a quiz attempt (Student only)
export const startQuizAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      return res.status(400).json({ message: "Submission window for this quiz has closed." });
    }

    let attempt = await QuizAttempt.findOne({ userId: req.user.id, quizId: id, status: "in_progress" });
    if (!attempt) {
      const existingAttempts = await QuizAttempt.find({ userId: req.user.id, quizId: id, status: "submitted" });
      const maxAttempts = quiz.maxAttempts || 1;
      if (existingAttempts.length >= maxAttempts) {
        return res.status(400).json({ message: `You have reached the maximum allowed attempts (${maxAttempts}) for this quiz.` });
      }

      attempt = new QuizAttempt({
        userId: req.user.id,
        quizId: id,
        status: "in_progress",
        attemptNumber: existingAttempts.length + 1,
        startedAt: new Date(),
        answers: []
      });
      await attempt.save();
    }

    return res.status(200).json({ message: "Quiz attempt started.", attempt });
  } catch (error: any) {
    console.error("Error starting quiz attempt:", error);
    return res.status(500).json({ message: "Failed to start attempt.", error: error.message });
  }
};

export const submitQuizAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // quizId
    const { answers } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Missing answers array." });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Check submission deadline
    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      return res.status(400).json({ message: "Submission window for this quiz has closed." });
    }

    // Require an active in_progress attempt
    const attempt = await QuizAttempt.findOne({ userId: req.user.id, quizId: id, status: "in_progress" });
    if (!attempt) {
      return res.status(400).json({ message: "No active attempt found. Please start the quiz first." });
    }

    // Optional strict backend time limit check
    if (quiz.timeLimit && quiz.timeLimit > 0) {
      const allowedTimeMs = quiz.timeLimit * 60 * 1000 + 15000; // 15s grace period
      const timeTakenMs = Date.now() - attempt.startedAt.getTime();
      if (timeTakenMs > allowedTimeMs) {
        // Technically over time, but we still accept the answers they managed to send 
        // to avoid data loss. We could truncate answers here if we wanted to be extremely strict.
      }
    }

    const { totalScore, updatedAnswers } = calculateAttemptScore(quiz, answers);
    const hasSubjective = quiz.questions.some((q: any) => q.type === "Subjective");
    const graded = quiz.testType === "Autogradable" || !hasSubjective;

    attempt.answers = updatedAnswers;
    attempt.score = totalScore;
    attempt.graded = graded;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    await attempt.save();
    return res.status(201).json({
      message: graded 
        ? `Quiz submitted. Auto-graded score: ${totalScore}`
        : `Quiz submitted successfully. Auto-graded MCQs score: ${totalScore}. Subjective answers pending teacher grading.`,
      attempt
    });
  } catch (error: any) {
    console.error("Error submitting quiz attempt:", error);
    return res.status(500).json({ message: "Failed to submit attempt.", error: error.message });
  }
};

// Get attempts for a quiz (Student gets their own, Faculty/Admin gets all)
export const getQuizAttempts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // quizId
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    let query: any = { quizId: id };

    if (req.user.role === "Student") {
      query.userId = req.user.id;
    }

    const attempts = await QuizAttempt.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(attempts);
  } catch (error: any) {
    console.error("Error getting quiz attempts:", error);
    return res.status(500).json({ message: "Failed to fetch attempts.", error: error.message });
  }
};

// Update existing Quiz (Faculty / Admin only) - Recalculates scores for all attempts
export const updateQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, testType, timeLimit, deadline, questions, shuffleQuestions, shuffleOptions, hideAnswersUntilDeadline, maxAttempts, scoringPolicy } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (req.user.role !== "SuperAdmin" && course.instituteId.toString() !== req.user.instituteId) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (deadline !== undefined) quiz.deadline = deadline ? new Date(deadline) : undefined;
    if (shuffleQuestions !== undefined) quiz.shuffleQuestions = shuffleQuestions;
    if (shuffleOptions !== undefined) quiz.shuffleOptions = shuffleOptions;
    if (hideAnswersUntilDeadline !== undefined) quiz.hideAnswersUntilDeadline = hideAnswersUntilDeadline;
    if (maxAttempts !== undefined) quiz.maxAttempts = maxAttempts;
    if (scoringPolicy !== undefined) quiz.scoringPolicy = scoringPolicy;
    
    if (questions && Array.isArray(questions)) {
      const hasSubjectiveQuestion = questions.some((q: any) => q.type === "Subjective");
      quiz.testType = hasSubjectiveQuestion ? "Handgraded" : (testType || quiz.testType);
      quiz.questions = questions;
    } else if (testType) {
      quiz.testType = testType;
    }

    await quiz.save();

    // Re-grade all existing attempts automatically using updated answer key / question settings
    const attempts = await QuizAttempt.find({ quizId: id });
    for (const attempt of attempts) {
      const subjectiveMarks: { [qId: string]: number } = {};
      attempt.answers.forEach((ans: any) => {
        const q = quiz.questions.find((quest: any) => quest._id.toString() === ans.questionId.toString());
        if (q && q.type === "Subjective" && ans.marksAwarded !== undefined) {
          subjectiveMarks[q._id.toString()] = ans.marksAwarded;
        }
      });

      const { totalScore, updatedAnswers } = calculateAttemptScore(quiz, attempt.answers, subjectiveMarks);
      attempt.score = totalScore;
      attempt.answers = updatedAnswers;
      await attempt.save();
    }

    return res.status(200).json({ message: "Quiz updated and existing attempts re-evaluated successfully.", quiz });
  } catch (error: any) {
    console.error("Error updating quiz:", error);
    return res.status(500).json({ message: "Failed to update quiz.", error: error.message });
  }
};

// Grade a quiz attempt (Faculty / Admin only)
export const gradeQuizAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { subjectiveGrades, feedback } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found for this attempt." });
    }

    const { totalScore, updatedAnswers } = calculateAttemptScore(quiz, attempt.answers, subjectiveGrades || {});

    attempt.score = totalScore;
    attempt.answers = updatedAnswers;
    attempt.feedback = feedback;
    attempt.graded = true;
    attempt.gradedBy = req.user.id as any;

    await attempt.save();
    return res.status(200).json({ message: "Attempt graded successfully.", attempt });
  } catch (error: any) {
    console.error("Error grading quiz attempt:", error);
    return res.status(500).json({ message: "Failed to grade attempt.", error: error.message });
  }
};

// Delete Quiz
export const deleteQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Clean up attempts
    await QuizAttempt.deleteMany({ quizId: id });
    await Quiz.findByIdAndDelete(id);

    return res.status(200).json({ message: "Quiz deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    return res.status(500).json({ message: "Failed to delete quiz.", error: error.message });
  }
};

// Analytics for Quiz
export const getQuizAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user || (req.user.role !== "Faculty" && req.user.role !== "SuperAdmin" && req.user.role !== "InstituteAdmin")) {
      return res.status(403).json({ message: "Forbidden: Only faculty/admins can view analytics." });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    
    const attempts = await QuizAttempt.find({ quizId: id });
    
    let totalScoreSum = 0;
    let highestScore = 0;
    let lowestScore = 999999;
    let passedCount = 0;
    
    const userAttemptsMap = new Map<string, any[]>();
    attempts.forEach(attempt => {
      const uStr = attempt.userId.toString();
      if (!userAttemptsMap.has(uStr)) userAttemptsMap.set(uStr, []);
      userAttemptsMap.get(uStr)!.push(attempt);
    });

    const finalScores: number[] = [];
    let passThreshold = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0) * 0.4;
    
    userAttemptsMap.forEach((userAtts) => {
      let finalScore = 0;
      if (quiz.scoringPolicy === "average") {
        finalScore = userAtts.reduce((sum, a) => sum + a.score, 0) / userAtts.length;
      } else if (quiz.scoringPolicy === "latest") {
        const latest = userAtts.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0];
        finalScore = latest.score;
      } else {
        finalScore = Math.max(...userAtts.map(a => a.score));
      }
      finalScores.push(finalScore);
      
      if (finalScore > highestScore) highestScore = finalScore;
      if (finalScore < lowestScore) lowestScore = finalScore;
      if (finalScore >= passThreshold) passedCount++;
      totalScoreSum += finalScore;
    });

    if (finalScores.length === 0) lowestScore = 0;

    const classAverage = finalScores.length > 0 ? totalScoreSum / finalScores.length : 0;
    const passRate = finalScores.length > 0 ? (passedCount / finalScores.length) * 100 : 0;

    const questionDifficulty = quiz.questions.map((q: any) => {
      let correctCount = 0;
      let totalCount = 0;
      attempts.forEach(attempt => {
        const ans = attempt.answers.find((a: any) => a.questionId.toString() === q._id.toString());
        if (ans) {
          totalCount++;
          if (q.type === "Subjective") {
             if ((ans.marksAwarded ?? 0) >= q.points * 0.5) correctCount++;
          } else {
             if ((ans.marksAwarded ?? 0) > 0) correctCount++; 
          }
        }
      });
      
      return {
        questionId: q._id,
        questionText: q.questionText,
        correctRate: totalCount > 0 ? (correctCount / totalCount) * 100 : 0
      };
    });

    return res.status(200).json({
      totalStudents: finalScores.length,
      classAverage,
      highestScore,
      lowestScore,
      passRate,
      questionDifficulty
    });
  } catch (error: any) {
    console.error("Error generating analytics:", error);
    return res.status(500).json({ message: "Failed to generate analytics.", error: error.message });
  }
};
