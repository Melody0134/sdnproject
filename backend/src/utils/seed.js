const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const { mongoUri } = require('../config/env');
const { UPLOADS_ROOT, datedSubdir, publicUrlFor } = require('./uploads');
const {
  User,
  Team,
  JoinRequest,
  TeamResource,
  TeamMessage,
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
  Material,
  Quiz,
  QuizAttempt,
  Assignment,
  Submission,
  Announcement,
  Post,
  Comment,
  Notification,
} = require('../models');
const {
  DEFAULT_PASSWORD,
  admins,
  lecturers,
  clubLeaders,
  students,
  courses,
  materialTemplates,
  teamTemplates,
  joinRequestTemplates,
  announcementTemplates,
  postTemplates,
  quizTemplates,
  enrollmentTemplates,
  lessonTemplates,
  lessonProgressTemplates,
  assignmentTemplates,
  submissionTemplates,
  commentTemplates,
  teamMessageTemplates,
  quizAttemptTemplates,
} = require('./seed-data');

const clearCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    JoinRequest.deleteMany({}),
    TeamResource.deleteMany({}),
    TeamMessage.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    Lesson.deleteMany({}),
    LessonProgress.deleteMany({}),
    Material.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({}),
    Announcement.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
};

const seedUsers = async () => {
  const definitions = [...admins, ...lecturers, ...clubLeaders, ...students];
  const usersByEmail = new Map();
  for (const definition of definitions) {
    const user = await User.create({ ...definition, password: DEFAULT_PASSWORD });
    usersByEmail.set(user.email, user);
  }
  return usersByEmail;
};

const seedCourses = async (usersByEmail) => {
  const coursesByCode = new Map();
  for (const course of courses) {
    const lecturer = usersByEmail.get(course.lecturerEmail);
    const created = await Course.create({
      code: course.code,
      title: course.title,
      description: course.description,
      semester: course.semester,
      lecturer: lecturer._id,
    });
    coursesByCode.set(created.code, created);
  }
  return coursesByCode;
};

const seedEnrollments = async (usersByEmail, coursesByCode) => {
  for (const template of enrollmentTemplates) {
    const student = usersByEmail.get(template.studentEmail);
    if (!student) continue;
    for (const code of template.courseCodes) {
      const course = coursesByCode.get(code);
      if (!course) continue;
      await Enrollment.create({ course: course._id, student: student._id });
    }
  }
};

const seedMaterials = async (usersByEmail, coursesByCode) => {
  const materialsByTitle = new Map();
  for (const template of materialTemplates) {
    const course = coursesByCode.get(template.courseCode);
    if (!course) continue;
    const dir = path.join(UPLOADS_ROOT, datedSubdir());
    await fs.mkdir(dir, { recursive: true });
    const storedName = `${crypto.randomBytes(16).toString('hex')}${path.extname(template.fileName)}`;
    const filePath = path.join(dir, storedName);
    await fs.writeFile(filePath, template.text, 'utf-8');
    const material = await Material.create({
      course: course._id,
      title: template.title,
      description: template.description,
      fileUrl: publicUrlFor({ path: filePath }),
      storagePath: filePath,
      fileName: template.fileName,
      mimeType: 'text/plain',
      size: Buffer.byteLength(template.text, 'utf-8'),
      uploadedBy: course.lecturer,
    });
    material.fileUrl = `/api/materials/${material._id}/download`;
    await material.save();
    materialsByTitle.set(material.title, material);
  }
  return materialsByTitle;
};

const seedQuizzes = async (usersByEmail, coursesByCode) => {
  const quizzesByTitle = new Map();
  for (const template of quizTemplates) {
    const creator = usersByEmail.get(template.creatorEmail);
    const course = coursesByCode.get(template.courseCode);
    const quiz = await Quiz.create({
      title: template.title,
      course: course ? course._id : null,
      createdBy: creator._id,
      questions: template.questions,
    });
    quizzesByTitle.set(quiz.title, quiz);
  }
  return quizzesByTitle;
};

const sameSet = (a, b) => {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((value) => set.has(value));
};

