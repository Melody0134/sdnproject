const asyncHandler = require('../utils/async-handler');
const assignmentService = require('../services/assignment.service');

const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.createAssignment(req.user, req.body);
  res.status(201).json({ success: true, data: { assignment } });
});

const listAssignments = asyncHandler(async (req, res) => {
  const result = await assignmentService.listAssignments(req.query, req.user);
  res.status(200).json({ success: true, ...result });
});

const getMyGradebook = asyncHandler(async (req, res) => {
  const gradebook = await assignmentService.getStudentGradebook(req.user.id);
  res.status(200).json({ success: true, data: gradebook });
});

const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id, req.user);
  res.status(200).json({ success: true, data: { assignment } });
});

const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(req.params.id, req.user, req.body);
  res.status(200).json({ success: true, data: { assignment } });
});

const deleteAssignment = asyncHandler(async (req, res) => {
  await assignmentService.deleteAssignment(req.params.id, req.user);
  res.status(204).send();
});

const submitAssignment = asyncHandler(async (req, res) => {
  const submission = await assignmentService.submitAssignment(req.params.id, req.user.id, req.body, req.file);
  res.status(201).json({ success: true, data: { submission } });
});

const listSubmissions = asyncHandler(async (req, res) => {
  const submissions = await assignmentService.listSubmissions(req.params.id, req.user);
  res.status(200).json({ success: true, data: submissions });
});

const downloadSubmission = asyncHandler(async (req, res) => {
  const { filePath, fileName, mimeType } = await assignmentService.getSubmissionFile(
    req.params.id,
    req.params.submissionId,
    req.user
  );
  res.type(mimeType).download(filePath, fileName);
});

const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await assignmentService.gradeSubmission(
    req.params.id,
    req.params.submissionId,
    req.user,
    req.body
  );
  res.status(200).json({ success: true, data: { submission } });
});

module.exports = {
  createAssignment,
  listAssignments,
  getMyGradebook,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  listSubmissions,
  downloadSubmission,
  gradeSubmission,
};
