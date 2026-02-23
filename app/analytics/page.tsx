'use client'

import { useState, useMemo } from 'react'
import {
  BarChart3, TrendingUp, Users, Award, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, User, Tag, GraduationCap, BookOpen,
  Clock, Lock, Search, X, Calendar, Filter, ArrowLeft, Plus, ClipboardList, Star, MessageSquare
} from 'lucide-react'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

// ========== 数据类型 ==========
const gradeLabels = ['', '一', '二', '三', '四', '五', '六']

interface KnowledgePointMastery {
  name: string
  mastery: number
  correct: number
  total: number
  // 细化：每个学生在该知识点上的表现
  studentDetails: { studentId: string; studentName: string; correct: number; total: number; mastery: number }[]
}

interface StudentUnitResult {
  id: string
  name: string
  studentNo: string
  score: number
  trend: 'up' | 'down' | 'stable'
  weakPoints: string[]
  strongPoints: string[]
  lessonScores: { lessonName: string; score: number | null; date?: string }[]
}

interface LessonProgress {
  id: string
  name: string
  completed: boolean
  hasAssignment: boolean
  knowledgePoints: string[]
  date?: string  // 批改日期
}

interface UnitData {
  id: string
  name: string
  completed: boolean
  lessonsCompleted: number
  lessonsTotal: number
  lessons: LessonProgress[]
  classMastery: number
  knowledgePoints: KnowledgePointMastery[]
  students: StudentUnitResult[]
}

interface SemesterProgress {
  label: string
  units: UnitData[]
}

// 多维度评价
interface DimensionScore {
  knowledge: number      // 知识掌握 (0-100)
  discipline: number     // 课堂纪律 (0-100)
  homework: number       // 作业完成 (0-100)
  attitude: number       // 学习态度 (0-100)
  progress: number       // 进步趋势 (0-100)
}

interface DimensionRecord {
  date: string
  dimension: keyof DimensionScore
  score: number
  note?: string
}

// 学生全局数据（跨单元）
// 学期维度快照
interface SemesterDimensionSnapshot {
  semester: string       // 如 "三年级上学期"
  dimensions: DimensionScore
}

// 维度趋势数据点
interface DimensionTrendPoint {
  date: string
  label: string          // 如 "第一单元" 或 "9月"
  dimensions: DimensionScore
}

interface StudentOverall {
  id: string
  name: string
  studentNo: string
  overallScore: number
  trend: 'up' | 'down' | 'stable'
  totalAssignments: number
  allWeakPoints: string[]
  allStrongPoints: string[]
  unitScores: { unitName: string; score: number }[]
  recentScores: { date: string; score: number; unitName: string }[]
  dimensions: DimensionScore
  dimensionRecords: DimensionRecord[]
  // 学期对比数据
  semesterSnapshots: SemesterDimensionSnapshot[]
  // 阶段趋势数据
  dimensionTrend: DimensionTrendPoint[]
}

interface ClassAnalytics {
  id: string
  name: string
  grade: number
  studentCount: number
  averageScore: number
  semesters: SemesterProgress[]
  studentsOverall: StudentOverall[]
}