const seedQuizAttempts = async (usersByEmail, quizzesByTitle) => {
  for (const template of quizAttemptTemplates) {
    const quiz = quizzesByTitle.get(template.quizTitle);
    const student = usersByEmail.get(template.studentEmail);
    if (!quiz || !student) continue;

    const wrongSet = new Set(template.wrongQuestionIndexes);
    const answers = quiz.questions.map((question, index) => {
      if (!wrongSet.has(index)) return [...question.correctIndexes];
      const wrongOption = question.options.findIndex((_, oIndex) => !question.correctIndexes.includes(oIndex));
      return [wrongOption >= 0 ? wrongOption : 0];
    });
    const score = quiz.questions.reduce(
      (sum, question, index) => sum + (sameSet(answers[index], question.correctIndexes) ? 1 : 0),
      0
    );

    await QuizAttempt.create({
      quiz: quiz._id,
      student: student._id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
    });
  }
};

const seedLessons = async (usersByEmail, coursesByCode, materialsByTitle, quizzesByTitle) => {
  const lessonsByKey = new Map();
  for (const template of lessonTemplates) {
    const course = coursesByCode.get(template.courseCode);
    if (!course) continue;
    const materials = (template.materialTitles || [])
      .map((title) => materialsByTitle.get(title)?._id)
      .filter(Boolean);
    const quiz = template.quizTitle ? quizzesByTitle.get(template.quizTitle)?._id || null : null;
    const lesson = await Lesson.create({
      course: course._id,
      title: template.title,
      content: template.content,
      order: template.order,
      materials,
      quiz,
      createdBy: course.lecturer,
    });
    lessonsByKey.set(`${template.courseCode}:${template.order}`, lesson);
  }
  return lessonsByKey;
};

const seedLessonProgress = async (usersByEmail, coursesByCode, lessonsByKey) => {
  for (const template of lessonProgressTemplates) {
    const student = usersByEmail.get(template.studentEmail);
    const course = coursesByCode.get(template.courseCode);
    if (!student || !course) continue;
    for (const order of template.completedOrders) {
      const lesson = lessonsByKey.get(`${template.courseCode}:${order}`);
      if (!lesson) continue;
      await LessonProgress.create({
        lesson: lesson._id,
        course: course._id,
        student: student._id,
      });
    }
  }
};

const seedAssignments = async (coursesByCode) => {
  const assignmentsByTitle = new Map();
  for (const template of assignmentTemplates) {
    const course = coursesByCode.get(template.courseCode);
    if (!course) continue;
    const assignment = await Assignment.create({
      course: course._id,
      title: template.title,
      description: template.description,
      dueDate: template.dueDate ? new Date(template.dueDate) : null,
      maxScore: template.maxScore,
      createdBy: course.lecturer,
    });
    assignmentsByTitle.set(assignment.title, assignment);
  }
  return assignmentsByTitle;
};

const seedSubmissions = async (usersByEmail, assignmentsByTitle) => {
  for (const template of submissionTemplates) {
    const assignment = assignmentsByTitle.get(template.assignmentTitle);
    const student = usersByEmail.get(template.studentEmail);
    if (!assignment || !student) continue;
    const graded = template.score != null;
    await Submission.create({
      assignment: assignment._id,
      student: student._id,
      content: template.content,
      status: graded ? 'graded' : 'submitted',
      score: graded ? template.score : null,
      feedback: template.feedback || '',
      gradedBy: graded ? assignment.createdBy : null,
      gradedAt: graded ? new Date() : null,
      submittedAt: new Date(),
    });
  }
};

const seedTeams = async (usersByEmail) => {
  const teamsByName = new Map();
  for (const template of teamTemplates) {
    const leader = usersByEmail.get(template.leaderEmail);
    const members = [{ user: leader._id, role: 'leader' }];
    for (const email of template.memberEmails) {
      const member = usersByEmail.get(email);
      if (member) members.push({ user: member._id, role: 'member' });
    }
    const team = await Team.create({
      name: template.name,
      description: template.description,
      topic: template.topic,
      major: template.major,
      skillsNeeded: template.skillsNeeded,
      maxMembers: template.maxMembers,
      leader: leader._id,
      members,
    });
    team.syncStatus();
    await team.save();
    teamsByName.set(team.name, team);
  }
  return teamsByName;
};

const seedTeamMessages = async (usersByEmail, teamsByName) => {
  for (const template of teamMessageTemplates) {
    const team = teamsByName.get(template.teamName);
    const sender = usersByEmail.get(template.senderEmail);
    if (!team || !sender) continue;
    await TeamMessage.create({
      team: team._id,
      sender: sender._id,
      content: template.content,
    });
  }
};

