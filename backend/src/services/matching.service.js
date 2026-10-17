const { jaccardSimilarity, cosineSimilarityFromText } = require('../utils/text');

const WEIGHTS = { gpa: 0.15, skills: 0.3, interests: 0.2, major: 0.2, description: 0.15 };

const gpaScore = (studentGpa, team) => {
  if (studentGpa === null || studentGpa === undefined) return 0.5;
  const leaderGpa = team.leaderGpa;
  if (leaderGpa === null || leaderGpa === undefined) return 0.5;
  return Math.max(0, 1 - Math.abs(studentGpa - leaderGpa) / 4);
};

const majorScore = (studentMajor, teamMajor) => {
  if (!studentMajor || !teamMajor) return 0.5;
  return studentMajor.trim().toLowerCase() === teamMajor.trim().toLowerCase() ? 1 : 0.15;
};

const computeTeamMatchScore = (student, team) => {
  const skills = jaccardSimilarity(student.skills, team.skillsNeeded);
  const interests = jaccardSimilarity(student.interests, [
    ...(team.topic ? team.topic.split(/\s+/) : []),
    ...team.skillsNeeded,
  ]);
  const description = cosineSimilarityFromText(student.description, `${team.topic} ${team.description}`);
  const major = majorScore(student.major, team.major);
  const gpa = gpaScore(student.gpa, team);

  const breakdown = { gpa, skills, interests, major, description };
  const total =
    breakdown.gpa * WEIGHTS.gpa +
    breakdown.skills * WEIGHTS.skills +
    breakdown.interests * WEIGHTS.interests +
    breakdown.major * WEIGHTS.major +
    breakdown.description * WEIGHTS.description;

  return { score: Math.round(total * 100), breakdown };
};

const rankTeamsForStudent = (student, teams, limit = 10) =>
  teams
    .map((team) => ({ team, ...computeTeamMatchScore(student, team) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

const computeStudentFitScore = (candidate, team) => {
  const skills = jaccardSimilarity(candidate.skills, team.skillsNeeded);
  const interests = jaccardSimilarity(candidate.interests, [
    ...(team.topic ? team.topic.split(/\s+/) : []),
    ...team.skillsNeeded,
  ]);
  const major = majorScore(candidate.major, team.major);
  const description = cosineSimilarityFromText(candidate.description, `${team.topic} ${team.description}`);

  const total = skills * 0.45 + interests * 0.25 + major * 0.2 + description * 0.1;
  return { score: Math.round(total * 100), breakdown: { skills, interests, major, description } };
};

const rankCandidatesForTeam = (team, candidates, limit = 10) =>
  candidates
    .map((candidate) => ({ candidate, ...computeStudentFitScore(candidate, team) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

module.exports = {
  computeTeamMatchScore,
  rankTeamsForStudent,
  computeStudentFitScore,
  rankCandidatesForTeam,
};