// ========== 演示数据 ==========
const demoClasses: ClassAnalytics[] = [
  {
    id: '1', name: '1班', grade: 3, studentCount: 4, averageScore: 87.5,
    semesters: [
      {
        label: '三年级上学期',
        units: [
          {
            id: 'u1', name: '第一单元：万以内的加法和减法',
            completed: true, lessonsCompleted: 2, lessonsTotal: 2,
            lessons: [
              { id: 'l1', name: '第1课：两位数加两位数', completed: true, hasAssignment: true, knowledgePoints: ['进位加法', '竖式计算'], date: '2025-09-15' },
              { id: 'l2', name: '第2课：两位数减两位数', completed: true, hasAssignment: true, knowledgePoints: ['退位减法', '竖式计算'], date: '2025-09-22' },
            ],
            classMastery: 85,
            knowledgePoints: [
              { name: '进位加法', mastery: 95, correct: 38, total: 40, studentDetails: [
                { studentId: 's1', studentName: '张小明', correct: 10, total: 10, mastery: 100 },
                { studentId: 's2', studentName: '李小红', correct: 9, total: 10, mastery: 90 },
                { studentId: 's3', studentName: '王小刚', correct: 9, total: 10, mastery: 90 },
                { studentId: 's4', studentName: '赵小丽', correct: 10, total: 10, mastery: 100 },
              ]},
              { name: '竖式计算', mastery: 92, correct: 44, total: 48, studentDetails: [
                { studentId: 's1', studentName: '张小明', correct: 12, total: 12, mastery: 100 },
                { studentId: 's2', studentName: '李小红', correct: 11, total: 12, mastery: 92 },
                { studentId: 's3', studentName: '王小刚', correct: 9, total: 12, mastery: 75 },
                { studentId: 's4', studentName: '赵小丽', correct: 12, total: 12, mastery: 100 },
              ]},
              { name: '退位减法', mastery: 72, correct: 29, total: 40, studentDetails: [
                { studentId: 's1', studentName: '张小明', correct: 9, total: 10, mastery: 90 },
                { studentId: 's2', studentName: '李小红', correct: 7, total: 10, mastery: 70 },
                { studentId: 's3', studentName: '王小刚', correct: 5, total: 10, mastery: 50 },
                { studentId: 's4', studentName: '赵小丽', correct: 8, total: 10, mastery: 80 },
              ]},
            ],
            students: [
              { id: 's1', name: '张小明', studentNo: '2023001', score: 94, trend: 'up', weakPoints: [], strongPoints: ['进位加法', '竖式计算'],
                lessonScores: [{ lessonName: '两位数加两位数', score: 96, date: '2025-09-15' }, { lessonName: '两位数减两位数', score: 92, date: '2025-09-22' }] },
              { id: 's2', name: '李小红', studentNo: '2023002', score: 89, trend: 'stable', weakPoints: ['退位减法'], strongPoints: ['进位加法'],
                lessonScores: [{ lessonName: '两位数加两位数', score: 92, date: '2025-09-15' }, { lessonName: '两位数减两位数', score: 86, date: '2025-09-22' }] },
              { id: 's3', name: '王小刚', studentNo: '2023003', score: 73, trend: 'down', weakPoints: ['退位减法', '竖式计算'], strongPoints: [],
                lessonScores: [{ lessonName: '两位数加两位数', score: 78, date: '2025-09-15' }, { lessonName: '两位数减两位数', score: 68, date: '2025-09-22' }] },
              { id: 's4', name: '赵小丽', studentNo: '2023004', score: 93, trend: 'up', weakPoints: [], strongPoints: ['竖式计算', '退位减法'],
                lessonScores: [{ lessonName: '两位数加两位数', score: 95, date: '2025-09-15' }, { lessonName: '两位数减两位数', score: 91, date: '2025-09-22' }] },
            ],
          },
          {
            id: 'u2', name: '第二单元：乘法',
            completed: true, lessonsCompleted: 1, lessonsTotal: 1,
            lessons: [
              { id: 'l3', name: '第1课：乘法的意义', completed: true, hasAssignment: true, knowledgePoints: ['乘法意义', '乘法算式'], date: '2025-10-08' },
            ],
            classMastery: 78,
            knowledgePoints: [
              { name: '乘法意义', mastery: 82, correct: 26, total: 32, studentDetails: [
                { studentId: 's1', studentName: '张小明', correct: 7, total: 8, mastery: 88 },
                { studentId: 's2', studentName: '李小红', correct: 7, total: 8, mastery: 88 },
                { studentId: 's3', studentName: '王小刚', correct: 5, total: 8, mastery: 63 },
                { studentId: 's4', studentName: '赵小丽', correct: 7, total: 8, mastery: 88 },
              ]},
              { name: '乘法算式', mastery: 75, correct: 24, total: 32, studentDetails: [
                { studentId: 's1', studentName: '张小明', correct: 7, total: 8, mastery: 88 },
                { studentId: 's2', studentName: '李小红', correct: 6, total: 8, mastery: 75 },
                { studentId: 's3', studentName: '王小刚', correct: 4, total: 8, mastery: 50 },
                { studentId: 's4', studentName: '赵小丽', correct: 7, total: 8, mastery: 88 },
              ]},
            ],
            students: [
              { id: 's1', name: '张小明', studentNo: '2023001', score: 88, trend: 'stable', weakPoints: ['乘法算式'], strongPoints: ['乘法意义'],
                lessonScores: [{ lessonName: '乘法的意义', score: 88, date: '2025-10-08' }] },
              { id: 's2', name: '李小红', studentNo: '2023002', score: 85, trend: 'up', weakPoints: [], strongPoints: ['乘法意义'],
                lessonScores: [{ lessonName: '乘法的意义', score: 85, date: '2025-10-08' }] },
              { id: 's3', name: '王小刚', studentNo: '2023003', score: 65, trend: 'down', weakPoints: ['乘法意义', '乘法算式'], strongPoints: [],
                lessonScores: [{ lessonName: '乘法的意义', score: 65, date: '2025-10-08' }] },
              { id: 's4', name: '赵小丽', studentNo: '2023004', score: 90, trend: 'up', weakPoints: [], strongPoints: ['乘法意义', '乘法算式'],
                lessonScores: [{ lessonName: '乘法的意义', score: 90, date: '2025-10-08' }] },
            ],
          },
          {
            id: 'u3', name: '第三单元：除法',
            completed: false, lessonsCompleted: 1, lessonsTotal: 2,
            lessons: [
              { id: 'l4', name: '第1课：除法的意义', completed: true, hasAssignment: true, knowledgePoints: ['除法意义', '除法算式'], date: '2025-11-05' },
              { id: 'l5', name: '第2课：有余数的除法', completed: false, hasAssignment: false, knowledgePoints: ['余数概念', '除法验算'] },
            ],
            classMastery: 70,
            knowledgePoints: [
              { name: '除法意义', mastery: 76, correct: 23, total: 30, studentDetails: [
                { studentId: 's1', studentName: '张小明', correct: 7, total: 8, mastery: 88 },
                { studentId: 's2', studentName: '李小红', correct: 6, total: 8, mastery: 75 },
                { studentId: 's3', studentName: '王小刚', correct: 4, total: 8, mastery: 50 },
                { studentId: 's4', studentName: '赵小丽', correct: 6, total: 6, mastery: 100 },
              ]},
              { name: '除法算式', mastery: 64, correct: 19, total: 30, studentDetails: [
                { studentId: 's1', studentName: '张小明', correct: 6, total: 8, mastery: 75 },
                { studentId: 's2', studentName: '李小红', correct: 5, total: 8, mastery: 63 },
                { studentId: 's3', studentName: '王小刚', correct: 3, total: 8, mastery: 38 },
                { studentId: 's4', studentName: '赵小丽', correct: 5, total: 6, mastery: 83 },
              ]},
            ],
            students: [
              { id: 's1', name: '张小明', studentNo: '2023001', score: 82, trend: 'stable', weakPoints: ['除法算式'], strongPoints: ['除法意义'],
                lessonScores: [{ lessonName: '除法的意义', score: 82, date: '2025-11-05' }, { lessonName: '有余数的除法', score: null }] },
              { id: 's2', name: '李小红', studentNo: '2023002', score: 75, trend: 'down', weakPoints: ['除法意义', '除法算式'], strongPoints: [],
                lessonScores: [{ lessonName: '除法的意义', score: 75, date: '2025-11-05' }, { lessonName: '有余数的除法', score: null }] },
              { id: 's3', name: '王小刚', studentNo: '2023003', score: 58, trend: 'down', weakPoints: ['除法意义', '除法算式'], strongPoints: [],
                lessonScores: [{ lessonName: '除法的意义', score: 58, date: '2025-11-05' }, { lessonName: '有余数的除法', score: null }] },
              { id: 's4', name: '赵小丽', studentNo: '2023004', score: 88, trend: 'up', weakPoints: [], strongPoints: ['除法意义', '除法算式'],
                lessonScores: [{ lessonName: '除法的意义', score: 88, date: '2025-11-05' }, { lessonName: '有余数的除法', score: null }] },
            ],
          },
          {
            id: 'u4', name: '第四单元：几何图形',
            completed: false, lessonsCompleted: 0, lessonsTotal: 2,
            lessons: [
              { id: 'l6', name: '第1课：认识长方形和正方形', completed: false, hasAssignment: false, knowledgePoints: ['长方形特征', '正方形特征'] },
              { id: 'l7', name: '第2课：周长计算', completed: false, hasAssignment: false, knowledgePoints: ['周长概念', '周长公式'] },
            ],
            classMastery: 0,
            knowledgePoints: [],
            students: [],
          },
        ],
      },
    ],
    studentsOverall: [
      { id: 's1', name: '张小明', studentNo: '2023001', overallScore: 88, trend: 'up', totalAssignments: 4,
        allWeakPoints: ['除法算式'], allStrongPoints: ['进位加法', '竖式计算', '除法意义'],
        unitScores: [{ unitName: '加减法', score: 94 }, { unitName: '乘法', score: 88 }, { unitName: '除法', score: 82 }],
        recentScores: [{ date: '2025-09-15', score: 96, unitName: '加减法' }, { date: '2025-09-22', score: 92, unitName: '加减法' }, { date: '2025-10-08', score: 88, unitName: '乘法' }, { date: '2025-11-05', score: 82, unitName: '除法' }],
        dimensions: { knowledge: 88, discipline: 92, homework: 95, attitude: 90, progress: 85 },
        dimensionRecords: [
          { date: '2025-11-04', dimension: 'discipline', score: 95, note: '课堂上积极回答问题' },
          { date: '2025-11-03', dimension: 'attitude', score: 90, note: '认真完成课后练习' },
          { date: '2025-10-28', dimension: 'discipline', score: 88, note: '上课专注度高' },
        ],
        semesterSnapshots: [
          { semester: '二年级下学期', dimensions: { knowledge: 80, discipline: 85, homework: 88, attitude: 82, progress: 78 } },
          { semester: '三年级上学期', dimensions: { knowledge: 88, discipline: 92, homework: 95, attitude: 90, progress: 85 } },
        ],
        dimensionTrend: [
          { date: '2025-09', label: '第一单元', dimensions: { knowledge: 82, discipline: 88, homework: 90, attitude: 85, progress: 80 } },
          { date: '2025-10', label: '第二单元', dimensions: { knowledge: 85, discipline: 90, homework: 93, attitude: 88, progress: 82 } },
          { date: '2025-11', label: '第三单元', dimensions: { knowledge: 88, discipline: 92, homework: 95, attitude: 90, progress: 85 } },
        ] },
      { id: 's2', name: '李小红', studentNo: '2023002', overallScore: 83, trend: 'stable', totalAssignments: 4,
        allWeakPoints: ['退位减法', '除法意义', '除法算式'], allStrongPoints: ['进位加法'],
        unitScores: [{ unitName: '加减法', score: 89 }, { unitName: '乘法', score: 85 }, { unitName: '除法', score: 75 }],
        recentScores: [{ date: '2025-09-15', score: 92, unitName: '加减法' }, { date: '2025-09-22', score: 86, unitName: '加减法' }, { date: '2025-10-08', score: 85, unitName: '乘法' }, { date: '2025-11-05', score: 75, unitName: '除法' }],
        dimensions: { knowledge: 83, discipline: 88, homework: 80, attitude: 75, progress: 60 },
        dimensionRecords: [
          { date: '2025-11-04', dimension: 'attitude', score: 70, note: '课堂上有些走神' },
          { date: '2025-10-30', dimension: 'homework', score: 75, note: '作业完成质量一般' },
        ],
        semesterSnapshots: [
          { semester: '二年级下学期', dimensions: { knowledge: 85, discipline: 90, homework: 85, attitude: 80, progress: 70 } },
          { semester: '三年级上学期', dimensions: { knowledge: 83, discipline: 88, homework: 80, attitude: 75, progress: 60 } },
        ],
        dimensionTrend: [
          { date: '2025-09', label: '第一单元', dimensions: { knowledge: 88, discipline: 92, homework: 85, attitude: 80, progress: 72 } },
          { date: '2025-10', label: '第二单元', dimensions: { knowledge: 85, discipline: 88, homework: 82, attitude: 76, progress: 65 } },
          { date: '2025-11', label: '第三单元', dimensions: { knowledge: 83, discipline: 88, homework: 80, attitude: 75, progress: 60 } },
        ] },
      { id: 's3', name: '王小刚', studentNo: '2023003', overallScore: 65, trend: 'down', totalAssignments: 4,
        allWeakPoints: ['退位减法', '竖式计算', '乘法意义', '乘法算式', '除法意义', '除法算式'], allStrongPoints: [],
        unitScores: [{ unitName: '加减法', score: 73 }, { unitName: '乘法', score: 65 }, { unitName: '除法', score: 58 }],
        recentScores: [{ date: '2025-09-15', score: 78, unitName: '加减法' }, { date: '2025-09-22', score: 68, unitName: '加减法' }, { date: '2025-10-08', score: 65, unitName: '乘法' }, { date: '2025-11-05', score: 58, unitName: '除法' }],
        dimensions: { knowledge: 65, discipline: 50, homework: 55, attitude: 45, progress: 30 },
        dimensionRecords: [
          { date: '2025-11-04', dimension: 'discipline', score: 40, note: '课堂上与同学说话，影响了课堂秩序' },
          { date: '2025-11-01', dimension: 'homework', score: 50, note: '作业未按时提交' },
          { date: '2025-10-28', dimension: 'attitude', score: 40, note: '上课走神，不专心' },
          { date: '2025-10-25', dimension: 'discipline', score: 55, note: '课间在走廊追跑' },
        ],
        semesterSnapshots: [
          { semester: '二年级下学期', dimensions: { knowledge: 72, discipline: 60, homework: 65, attitude: 55, progress: 50 } },
          { semester: '三年级上学期', dimensions: { knowledge: 65, discipline: 50, homework: 55, attitude: 45, progress: 30 } },
        ],
        dimensionTrend: [
          { date: '2025-09', label: '第一单元', dimensions: { knowledge: 73, discipline: 58, homework: 62, attitude: 52, progress: 45 } },
          { date: '2025-10', label: '第二单元', dimensions: { knowledge: 68, discipline: 52, homework: 58, attitude: 48, progress: 35 } },
          { date: '2025-11', label: '第三单元', dimensions: { knowledge: 65, discipline: 50, homework: 55, attitude: 45, progress: 30 } },
        ] },
      { id: 's4', name: '赵小丽', studentNo: '2023004', overallScore: 90, trend: 'up', totalAssignments: 4,
        allWeakPoints: [], allStrongPoints: ['竖式计算', '退位减法', '乘法意义', '乘法算式', '除法意义'],
        unitScores: [{ unitName: '加减法', score: 93 }, { unitName: '乘法', score: 90 }, { unitName: '除法', score: 88 }],
        recentScores: [{ date: '2025-09-15', score: 95, unitName: '加减法' }, { date: '2025-09-22', score: 91, unitName: '加减法' }, { date: '2025-10-08', score: 90, unitName: '乘法' }, { date: '2025-11-05', score: 88, unitName: '除法' }],
        dimensions: { knowledge: 90, discipline: 95, homework: 98, attitude: 95, progress: 88 },
        dimensionRecords: [
          { date: '2025-11-04', dimension: 'attitude', score: 98, note: '主动帮助同学解题' },
          { date: '2025-11-01', dimension: 'discipline', score: 95, note: '课堂表现优秀' },
        ],
        semesterSnapshots: [
          { semester: '二年级下学期', dimensions: { knowledge: 82, discipline: 88, homework: 92, attitude: 88, progress: 80 } },
          { semester: '三年级上学期', dimensions: { knowledge: 90, discipline: 95, homework: 98, attitude: 95, progress: 88 } },
        ],
        dimensionTrend: [
          { date: '2025-09', label: '第一单元', dimensions: { knowledge: 85, discipline: 90, homework: 95, attitude: 90, progress: 82 } },
          { date: '2025-10', label: '第二单元', dimensions: { knowledge: 88, discipline: 93, homework: 96, attitude: 93, progress: 85 } },
          { date: '2025-11', label: '第三单元', dimensions: { knowledge: 90, discipline: 95, homework: 98, attitude: 95, progress: 88 } },
        ] },
    ],
  },
  {
    id: '2', name: '2班', grade: 3, studentCount: 3, averageScore: 82.3,
    semesters: [
      {
        label: '三年级上学期',
        units: [
          {
            id: 'u1b', name: '第一单元：万以内的加法和减法',
            completed: true, lessonsCompleted: 2, lessonsTotal: 2,
            lessons: [
              { id: 'l1b', name: '第1课：两位数加两位数', completed: true, hasAssignment: true, knowledgePoints: ['进位加法', '竖式计算'], date: '2025-09-16' },
              { id: 'l2b', name: '第2课：两位数减两位数', completed: true, hasAssignment: true, knowledgePoints: ['退位减法', '竖式计算'], date: '2025-09-23' },
            ],
            classMastery: 78,
            knowledgePoints: [
              { name: '进位加法', mastery: 88, correct: 22, total: 25, studentDetails: [
                { studentId: 's5', studentName: '刘小伟', correct: 8, total: 9, mastery: 89 },
                { studentId: 's6', studentName: '陈小芳', correct: 8, total: 8, mastery: 100 },
                { studentId: 's7', studentName: '周小杰', correct: 6, total: 8, mastery: 75 },
              ]},
              { name: '竖式计算', mastery: 80, correct: 24, total: 30, studentDetails: [
                { studentId: 's5', studentName: '刘小伟', correct: 8, total: 10, mastery: 80 },
                { studentId: 's6', studentName: '陈小芳', correct: 9, total: 10, mastery: 90 },
                { studentId: 's7', studentName: '周小杰', correct: 7, total: 10, mastery: 70 },
              ]},
              { name: '退位减法', mastery: 65, correct: 16, total: 25, studentDetails: [
                { studentId: 's5', studentName: '刘小伟', correct: 6, total: 9, mastery: 67 },
                { studentId: 's6', studentName: '陈小芳', correct: 7, total: 8, mastery: 88 },
                { studentId: 's7', studentName: '周小杰', correct: 3, total: 8, mastery: 38 },
              ]},
            ],
            students: [
              { id: 's5', name: '刘小伟', studentNo: '2023005', score: 82, trend: 'up', weakPoints: ['退位减法'], strongPoints: ['进位加法'],
                lessonScores: [{ lessonName: '两位数加两位数', score: 88, date: '2025-09-16' }, { lessonName: '两位数减两位数', score: 76, date: '2025-09-23' }] },
              { id: 's6', name: '陈小芳', studentNo: '2023006', score: 91, trend: 'stable', weakPoints: [], strongPoints: ['竖式计算', '进位加法'],
                lessonScores: [{ lessonName: '两位数加两位数', score: 93, date: '2025-09-16' }, { lessonName: '两位数减两位数', score: 89, date: '2025-09-23' }] },
              { id: 's7', name: '周小杰', studentNo: '2023007', score: 62, trend: 'down', weakPoints: ['退位减法', '竖式计算', '进位加法'], strongPoints: [],
                lessonScores: [{ lessonName: '两位数加两位数', score: 68, date: '2025-09-16' }, { lessonName: '两位数减两位数', score: 56, date: '2025-09-23' }] },
            ],
          },
          {
            id: 'u2b', name: '第二单元：乘法',
            completed: false, lessonsCompleted: 0, lessonsTotal: 1,
            lessons: [
              { id: 'l3b', name: '第1课：乘法的意义', completed: false, hasAssignment: false, knowledgePoints: ['乘法意义', '乘法算式'] },
            ],
            classMastery: 0,
            knowledgePoints: [],
            students: [],
          },
        ],
      },
    ],
    studentsOverall: [
      { id: 's5', name: '刘小伟', studentNo: '2023005', overallScore: 82, trend: 'up', totalAssignments: 2,
        allWeakPoints: ['退位减法'], allStrongPoints: ['进位加法'],
        unitScores: [{ unitName: '加减法', score: 82 }],
        recentScores: [{ date: '2025-09-16', score: 88, unitName: '加减法' }, { date: '2025-09-23', score: 76, unitName: '加减法' }],
        dimensions: { knowledge: 82, discipline: 85, homework: 88, attitude: 80, progress: 75 },
        dimensionRecords: [{ date: '2025-09-20', dimension: 'discipline', score: 85, note: '课堂表现良好' }],
        semesterSnapshots: [
          { semester: '二年级下学期', dimensions: { knowledge: 75, discipline: 78, homework: 82, attitude: 72, progress: 68 } },
          { semester: '三年级上学期', dimensions: { knowledge: 82, discipline: 85, homework: 88, attitude: 80, progress: 75 } },
        ],
        dimensionTrend: [
          { date: '2025-09', label: '第一单元', dimensions: { knowledge: 82, discipline: 85, homework: 88, attitude: 80, progress: 75 } },
        ] },
      { id: 's6', name: '陈小芳', studentNo: '2023006', overallScore: 91, trend: 'stable', totalAssignments: 2,
        allWeakPoints: [], allStrongPoints: ['竖式计算', '进位加法'],
        unitScores: [{ unitName: '加减法', score: 91 }],
        recentScores: [{ date: '2025-09-16', score: 93, unitName: '加减法' }, { date: '2025-09-23', score: 89, unitName: '加减法' }],
        dimensions: { knowledge: 91, discipline: 93, homework: 95, attitude: 92, progress: 80 },
        dimensionRecords: [{ date: '2025-09-22', dimension: 'attitude', score: 95, note: '学习态度非常认真' }],
        semesterSnapshots: [
          { semester: '二年级下学期', dimensions: { knowledge: 85, discipline: 90, homework: 90, attitude: 88, progress: 75 } },
          { semester: '三年级上学期', dimensions: { knowledge: 91, discipline: 93, homework: 95, attitude: 92, progress: 80 } },
        ],
        dimensionTrend: [
          { date: '2025-09', label: '第一单元', dimensions: { knowledge: 91, discipline: 93, homework: 95, attitude: 92, progress: 80 } },
        ] },
      { id: 's7', name: '周小杰', studentNo: '2023007', overallScore: 62, trend: 'down', totalAssignments: 2,
        allWeakPoints: ['退位减法', '竖式计算', '进位加法'], allStrongPoints: [],
        unitScores: [{ unitName: '加减法', score: 62 }],
        recentScores: [{ date: '2025-09-16', score: 68, unitName: '加减法' }, { date: '2025-09-23', score: 56, unitName: '加减法' }],
        dimensions: { knowledge: 62, discipline: 48, homework: 50, attitude: 40, progress: 25 },
        dimensionRecords: [
          { date: '2025-09-22', dimension: 'discipline', score: 45, note: '课堂上做小动作' },
          { date: '2025-09-20', dimension: 'homework', score: 40, note: '作业潦草，错误较多' },
        ],
        semesterSnapshots: [
          { semester: '二年级下学期', dimensions: { knowledge: 68, discipline: 55, homework: 58, attitude: 48, progress: 35 } },
          { semester: '三年级上学期', dimensions: { knowledge: 62, discipline: 48, homework: 50, attitude: 40, progress: 25 } },
        ],
        dimensionTrend: [
          { date: '2025-09', label: '第一单元', dimensions: { knowledge: 62, discipline: 48, homework: 50, attitude: 40, progress: 25 } },
        ] },
    ],
  },
]