const seedJoinRequests = async (usersByEmail, teamsByName) => {
  for (const template of joinRequestTemplates) {
    const team = teamsByName.get(template.teamName);
    const applicant = usersByEmail.get(template.applicantEmail);
    if (!team || !applicant) continue;
    const joinRequest = await JoinRequest.create({
      team: team._id,
      applicant: applicant._id,
      message: template.message,
    });
    await Notification.create({
      recipient: team.leader,
      type: 'join_request_received',
      message: 'Một sinh viên vừa gửi yêu cầu tham gia nhóm của bạn',
      link: `/teams/${team._id}`,
    });
    void joinRequest;
  }
};

const seedAnnouncements = async (usersByEmail, coursesByCode) => {
  for (const template of announcementTemplates) {
    const author = usersByEmail.get(template.authorEmail);
    await Announcement.create({
      title: template.title,
      content: template.content,
      author: author._id,
      scope: template.scope,
      course: template.courseCode ? coursesByCode.get(template.courseCode)?._id : null,
      audience: template.audience,
      isBroadcast: Boolean(template.broadcast),
    });
  }
};

const seedPosts = async (usersByEmail) => {
  const postsByTitle = new Map();
  for (const template of postTemplates) {
    const author = usersByEmail.get(template.authorEmail);
    const post = await Post.create({
      author: author._id,
      type: template.type,
      title: template.title,
      content: template.content,
      tagsNeeded: template.tagsNeeded || [],
      eventDate: template.eventDate ? new Date(template.eventDate) : null,
    });
    postsByTitle.set(post.title, post);
  }
  return postsByTitle;
};

const seedComments = async (usersByEmail, postsByTitle) => {
  for (const template of commentTemplates) {
    const post = postsByTitle.get(template.postTitle);
    const author = usersByEmail.get(template.authorEmail);
    if (!post || !author) continue;
    await Comment.create({
      post: post._id,
      author: author._id,
      content: template.content,
    });
  }
};

const run = async () => {
  await connectDB(mongoUri);
  console.log('Đang khởi tạo dữ liệu mẫu cho FPT University...');

  await clearCollections();
  const usersByEmail = await seedUsers();
  const coursesByCode = await seedCourses(usersByEmail);
  await seedEnrollments(usersByEmail, coursesByCode);
  const materialsByTitle = await seedMaterials(usersByEmail, coursesByCode);
  const quizzesByTitle = await seedQuizzes(usersByEmail, coursesByCode);
  await seedQuizAttempts(usersByEmail, quizzesByTitle);
  const lessonsByKey = await seedLessons(usersByEmail, coursesByCode, materialsByTitle, quizzesByTitle);
  await seedLessonProgress(usersByEmail, coursesByCode, lessonsByKey);
  const assignmentsByTitle = await seedAssignments(coursesByCode);
  await seedSubmissions(usersByEmail, assignmentsByTitle);
  const teamsByName = await seedTeams(usersByEmail);
  await seedTeamMessages(usersByEmail, teamsByName);
  await seedJoinRequests(usersByEmail, teamsByName);
  await seedAnnouncements(usersByEmail, coursesByCode);
  const postsByTitle = await seedPosts(usersByEmail);
  await seedComments(usersByEmail, postsByTitle);

  console.log('Hoàn tất khởi tạo dữ liệu mẫu.');
  console.log('---------------------------------------------');
  console.log('Tài khoản đăng nhập mẫu (mật khẩu chung):', DEFAULT_PASSWORD);
  console.log('Quản trị viên : admin@fpt.edu.vn');
  console.log('Giảng viên    : dangnh@fe.edu.vn');
  console.log('Sinh viên     : thuannmhe161234@fpt.edu.vn');
  console.log('Chủ nhiệm CLB : tuanva.clb@fpt.edu.vn');
  console.log('---------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
};

if (require.main === module) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Không được chạy seed trong môi trường production');
    process.exit(1);
  }

  run().catch(async (err) => {
    console.error('Khởi tạo dữ liệu thất bại:', err);
    await mongoose.disconnect();
    process.exit(1);
  });
}

module.exports = { run };
