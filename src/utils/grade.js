const GRADE_CODES = [
  "NS",
  "KG1",
  "KG2",
  "YR1",
  "YR2",
  "YR3",
  "YR4",
  "YR5",
  "YR6",
  "YR7",
  "YR8",
  "YR9",
  "YR10",
  "YR11",
  "YR12",
];

const LEGACY_TO_CODE = {
  เตรียมอนุบาล: "NS",
  อนุบาล1: "KG1",
  "อนุบาล 1": "KG1",
  อนุบาล2: "KG2",
  "อนุบาล 2": "KG2",
  ตอ: "NS",
  "อ.1": "KG1",
  "อ.2": "KG2",
  "ป.1": "YR1",
  "ป.2": "YR2",
  "ป.3": "YR3",
  "ป.4": "YR4",
  "ป.5": "YR5",
  "ป.6": "YR6",
  "ม.1": "YR7",
  "ม.2": "YR8",
  "ม.3": "YR9",
  "ม.4": "YR10",
  "ม.5": "YR11",
  "ม.6": "YR12",
};

const CODE_TO_LEGACY_LONG = {
  NS: "เตรียมอนุบาล",
  KG1: "อนุบาล 1",
  KG2: "อนุบาล 2",
  YR1: "ป.1",
  YR2: "ป.2",
  YR3: "ป.3",
  YR4: "ป.4",
  YR5: "ป.5",
  YR6: "ป.6",
  YR7: "ม.1",
  YR8: "ม.2",
  YR9: "ม.3",
  YR10: "ม.4",
  YR11: "ม.5",
  YR12: "ม.6",
};

const CODE_TO_LEGACY_SHORT = {
  NS: "ตอ",
  KG1: "อ.1",
  KG2: "อ.2",
  YR1: "ป.1",
  YR2: "ป.2",
  YR3: "ป.3",
  YR4: "ป.4",
  YR5: "ป.5",
  YR6: "ป.6",
  YR7: "ม.1",
  YR8: "ม.2",
  YR9: "ม.3",
  YR10: "ม.4",
  YR11: "ม.5",
  YR12: "ม.6",
};

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

export const normalizeGradeCode = (grade) => {
  const key = normalizeKey(grade);
  if (!key) return "";

  const upper = key.toUpperCase();
  if (GRADE_CODES.includes(upper)) return upper;

  return LEGACY_TO_CODE[key] || "";
};

export const toGradeCode = (grade) => {
  const code = normalizeGradeCode(grade);
  return code || normalizeKey(grade);
};

export const toLegacyGrade = (grade, format = "long") => {
  const code = normalizeGradeCode(grade);
  if (!code) return normalizeKey(grade);
  const map = format === "short" ? CODE_TO_LEGACY_SHORT : CODE_TO_LEGACY_LONG;
  return map[code] || code;
};

export const toLegacyGradeShort = (grade) => toLegacyGrade(grade, "short");

export const compareGrades = (a, b) => {
  const codeA = normalizeGradeCode(a);
  const codeB = normalizeGradeCode(b);

  const indexA = GRADE_CODES.indexOf(codeA);
  const indexB = GRADE_CODES.indexOf(codeB);

  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;

  return String(a || "").localeCompare(String(b || ""));
};

export const sortGrades = (grades = []) => [...grades].sort(compareGrades);

export const gradeEquals = (a, b) => {
  const codeA = normalizeGradeCode(a);
  const codeB = normalizeGradeCode(b);
  if (codeA && codeB) return codeA === codeB;
  return normalizeKey(a) === normalizeKey(b);
};

export const getGradeBadgeText = (grade) => {
  const code = normalizeGradeCode(grade);
  if (code) return code;
  return normalizeKey(grade);
};

export const GRADE_OPTIONS = GRADE_CODES.map((code) => ({
  value: code,
  label: code,
}));

export const DEFAULT_GRADE_CODE = "NS";

export const GRADUATING_GRADE_CODES = ["YR9", "YR12"];

export const isGraduatingGrade = (grade) => {
  const code = normalizeGradeCode(grade);
  return GRADUATING_GRADE_CODES.includes(code);
};