// ========== 辅助函数 ==========
const masteryColor = (m: number) => m >= 90 ? 'bg-green-500' : m >= 80 ? 'bg-blue-500' : m >= 70 ? 'bg-yellow-500' : m >= 60 ? 'bg-orange-500' : 'bg-red-500'
const masteryTextColor = (m: number) => m >= 90 ? 'text-green-600' : m >= 80 ? 'text-blue-600' : m >= 70 ? 'text-yellow-600' : m >= 60 ? 'text-orange-600' : 'text-red-600'
const scoreColor = (s: number) => s >= 90 ? 'text-green-600' : s >= 80 ? 'text-blue-600' : s >= 70 ? 'text-yellow-600' : s >= 60 ? 'text-orange-600' : 'text-red-600'
const scoreBg = (s: number) => s >= 90 ? 'bg-green-50' : s >= 80 ? 'bg-blue-50' : s >= 70 ? 'bg-yellow-50' : s >= 60 ? 'bg-orange-50' : 'bg-red-50'
const trendIcon = (t: string) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→'
const trendColor = (t: string) => t === 'up' ? 'text-green-600' : t === 'down' ? 'text-red-500' : 'text-gray-400'

// 多维度评价相关
const dimensionLabels: Record<keyof DimensionScore, string> = {
  knowledge: '知识掌握',
  discipline: '课堂纪律',
  homework: '作业完成',
  attitude: '学习态度',
  progress: '进步趋势',
}

const dimensionColors: Record<keyof DimensionScore, string> = {
  knowledge: '#6366f1',
  discipline: '#f59e0b',
  homework: '#10b981',
  attitude: '#ec4899',
  progress: '#3b82f6',
}

const dimensionKeys: (keyof DimensionScore)[] = ['knowledge', 'discipline', 'homework', 'attitude', 'progress']

// 学期颜色配置
const semesterColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

// SVG 雷达图组件（支持多学期叠加）
function RadarChart({ dimensions, comparisons, size = 220 }: { dimensions: DimensionScore; comparisons?: { label: string; dimensions: DimensionScore; color: string }[]; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const levels = 5
  const angleStep = (2 * Math.PI) / dimensionKeys.length
  const startAngle = -Math.PI / 2

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep
    const dist = (value / 100) * r
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const levelR = ((i + 1) / levels) * r
    return dimensionKeys.map((_, j) => {
      const angle = startAngle + j * angleStep
      return { x: cx + levelR * Math.cos(angle), y: cy + levelR * Math.sin(angle) }
    })
  })

  const dataPoints = dimensionKeys.map((key, i) => getPoint(i, dimensions[key]))
  const avg = Math.round(dimensionKeys.reduce((sum, key) => sum + dimensions[key], 0) / dimensionKeys.length)

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {gridLevels.map((points, li) => (
          <polygon key={li} points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="#e5e7eb" strokeWidth={li === levels - 1 ? 1.5 : 0.8} />
        ))}
        {dimensionKeys.map((_, i) => {
          const end = getPoint(i, 100)
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e5e7eb" strokeWidth={0.8} />
        })}
        {/* 对比学期（虚线） */}
        {comparisons?.map((comp, ci) => {
          const pts = dimensionKeys.map((key, i) => getPoint(i, comp.dimensions[key]))
          return (
            <g key={ci}>
              <polygon points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                fill={`${comp.color}15`} stroke={comp.color} strokeWidth={1.5} strokeDasharray="4 3" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={comp.color} stroke="white" strokeWidth={1} />
              ))}
            </g>
          )
        })}
        {/* 当前学期（实线） */}
        <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth={2} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={dimensionColors[dimensionKeys[i]]} stroke="white" strokeWidth={1.5} />
        ))}
        {dimensionKeys.map((key, i) => {
          const labelPoint = getPoint(i, 120)
          return (
            <text key={i} x={labelPoint.x} y={labelPoint.y}
              textAnchor="middle" dominantBaseline="middle"
              className="text-[10px] fill-gray-600 font-medium">
              {dimensionLabels[key]}
            </text>
          )
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-lg fill-indigo-600 font-bold">{avg}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="text-[9px] fill-gray-400">综合评分</text>
      </svg>
      {/* 图例 */}
      {comparisons && comparisons.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <div className="flex items-center text-[10px] text-gray-600">
            <div className="w-4 h-0.5 bg-sky-500 mr-1" />当前学期
          </div>
          {comparisons.map((comp, ci) => (
            <div key={ci} className="flex items-center text-[10px] text-gray-500">
              <div className="w-4 h-0.5 mr-1" style={{ backgroundColor: comp.color, borderTop: '1px dashed' + comp.color }} />{comp.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// SVG 维度趋势折线图组件
function TrendChart({ trendData, size = { width: 320, height: 180 } }: { trendData: DimensionTrendPoint[]; size?: { width: number; height: number } }) {
  if (trendData.length === 0) return <div className="text-center text-gray-400 text-xs py-4">暂无趋势数据</div>

  const { width, height } = size
  const padding = { top: 15, right: 15, bottom: 30, left: 30 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const xStep = trendData.length > 1 ? chartW / (trendData.length - 1) : chartW / 2

  const getX = (i: number) => padding.left + (trendData.length > 1 ? i * xStep : chartW / 2)
  const getY = (val: number) => padding.top + chartH - (val / 100) * chartH

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* 横向网格线 */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={padding.left} y1={getY(v)} x2={width - padding.right} y2={getY(v)} stroke="#f3f4f6" strokeWidth={1} />
          <text x={padding.left - 5} y={getY(v)} textAnchor="end" dominantBaseline="middle" className="text-[9px] fill-gray-400">{v}</text>
        </g>
      ))}
      {/* X轴标签 */}
      {trendData.map((point, i) => (
        <text key={i} x={getX(i)} y={height - 5} textAnchor="middle" className="text-[9px] fill-gray-500">{point.label}</text>
      ))}
      {/* 各维度折线 */}
      {dimensionKeys.map(key => {
        const points = trendData.map((point, i) => `${getX(i)},${getY(point.dimensions[key])}`).join(' ')
        return (
          <g key={key}>
            <polyline points={points} fill="none" stroke={dimensionColors[key]} strokeWidth={1.8} strokeLinejoin="round" />
            {trendData.map((point, i) => (
              <circle key={i} cx={getX(i)} cy={getY(point.dimensions[key])} r={3} fill={dimensionColors[key]} stroke="white" strokeWidth={1.5} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

// ========== 主页面 ==========
export default function AnalyticsPage() {
  const [classDataList] = useState<ClassAnalytics[]>(demoClasses)
  const [selectedClassId, setSelectedClassId] = useState<string>(demoClasses[0]?.id || '')
  const [showClassPicker, setShowClassPicker] = useState(false)

  // 主 Tab：教学进度 / 学生分析
  const [mainTab, setMainTab] = useState<'progress' | 'students'>('progress')

  // 教学进度相关
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null)
  const [unitTab, setUnitTab] = useState<'class' | 'students'>('class')
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)
  const [expandedKpName, setExpandedKpName] = useState<string | null>(null)

  // 学生分析相关
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState<'all' | 'semester' | 'month' | 'week'>('all')
  const [dimensionFilter, setDimensionFilter] = useState<'overall' | 'unit' | 'lesson'>('overall')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentUnitFilter, setStudentUnitFilter] = useState<string>('全部')

  // 记录评分弹窗
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordDimension, setRecordDimension] = useState<keyof DimensionScore>('discipline')
  const [recordScore, setRecordScore] = useState(80)
  const [recordNote, setRecordNote] = useState('')
  const [studentDetailTab, setStudentDetailTab] = useState<'radar' | 'records' | 'knowledge'>('radar')

  const currentClass = classDataList.find(c => c.id === selectedClassId)

  if (!currentClass) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="flex items-center justify-center h-[60vh] text-gray-500">暂无班级数据</div>
        <BottomNav />
      </div>
    )
  }

  const allUnits = currentClass.semesters.flatMap(s => s.units)

  // 根据作业批改记录判定单元状态
  const getUnitStatus = (unit: UnitData): 'completed' | 'in-progress' | 'not-started' => {
    const lessonsWithAssignment = unit.lessons.filter(l => l.hasAssignment).length
    if (lessonsWithAssignment === 0) return 'not-started'
    if (lessonsWithAssignment >= unit.lessonsTotal) return 'completed'
    return 'in-progress'
  }

  const completedUnits = allUnits.filter(u => getUnitStatus(u) === 'completed')
  const currentUnit = allUnits.find(u => getUnitStatus(u) === 'in-progress')
  const totalUnits = allUnits.length

  // 默认展开当前进行中的单元
  const effectiveExpandedId = expandedUnitId !== null ? expandedUnitId : (currentUnit?.id || null)

  // 搜索过滤学生
  const filteredStudents = currentClass.studentsOverall.filter(s =>
    s.name.includes(searchQuery) || s.studentNo.includes(searchQuery)
  )

  // 选中的学生详情
  const selectedStudent = currentClass.studentsOverall.find(s => s.id === selectedStudentId)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 pb-safe-nav">
        {/* 页头 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">数据分析</h1>

        {/* 班级选择器 */}
        <div className="relative mb-4 sm:mb-6">
          <button onClick={() => setShowClassPicker(!showClassPicker)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-xl shadow-md border-2 border-sky-100 hover:border-sky-300 active:bg-sky-50 transition-all">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-sky-600" />
              </div>
              <div className="ml-3 text-left">
                <div className="text-base sm:text-lg font-bold text-slate-800">
                  {gradeLabels[currentClass.grade]}年级{currentClass.name}
                </div>
                <div className="text-xs text-gray-500">
                  {currentClass.studentCount} 名学生 · 平均分 {currentClass.averageScore}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showClassPicker ? 'rotate-180' : ''}`} />
          </button>
          {showClassPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-30 overflow-hidden">
              {classDataList.map(cls => (
                <button key={cls.id} onClick={() => { setSelectedClassId(cls.id); setShowClassPicker(false); setExpandedUnitId(null); setExpandedStudentId(null); setSelectedStudentId(null) }}
                  className={`w-full flex items-center p-3.5 text-left transition-colors ${cls.id === selectedClassId ? 'bg-sky-50' : 'hover:bg-gray-50 active:bg-gray-100'}`}>
                  <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-slate-800">{gradeLabels[cls.grade]}年级{cls.name}</div>
                    <div className="text-[10px] text-gray-500">{cls.studentCount} 名学生 · 均分 {cls.averageScore}</div>
                  </div>
                  {cls.id === selectedClassId && <CheckCircle className="w-4 h-4 text-sky-600 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 主 Tab 切换 */}
        <div className="flex bg-white rounded-xl shadow-sm mb-4 p-1">
          <button onClick={() => { setMainTab('progress'); setSelectedStudentId(null) }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-center transition-all ${mainTab === 'progress' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-600 active:bg-gray-100'}`}>
            <BarChart3 className="w-4 h-4 inline mr-1.5" />教学进度
          </button>
          <button onClick={() => { setMainTab('students'); setExpandedUnitId(null) }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-center transition-all ${mainTab === 'students' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-600 active:bg-gray-100'}`}>
            <Users className="w-4 h-4 inline mr-1.5" />学生分析
          </button>
        </div>

        {/* ==================== 教学进度 Tab ==================== */}
        {mainTab === 'progress' && (
          <>
            {/* 数轴 */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">教学进度</h3>
                <span className="text-[10px] text-gray-400">{completedUnits.length}/{totalUnits} 单元</span>
              </div>
              <div className="overflow-x-auto scrollbar-hide pb-2">
                <div className="relative flex items-start" style={{ minWidth: `${allUnits.length * 90}px` }}>
                  {/* 数轴线 */}
                  <div className="absolute top-[11px] left-[20px] right-[20px] h-[3px] bg-gray-200 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-sky-500 rounded-full transition-all duration-700"
                      style={{ width: totalUnits > 1 ? `${(completedUnits.length / (totalUnits - 1)) * 100}%` : (completedUnits.length > 0 ? '100%' : '0%') }} />
                    {currentUnit && (
                      <div className="absolute top-0 h-full bg-orange-400 rounded-full transition-all duration-700"
                        style={{
                          left: totalUnits > 1 ? `${(completedUnits.length / (totalUnits - 1)) * 100}%` : '0%',
                          width: totalUnits > 1 ? `${(1 / (totalUnits - 1)) * 100}%` : '100%'
                        }} />
                    )}
                  </div>
                  {/* 节点 */}
                  {allUnits.map((unit) => {
                    const status = getUnitStatus(unit)
                    const isSelected = effectiveExpandedId === unit.id
                    const isClickable = status !== 'not-started'
                    return (
                      <button key={unit.id}
                        onClick={() => {
                          if (isClickable) {
                            setExpandedUnitId(isSelected ? null : unit.id)
                            setUnitTab('class')
                            setExpandedStudentId(null)
                            setExpandedKpName(null)
                          }
                        }}
                        className="flex-1 flex flex-col items-center relative z-10 group"
                      >
                        <div className={`w-[22px] h-[22px] rounded-full border-[3px] flex items-center justify-center transition-all ${
                          isSelected && status === 'completed'
                            ? 'bg-sky-500 border-sky-500 ring-4 ring-sky-100 scale-110'
                            : isSelected && status === 'in-progress'
                              ? 'bg-orange-500 border-orange-500 ring-4 ring-orange-100 scale-110'
                              : status === 'completed'
                                ? 'bg-sky-400 border-sky-400'
                                : status === 'in-progress'
                                  ? 'bg-orange-400 border-orange-400 animate-pulse'
                                  : 'bg-white border-gray-300'
                        }`}>
                          {status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                          {status === 'in-progress' && <Clock className="w-3 h-3 text-white" />}
                          {status === 'not-started' && <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
                        </div>
                        <div className={`mt-1.5 text-[10px] font-medium text-center leading-tight max-w-[80px] ${
                          isSelected ? (status === 'in-progress' ? 'text-orange-600 font-bold' : 'text-sky-600 font-bold')
                            : status === 'completed' ? 'text-gray-800'
                            : status === 'in-progress' ? 'text-orange-600 font-semibold'
                            : 'text-gray-400'
                        }`}>
                          {unit.name.replace(/第.单元：/, '')}
                        </div>
                        {status === 'completed' && (
                          <div className={`mt-0.5 text-[9px] font-bold ${isSelected ? 'text-sky-600' : masteryTextColor(unit.classMastery)}`}>
                            {unit.classMastery}%
                          </div>
                        )}
                        {status === 'in-progress' && (
                          <div className="mt-0.5 text-[9px] font-bold text-orange-500">
                            {unit.lessonsCompleted}/{unit.lessonsTotal}课时
                          </div>
                        )}
                        {status === 'not-started' && (
                          <div className="mt-0.5 text-[9px] text-gray-400">未开始</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 展开的单元详情 */}
            {(() => {
              const unit = allUnits.find(u => u.id === effectiveExpandedId)
              const status = unit ? getUnitStatus(unit) : 'not-started'
              if (!unit || status === 'not-started') return null
              return (
                <div className="mb-4">
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    {/* 单元标题 */}
                    <div className={`${status === 'in-progress' ? 'bg-orange-500' : 'bg-indigo-600'} text-white px-4 py-2.5 flex items-center justify-between`}>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5">
                          {unit.name}
                          {status === 'in-progress' && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">当前进度</span>}
                        </div>
                        <div className={`text-[10px] ${status === 'in-progress' ? 'text-orange-200' : 'text-sky-200'}`}>
                          {unit.lessonsCompleted}/{unit.lessonsTotal} 课时{unit.classMastery > 0 ? ` · 班级掌握率 ${unit.classMastery}%` : ''}
                        </div>
                      </div>
                      <button onClick={() => setExpandedUnitId(null)} className="text-white/60 hover:text-white active:text-white/40">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 课时进度 */}
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="text-xs font-bold text-gray-700 mb-2.5">课时进度</h4>
                      <div className="space-y-2">
                        {unit.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${lesson.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {lesson.completed
                                ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                : <Clock className="w-3 h-3 text-gray-400" />
                              }
                            </div>
                            <span className={`ml-2 text-xs ${lesson.completed ? 'text-slate-800' : 'text-gray-400'}`}>{lesson.name}</span>
                            {lesson.date && <span className="ml-auto text-[10px] text-gray-400">{lesson.date}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tab 切换 */}
                    <div className="flex border-b border-gray-100">
                      <button onClick={() => { setUnitTab('class'); setExpandedStudentId(null); setExpandedKpName(null) }}
                        className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${unitTab === 'class' ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50' : 'text-gray-500 active:bg-gray-50'}`}>
                        <BarChart3 className="w-3.5 h-3.5 inline mr-1" />班级掌握情况
                      </button>
                      <button onClick={() => { setUnitTab('students'); setExpandedStudentId(null); setExpandedKpName(null) }}
                        className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${unitTab === 'students' ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50' : 'text-gray-500 active:bg-gray-50'}`}>
                        <Users className="w-3.5 h-3.5 inline mr-1" />各学生掌握情况
                      </button>
                    </div>

                    {/* 班级掌握情况 - 点击知识点可展开看具体学生 */}
                    {unitTab === 'class' && (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500">班级整体掌握率</span>
                          <span className={`text-lg font-bold ${masteryTextColor(unit.classMastery)}`}>{unit.classMastery}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                          <div className={`${masteryColor(unit.classMastery)} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${unit.classMastery}%` }} />
                        </div>

                        <h4 className="text-xs font-bold text-gray-700 mb-2.5">各知识点掌握率 <span className="font-normal text-gray-400">（点击查看详情）</span></h4>
                        <div className="space-y-2">
                          {unit.knowledgePoints
                            .sort((a, b) => a.mastery - b.mastery)
                            .map((kp, idx) => {
                              const isKpExpanded = expandedKpName === kp.name
                              return (
                                <div key={idx}>
                                  <button onClick={() => setExpandedKpName(isKpExpanded ? null : kp.name)}
                                    className={`w-full text-left rounded-lg p-2.5 transition-all ${isKpExpanded ? 'bg-sky-50 ring-1 ring-sky-200' : 'bg-gray-50 active:bg-gray-100'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center">
                                        <Tag className="w-3 h-3 text-gray-400 mr-1.5" />
                                        <span className="text-xs font-medium text-gray-700">{kp.name}</span>
                                        {kp.mastery < 75 && <AlertTriangle className="w-3 h-3 text-orange-500 ml-1" />}
                                      </div>
                                      <div className="flex items-center">
                                        <span className={`text-xs font-bold mr-1.5 ${masteryTextColor(kp.mastery)}`}>{kp.mastery}%</span>
                                        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isKpExpanded ? 'rotate-90' : ''}`} />
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div className={`${masteryColor(kp.mastery)} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${kp.mastery}%` }} />
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{kp.correct}/{kp.total} 题正确</div>
                                  </button>

                                  {/* 展开：每个学生在该知识点上的表现 */}
                                  {isKpExpanded && kp.studentDetails && (
                                    <div className="ml-4 mt-1 mb-2 space-y-1.5">
                                      {kp.studentDetails
                                        .sort((a, b) => a.mastery - b.mastery)
                                        .map((sd, si) => (
                                          <div key={si} className={`flex items-center justify-between p-2 rounded-lg ${sd.mastery < 70 ? 'bg-red-50' : sd.mastery < 85 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                                            <div className="flex items-center">
                                              <User className="w-3 h-3 text-gray-400 mr-1.5" />
                                              <span className="text-xs text-gray-800">{sd.studentName}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-[10px] text-gray-500">{sd.correct}/{sd.total}题</span>
                                              <span className={`text-xs font-bold ${masteryTextColor(sd.mastery)}`}>{sd.mastery}%</span>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}

                    {/* 各学生掌握情况 */}
                    {unitTab === 'students' && (
                      <div className="p-4 space-y-2">
                        {unit.students
                          .sort((a, b) => b.score - a.score)
                          .map((student, idx) => {
                            const isStudentExpanded = expandedStudentId === student.id
                            return (
                              <div key={student.id}>
                                <button onClick={() => setExpandedStudentId(isStudentExpanded ? null : student.id)}
                                  className={`w-full rounded-xl p-3 text-left transition-all ${isStudentExpanded ? 'bg-sky-50 ring-1 ring-sky-200' : 'bg-gray-50 active:bg-gray-100'}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                                        {idx + 1}
                                      </div>
                                      <div className="ml-2.5 min-w-0">
                                        <div className="text-sm font-medium text-slate-800">{student.name}</div>
                                        <div className="text-[10px] text-gray-500">
                                          {student.weakPoints.length > 0
                                            ? <span className="text-orange-600">薄弱：{student.weakPoints.join('、')}</span>
                                            : <span className="text-green-600">全部掌握</span>
                                          }
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                      <div className={`text-base font-bold ${scoreColor(student.score)}`}>{student.score}</div>
                                      <div className={`text-[10px] ${trendColor(student.trend)}`}>{trendIcon(student.trend)}</div>
                                    </div>
                                  </div>
                                </button>

                                {isStudentExpanded && (
                                  <div className="mx-2 mt-1 mb-2 bg-white rounded-lg border border-gray-100 p-3 space-y-3">
                                    <div>
                                      <h5 className="text-[10px] font-bold text-gray-600 mb-1.5">各课时得分</h5>
                                      <div className="space-y-1.5">
                                        {student.lessonScores.map((ls, li) => (
                                          <div key={li} className="flex items-center justify-between">
                                            <span className="text-[11px] text-gray-700 truncate mr-2">{ls.lessonName}</span>
                                            <span className={`text-xs font-bold ${ls.score !== null ? scoreColor(ls.score) : 'text-gray-400'}`}>
                                              {ls.score !== null ? `${ls.score}分` : '未完成'}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <h5 className="text-[10px] font-bold text-red-500 mb-1">薄弱知识点</h5>
                                        {student.weakPoints.length === 0
                                          ? <span className="text-[10px] text-gray-400">无</span>
                                          : student.weakPoints.map((wp, wi) => (
                                            <div key={wi} className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] mb-0.5">{wp}</div>
                                          ))
                                        }
                                      </div>
                                      <div>
                                        <h5 className="text-[10px] font-bold text-green-500 mb-1">掌握较好</h5>
                                        {student.strongPoints.length === 0
                                          ? <span className="text-[10px] text-gray-400">无</span>
                                          : student.strongPoints.map((sp, si) => (
                                            <div key={si} className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] mb-0.5">{sp}</div>
                                          ))
                                        }
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {/* ==================== 学生分析 Tab ==================== */}
        {mainTab === 'students' && !selectedStudentId && (
          <>
            {/* 搜索框 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索学生姓名或学号..."
                className="w-full pl-9 pr-9 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* 时间筛选 */}
            <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
              {[
                { key: 'all' as const, label: '全部' },
                { key: 'semester' as const, label: '本学期' },
                { key: 'month' as const, label: '本月' },
                { key: 'week' as const, label: '本周' },
              ].map(f => (
                <button key={f.key} onClick={() => setTimeFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${timeFilter === f.key ? 'bg-sky-500 text-white' : 'bg-white text-gray-600 border border-gray-200 active:bg-gray-100'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* 学生列表 */}
            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">
                  {searchQuery ? `未找到“${searchQuery}”相关学生` : '暂无学生数据'}
                </div>
              ) : (
                filteredStudents
                  .sort((a, b) => b.overallScore - a.overallScore)
                  .map((student, idx) => {
                    const dimAvg = Math.round(dimensionKeys.reduce((sum, key) => sum + student.dimensions[key], 0) / dimensionKeys.length)
                    return (
                      <button key={student.id}
                        onClick={() => { setSelectedStudentId(student.id); setStudentUnitFilter('全部'); setStudentDetailTab('radar') }}
                        className="w-full bg-white rounded-xl p-3.5 shadow-sm text-left active:bg-gray-50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-sky-300'}`}>
                              {idx + 1}
                            </div>
                            <div className="ml-3 min-w-0">
                              <div className="text-sm font-semibold text-slate-800">{student.name}</div>
                              <div className="text-[10px] text-gray-500">{student.studentNo} · {student.totalAssignments} 次作业</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className={`text-lg font-bold ${scoreColor(dimAvg)}`}>{dimAvg}</div>
                            <div className={`text-xs ${trendColor(student.trend)}`}>{trendIcon(student.trend)} {student.trend === 'up' ? '进步' : student.trend === 'down' ? '退步' : '稳定'}</div>
                          </div>
                        </div>
                        {/* 多维度快速预览条 */}
                        <div className="mt-2.5 grid grid-cols-5 gap-1">
                          {dimensionKeys.map(key => (
                            <div key={key} className="text-center">
                              <div className="text-[9px] text-gray-400 mb-0.5">{dimensionLabels[key].slice(0, 2)}</div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full`} style={{ width: `${student.dimensions[key]}%`, backgroundColor: dimensionColors[key] }} />
                              </div>
                              <div className="text-[9px] font-medium mt-0.5" style={{ color: dimensionColors[key] }}>{student.dimensions[key]}</div>
                            </div>
                          ))}
                        </div>
                        {/* 薄弱知识点预览 */}
                        {student.allWeakPoints.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {student.allWeakPoints.slice(0, 3).map((wp, wi) => (
                              <span key={wi} className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px]">{wp}</span>
                            ))}
                            {student.allWeakPoints.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">+{student.allWeakPoints.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })
              )}
            </div>
          </>
        )}

        {/* ==================== 学生详情页 ==================== */}
        {mainTab === 'students' && selectedStudentId && selectedStudent && (
          <>
            {/* 返回按钮 */}
            <button onClick={() => setSelectedStudentId(null)}
              className="flex items-center text-sm text-sky-600 mb-4 active:text-sky-700">
              <ArrowLeft className="w-4 h-4 mr-1" />返回学生列表
            </button>

            {/* 学生信息卡 + 记录评分按钮 */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${scoreColor(selectedStudent.overallScore) === 'text-green-600' ? 'bg-green-500' : scoreColor(selectedStudent.overallScore) === 'text-blue-600' ? 'bg-blue-500' : scoreColor(selectedStudent.overallScore) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {selectedStudent.name[0]}
                  </div>
                  <div className="ml-3">
                    <div className="text-lg font-bold text-slate-800">{selectedStudent.name}</div>
                    <div className="text-xs text-gray-500">{selectedStudent.studentNo} · {selectedStudent.totalAssignments} 次作业</div>
                  </div>
                </div>
                <button onClick={() => { setShowRecordModal(true); setRecordScore(80); setRecordNote('') }}
                  className="px-3 py-2 bg-sky-500 text-white rounded-lg text-xs font-medium flex items-center active:bg-sky-600">
                  <Plus className="w-3.5 h-3.5 mr-1" />记录评分
                </button>
              </div>
            </div>

            {/* 三个 Tab：多维度评价 / 评价记录 / 知识掌握 */}
            <div className="flex space-x-2 mb-4">
              {[
                { key: 'radar' as const, label: '多维度评价', icon: Star },
                { key: 'records' as const, label: '评价记录', icon: ClipboardList },
                { key: 'knowledge' as const, label: '知识掌握', icon: BookOpen },
              ].map(d => (
                <button key={d.key} onClick={() => setStudentDetailTab(d.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium text-center transition-all flex items-center justify-center ${studentDetailTab === d.key ? 'bg-sky-500 text-white' : 'bg-white text-gray-600 border border-gray-200 active:bg-gray-100'}`}>
                  <d.icon className="w-3.5 h-3.5 mr-1" />{d.label}
                </button>
              ))}
            </div>

            {/* 多维度评价 Tab */}
            {studentDetailTab === 'radar' && (
              <div className="space-y-4">
                {/* 学期对比雷达图 */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-1">学期对比</h4>
                  <p className="text-[10px] text-gray-400 mb-3">实线为当前学期，虚线为往期学期</p>
                  <RadarChart
                    dimensions={selectedStudent.dimensions}
                    comparisons={selectedStudent.semesterSnapshots.slice(0, -1).map((snap, i) => ({
                      label: snap.semester,
                      dimensions: snap.dimensions,
                      color: semesterColors[(i + 1) % semesterColors.length]
                    }))}
                    size={230}
                  />
                  {/* 学期对比表格 */}
                  {selectedStudent.semesterSnapshots.length > 1 && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-1.5 text-gray-500 font-medium">维度</th>
                            {selectedStudent.semesterSnapshots.map((snap, i) => (
                              <th key={i} className="text-center py-1.5 font-medium" style={{ color: i === selectedStudent.semesterSnapshots.length - 1 ? '#6366f1' : semesterColors[(i + 1) % semesterColors.length] }}>
                                {snap.semester}
                              </th>
                            ))}
                            <th className="text-center py-1.5 text-gray-500 font-medium">变化</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dimensionKeys.map(key => {
                            const snaps = selectedStudent.semesterSnapshots
                            const first = snaps[0]?.dimensions[key] || 0
                            const last = snaps[snaps.length - 1]?.dimensions[key] || 0
                            const diff = last - first
                            return (
                              <tr key={key} className="border-b border-gray-50">
                                <td className="py-1.5 flex items-center">
                                  <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: dimensionColors[key] }} />
                                  {dimensionLabels[key]}
                                </td>
                                {snaps.map((snap, i) => (
                                  <td key={i} className="text-center py-1.5 font-bold" style={{ color: i === snaps.length - 1 ? '#6366f1' : semesterColors[(i + 1) % semesterColors.length] }}>
                                    {snap.dimensions[key]}
                                  </td>
                                ))}
                                <td className={`text-center py-1.5 font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                  {diff > 0 ? `+${diff}` : diff === 0 ? '-' : diff}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 阶段趋势折线图 */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-1">阶段趋势</h4>
                  <p className="text-[10px] text-gray-400 mb-3">各单元阶段的五维度变化趋势</p>
                  <TrendChart trendData={selectedStudent.dimensionTrend} />
                  {/* 图例 */}
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    {dimensionKeys.map(key => (
                      <div key={key} className="flex items-center text-[10px] text-gray-600">
                        <div className="w-3 h-1 rounded-full mr-1" style={{ backgroundColor: dimensionColors[key] }} />
                        {dimensionLabels[key]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 各维度详细分数 */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">当前各维度详情</h4>
                  <div className="space-y-3">
                    {dimensionKeys.map(key => {
                      const val = selectedStudent.dimensions[key]
                      // 计算与上学期的对比
                      const prevSemester = selectedStudent.semesterSnapshots.length >= 2 ? selectedStudent.semesterSnapshots[selectedStudent.semesterSnapshots.length - 2] : null
                      const prevVal = prevSemester ? prevSemester.dimensions[key] : null
                      const diff = prevVal !== null ? val - prevVal : null
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: dimensionColors[key] }} />
                              <span className="text-xs font-medium text-gray-700">{dimensionLabels[key]}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-bold" style={{ color: dimensionColors[key] }}>{val}</span>
                              {diff !== null && (
                                <span className={`text-[10px] ml-1.5 font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                  {diff > 0 ? `↑${diff}` : diff < 0 ? `↓${Math.abs(diff)}` : '→'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${val}%`, backgroundColor: dimensionColors[key] }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 评价记录 Tab */}
            {studentDetailTab === 'records' && (
              <div className="space-y-2">
                {selectedStudent.dimensionRecords.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">暂无评价记录</div>
                ) : (
                  selectedStudent.dimensionRecords.map((record, ri) => (
                    <div key={ri} className="bg-white rounded-xl shadow-sm p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: dimensionColors[record.dimension] }} />
                          <span className="text-xs font-medium" style={{ color: dimensionColors[record.dimension] }}>{dimensionLabels[record.dimension]}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm font-bold mr-2 ${scoreColor(record.score)}`}>{record.score}分</span>
                          <span className="text-[10px] text-gray-400">{record.date}</span>
                        </div>
                      </div>
                      {record.note && (
                        <div className="flex items-start mt-1">
                          <MessageSquare className="w-3 h-3 text-gray-300 mr-1.5 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{record.note}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 知识掌握 Tab */}
            {studentDetailTab === 'knowledge' && (
              <div className="space-y-4">
                {/* 知识点强弱项 */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h5 className="text-[10px] font-bold text-red-500 mb-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />薄弱知识点</h5>
                      {selectedStudent.allWeakPoints.length === 0
                        ? <span className="text-[10px] text-gray-400">无薄弱项，表现优秀！</span>
                        : selectedStudent.allWeakPoints.map((wp, wi) => (
                          <div key={wi} className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-[11px] mb-1">{wp}</div>
                        ))
                      }
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-green-500 mb-2 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />掌握较好</h5>
                      {selectedStudent.allStrongPoints.length === 0
                        ? <span className="text-[10px] text-gray-400">暂无突出项</span>
                        : selectedStudent.allStrongPoints.map((sp, si) => (
                          <div key={si} className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[11px] mb-1">{sp}</div>
                        ))
                      }
                    </div>
                  </div>
                </div>

                {/* 按单元成绩 */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">各单元成绩</h4>
                  <div className="space-y-2">
                    {selectedStudent.unitScores.map((us, ui) => (
                      <div key={ui} className="flex items-center">
                        <span className="text-xs text-gray-600 w-16 flex-shrink-0 truncate">{us.unitName}</span>
                        <div className="flex-1 mx-2">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${masteryColor(us.score)} h-2 rounded-full`} style={{ width: `${us.score}%` }} />
                          </div>
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${scoreColor(us.score)}`}>{us.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 按课时成绩 */}
                <div>
                  <div className="flex space-x-2 overflow-x-auto scrollbar-hide mb-3">
                    <button onClick={() => setStudentUnitFilter('全部')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap ${studentUnitFilter === '全部' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
                      全部课时
                    </button>
                    {allUnits.filter(u => getUnitStatus(u) !== 'not-started').map(u => (
                      <button key={u.id} onClick={() => setStudentUnitFilter(u.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap ${studentUnitFilter === u.id ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.name.replace(/第.单元：/, '')}
                      </button>
                    ))}
                  </div>
                  {allUnits
                    .filter(u => getUnitStatus(u) !== 'not-started')
                    .filter(u => studentUnitFilter === '全部' || u.id === studentUnitFilter)
                    .map(unit => {
                      const studentInUnit = unit.students.find(s => s.id === selectedStudentId)
                      if (!studentInUnit) return null
                      return (
                        <div key={unit.id} className="bg-white rounded-xl shadow-sm overflow-hidden mb-3">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <span className="text-xs font-bold text-gray-700">{unit.name}</span>
                          </div>
                          <div className="p-3 space-y-2">
                            {studentInUnit.lessonScores.map((ls, li) => (
                              <div key={li} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center min-w-0">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ls.score !== null ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    {ls.score !== null ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Clock className="w-3 h-3 text-gray-400" />}
                                  </div>
                                  <span className="ml-2 text-xs text-gray-700 truncate">{ls.lessonName}</span>
                                </div>
                                <span className={`text-sm font-bold ml-2 ${ls.score !== null ? scoreColor(ls.score) : 'text-gray-400'}`}>
                                  {ls.score !== null ? `${ls.score}分` : '未完成'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* 记录评分弹窗 */}
            {showRecordModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowRecordModal(false)}>
                <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-800">记录评分 - {selectedStudent.name}</h3>
                    <button onClick={() => setShowRecordModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* 选择维度 */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">评价维度</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {dimensionKeys.map(key => (
                        <button key={key} onClick={() => setRecordDimension(key)}
                          className={`py-2 rounded-lg text-[10px] font-medium text-center transition-all ${recordDimension === key ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                          style={recordDimension === key ? { backgroundColor: dimensionColors[key] } : {}}>
                          {dimensionLabels[key].slice(0, 2)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 分数滑块 */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">评分：<span className="text-lg font-bold ml-1" style={{ color: dimensionColors[recordDimension] }}>{recordScore}</span></label>
                    <input type="range" min={0} max={100} value={recordScore} onChange={e => setRecordScore(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                      <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
                    </div>
                  </div>

                  {/* 备注 */}
                  <div className="mb-5">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">备注（可选）</label>
                    <textarea value={recordNote} onChange={e => setRecordNote(e.target.value)}
                      placeholder="记录具体表现..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>

                  {/* 提交 */}
                  <button onClick={() => { setShowRecordModal(false); alert(`已记录：${dimensionLabels[recordDimension]} ${recordScore}分${recordNote ? ' - ' + recordNote : ''}\n（连接数据库后将永久保存）`) }}
                    className="w-full py-3 bg-sky-500 text-white rounded-xl text-sm font-medium active:bg-sky-600 transition-colors">
                    保存评分
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
