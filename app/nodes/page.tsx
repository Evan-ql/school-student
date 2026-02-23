'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen, Plus, ChevronDown, ChevronRight, X, Upload, FileText,
  Pencil, Trash2, Loader2, AlertCircle, CheckCircle,
  Calendar, Layers, Clock, Tag, Save, GraduationCap
} from 'lucide-react'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

// ========== 数据类型 ==========
interface KnowledgePoint {
  id: string
  name: string
  description: string
}

interface Lesson {
  id: string
  name: string
  teachingPlan: string
  knowledgePoints: KnowledgePoint[]
  objectives: string
}

interface Unit {
  id: string
  name: string
  lessons: Lesson[]
}

interface Semester {
  id: string
  grade: string        // 年级：一年级~六年级
  term: string         // 上学期 / 下学期
  label: string        // 显示名：如"三年级上学期"
  units: Unit[]
}

// ========== 演示数据 ==========
const demoSemesters: Semester[] = [
  {
    id: 'sem1', grade: '三年级', term: '上学期', label: '三年级上学期',
    units: [
      {
        id: 'u1', name: '第一单元：万以内的加法和减法',
        lessons: [
          {
            id: 'l1', name: '第1课：两位数加两位数',
            teachingPlan: '通过实物操作和竖式计算，让学生掌握两位数加两位数的进位加法。',
            objectives: '能正确计算两位数加两位数的进位加法，理解进位原理。',
            knowledgePoints: [
              { id: 'k1', name: '进位加法', description: '个位满十向十位进一' },
              { id: 'k2', name: '竖式计算', description: '用竖式进行加法运算' },
            ]
          },
          {
            id: 'l2', name: '第2课：两位数减两位数',
            teachingPlan: '通过对比加法，学习退位减法的计算方法。',
            objectives: '能正确计算两位数减两位数的退位减法。',
            knowledgePoints: [
              { id: 'k3', name: '退位减法', description: '个位不够减向十位借一' },
              { id: 'k4', name: '竖式计算', description: '用竖式进行减法运算' },
            ]
          },
        ]
      },
      {
        id: 'u2', name: '第二单元：乘法',
        lessons: [
          {
            id: 'l3', name: '第1课：乘法的意义',
            teachingPlan: '通过相同加数求和引入乘法概念。',
            objectives: '理解乘法是求几个相同加数的和的简便运算。',
            knowledgePoints: [
              { id: 'k5', name: '乘法意义', description: '理解乘法与加法的关系' },
              { id: 'k6', name: '乘法算式', description: '能正确列出乘法算式' },
            ]
          },
        ]
      },
    ]
  },
  {
    id: 'sem2', grade: '三年级', term: '下学期', label: '三年级下学期',
    units: [
      {
        id: 'u3', name: '第一单元：位置与方向',
        lessons: [
          {
            id: 'l4', name: '第1课：认识东南西北',
            teachingPlan: '通过实际观察和地图学习，让学生认识四个基本方向。',
            objectives: '能辨认东南西北四个方向，会用方向描述物体位置。',
            knowledgePoints: [
              { id: 'k7', name: '基本方向', description: '东南西北四个方向的辨认' },
            ]
          },
        ]
      },
    ]
  },
  {
    id: 'sem0', grade: '二年级', term: '下学期', label: '二年级下学期',
    units: [
      {
        id: 'u0', name: '第一单元：数据收集整理',
        lessons: [
          {
            id: 'l0', name: '第1课：简单的统计表',
            teachingPlan: '通过分类计数活动，学习用统计表整理数据。',
            objectives: '能用统计表记录和整理简单的数据。',
            knowledgePoints: [
              { id: 'k0', name: '统计表', description: '用表格记录和整理数据' },
            ]
          },
        ]
      },
    ]
  },
]

const gradeOptions = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
const termOptions = ['上学期', '下学期']

// ========== 生成ID ==========
let idCounter = 200
const genId = () => `id_${++idCounter}`

// ========== 主页面 ==========
export default function NodesPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [teacherSubject, setTeacherSubject] = useState<string>('')
  const [teacherLoaded, setTeacherLoaded] = useState(false)
  const [createMode, setCreateMode] = useState<'none' | 'choose' | 'manual' | 'file' | 'ai-describe'>('none')
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set())
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const [editingLesson, setEditingLesson] = useState<{ semesterId: string; unitId: string; lesson: Lesson } | null>(null)
  const [filterGrade, setFilterGrade] = useState<string>('全部')

  // 手动创建表单
  const [manualForm, setManualForm] = useState({
    semesterId: '',         // 选择已有学期的ID，空字符串表示新建
    grade: '三年级',
    term: '上学期',
    unitId: '',             // 选择已有单元的ID，空字符串表示新建
    unitNo: '1',           // 第几单元（新建时用）
    unitTitle: '',          // 单元标题（新建时用）
    lessonNo: '1',          // 第几课时
    lessonTitle: '',        // 课时标题
    teachingPlan: '',
    objectives: '',
    knowledgePoints: ''
  })

  const unitNoOptions = Array.from({ length: 12 }, (_, i) => String(i + 1))   // 1~12单元
  const lessonNoOptions = Array.from({ length: 20 }, (_, i) => String(i + 1)) // 1~20课时

  // 根据选择的学期获取可选单元
  const selectedSemester = manualForm.semesterId ? semesters.find(s => s.id === manualForm.semesterId) : null
  const availableUnits = selectedSemester ? selectedSemester.units : []

  // 文件识别
  const [uploading, setUploading] = useState(false)
  const [recognizedData, setRecognizedData] = useState<any>(null)
  const [recognizeError, setRecognizeError] = useState('')
  const [recognizeRaw, setRecognizeRaw] = useState('')

  useEffect(() => {
    // 加载教师信息
    fetch('/api/teacher').then(r => r.json()).then(data => {
      if (data.configured) setTeacherSubject(data.subject)
      setTeacherLoaded(true)
    }).catch(() => setTeacherLoaded(true))

    // 加载演示数据
    setSemesters(demoSemesters)
    setExpandedSemesters(new Set(demoSemesters.map(s => s.id)))
  }, [])

  // ========== 展开/折叠 ==========
  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setFn(next)
  }

  // ========== 按年级分组并排序 ==========
  const gradeOrder = (g: string) => gradeOptions.indexOf(g)
  const termOrder = (t: string) => t === '上学期' ? 0 : 1

  const sortedSemesters = [...semesters].sort((a, b) => {
    const gd = gradeOrder(a.grade) - gradeOrder(b.grade)
    if (gd !== 0) return gd
    return termOrder(a.term) - termOrder(b.term)
  })

  const filteredSemesters = filterGrade === '全部'
    ? sortedSemesters
    : sortedSemesters.filter(s => s.grade === filterGrade)

  // 获取所有出现的年级
  const existingGrades = [...new Set(semesters.map(s => s.grade))].sort((a, b) => gradeOrder(a) - gradeOrder(b))

  // ========== 文件上传识别 ==========
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setRecognizeError(''); setRecognizedData(null); setRecognizeRaw('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/courses/recognize', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) setRecognizeError(data.error || '识别失败')
      else if (data.raw) setRecognizeRaw(data.content)
      else setRecognizedData(data.data)
    } catch (err: any) { setRecognizeError(err.message) }
    finally { setUploading(false) }
  }

  const confirmImport = () => {
    if (!recognizedData) return
    const newSemesters: Semester[] = (recognizedData.semesters || []).map((sem: any) => ({
      id: genId(),
      grade: sem.grade || recognizedData.grade || '三年级',
      term: sem.term || '上学期',
      label: `${sem.grade || recognizedData.grade || '三年级'}${sem.term || '上学期'}`,
      units: (sem.units || []).map((unit: any) => ({
        id: genId(),
        name: unit.name,
        lessons: (unit.lessons || []).map((lesson: any) => ({
          id: genId(),
          name: lesson.name,
          teachingPlan: lesson.description || lesson.teachingPlan || '',
          objectives: lesson.objectives || '',
          knowledgePoints: (lesson.knowledgePoints || []).map((kp: any) => ({
            id: genId(),
            name: typeof kp === 'string' ? kp : kp.name || '',
            description: typeof kp === 'string' ? '' : kp.description || '',
          })),
        }))
      }))
    }))
    setSemesters([...semesters, ...newSemesters])
    newSemesters.forEach(s => setExpandedSemesters(prev => new Set([...prev, s.id])))
    setRecognizedData(null); setCreateMode('none')
  }

  // ========== 数字转中文 ==========
  const numToChinese = (n: string) => {
    const map: Record<string, string> = { '1':'一','2':'二','3':'三','4':'四','5':'五','6':'六','7':'七','8':'八','9':'九','10':'十','11':'十一','12':'十二' }
    return map[n] || n
  }

  // ========== 手动创建 ==========
  const handleManualCreate = () => {
    if (!manualForm.lessonTitle) return
    // 如果选了已有单元，不需要unitTitle；如果新建单元，需要unitTitle
    if (!manualForm.unitId && !manualForm.unitTitle) return

    const lessonName = `第${manualForm.lessonNo}课：${manualForm.lessonTitle}`

    const kps: KnowledgePoint[] = manualForm.knowledgePoints
      .split(/[,，、]/).filter(s => s.trim())
      .map(name => ({ id: genId(), name: name.trim(), description: '' }))

    const newLesson: Lesson = {
      id: genId(), name: lessonName,
      teachingPlan: manualForm.teachingPlan, objectives: manualForm.objectives,
      knowledgePoints: kps,
    }

    // 查找或创建学期
    let semester: Semester | undefined
    if (manualForm.semesterId) {
      semester = semesters.find(s => s.id === manualForm.semesterId)
    }
    if (!semester) {
      const semLabel = `${manualForm.grade}${manualForm.term}`
      semester = semesters.find(s => s.grade === manualForm.grade && s.term === manualForm.term)
      if (!semester) {
        semester = { id: genId(), grade: manualForm.grade, term: manualForm.term, label: semLabel, units: [] }
        semesters.push(semester)
      }
    }

    // 查找或创建单元
    let unit: Unit | undefined
    if (manualForm.unitId) {
      unit = semester.units.find(u => u.id === manualForm.unitId)
    }
    if (!unit) {
      const unitName = `第${numToChinese(manualForm.unitNo)}单元：${manualForm.unitTitle}`
      unit = semester.units.find(u => u.name === unitName)
      if (!unit) {
        unit = { id: genId(), name: unitName, lessons: [] }
        semester.units.push(unit)
      }
    }

    unit.lessons.push(newLesson)
    setSemesters([...semesters])
    setExpandedSemesters(new Set([...expandedSemesters, semester.id]))
    setExpandedUnits(new Set([...expandedUnits, unit.id]))
    // 课时序号自动+1，方便连续添加；保持学期和单元选择不变
    const nextLessonNo = String(Number(manualForm.lessonNo) + 1)
    setManualForm({ ...manualForm, semesterId: semester.id, unitId: unit.id, lessonNo: nextLessonNo.length <= 2 ? nextLessonNo : manualForm.lessonNo, lessonTitle: '', teachingPlan: '', objectives: '', knowledgePoints: '' })
  }

  // ========== 编辑课时教案 ==========
  const saveLesson = () => {
    if (!editingLesson) return
    setSemesters(semesters.map(sem => {
      if (sem.id !== editingLesson.semesterId) return sem
      return {
        ...sem, units: sem.units.map(u => {
          if (u.id !== editingLesson.unitId) return u
          return { ...u, lessons: u.lessons.map(l => l.id === editingLesson.lesson.id ? editingLesson.lesson : l) }
        })
      }
    }))
    setEditingLesson(null)
  }

  // ========== 删除课时 ==========
  const deleteLesson = (semesterId: string, unitId: string, lessonId: string) => {
    setSemesters(semesters.map(sem => {
      if (sem.id !== semesterId) return sem
      return {
        ...sem, units: sem.units.map(u => {
          if (u.id !== unitId) return u
          return { ...u, lessons: u.lessons.filter(l => l.id !== lessonId) }
        })
      }
    }))
  }

  // ========== 统计 ==========
  const totalLessons = semesters.reduce((a, s) => a + s.units.reduce((b, u) => b + u.lessons.length, 0), 0)
  const totalKPs = semesters.reduce((a, s) => a + s.units.reduce((b, u) => b + u.lessons.reduce((c, l) => c + l.knowledgePoints.length, 0), 0), 0)
  const lessonsWithPlan = semesters.reduce((a, s) => a + s.units.reduce((b, u) => b + u.lessons.filter(l => l.teachingPlan.trim()).length, 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 pb-safe-nav">
        {/* 页头 */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">课程管理</h1>
            {teacherSubject && (
              <p className="text-sm text-gray-500 mt-0.5">学科：{teacherSubject}</p>
            )}
          </div>
          <button onClick={() => setCreateMode('choose')}
            className="flex items-center bg-sky-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-sky-600 active:bg-indigo-800 transition-colors text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />创建课程
          </button>
        </div>

        {/* 未设置教师信息提示 */}
        {teacherLoaded && !teacherSubject && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>请先到<a href="/settings" className="text-sky-600 font-medium underline mx-1">设置页面</a>填写教师信息（选择学科），课程将自动关联您的学科。</span>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-sky-600">{semesters.length}</div>
            <div className="text-[10px] sm:text-sm text-gray-500 mt-0.5">学期</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalLessons}</div>
            <div className="text-[10px] sm:text-sm text-gray-500 mt-0.5">课时</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{lessonsWithPlan}</div>
            <div className="text-[10px] sm:text-sm text-gray-500 mt-0.5">已有教案</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{totalKPs}</div>
            <div className="text-[10px] sm:text-sm text-gray-500 mt-0.5">知识点</div>
          </div>
        </div>

        {/* 年级筛选 */}
        {existingGrades.length > 1 && (
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setFilterGrade('全部')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterGrade === '全部' ? 'bg-sky-500 text-white' : 'bg-white text-gray-600 border border-gray-200 active:bg-gray-50'}`}>
              全部
            </button>
            {existingGrades.map(g => (
              <button key={g} onClick={() => setFilterGrade(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterGrade === g ? 'bg-sky-500 text-white' : 'bg-white text-gray-600 border border-gray-200 active:bg-gray-50'}`}>
                {g}
              </button>
            ))}
          </div>
        )}

        {/* 课程树 */}
        <div className="space-y-3">
          {filteredSemesters.map((semester) => (
            <div key={semester.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* 学期头 */}
              <button onClick={() => toggle(expandedSemesters, setExpandedSemesters, semester.id)}
                className="w-full p-3.5 sm:p-4 bg-sky-50 flex items-center justify-between active:bg-sky-100 transition-colors">
                <div className="flex items-center min-w-0">
                  {expandedSemesters.has(semester.id) ? <ChevronDown className="w-5 h-5 text-sky-600 mr-2 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-sky-600 mr-2 flex-shrink-0" />}
                  <GraduationCap className="w-5 h-5 text-sky-600 mr-2 flex-shrink-0" />
                  <span className="font-bold text-slate-800 text-sm sm:text-base truncate">{semester.label}</span>
                  <span className="ml-2 px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px] sm:text-xs font-medium flex-shrink-0">
                    {semester.units.reduce((a, u) => a + u.lessons.length, 0)} 课时
                  </span>
                </div>
              </button>

              {expandedSemesters.has(semester.id) && semester.units.map((unit) => (
                <div key={unit.id} className="border-t border-gray-100">
                  {/* 单元 */}
                  <button onClick={() => toggle(expandedUnits, setExpandedUnits, unit.id)}
                    className="w-full p-3 sm:p-4 pl-6 sm:pl-8 flex items-center active:bg-gray-50 transition-colors">
                    <div className="flex items-center min-w-0">
                      {expandedUnits.has(unit.id) ? <ChevronDown className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />}
                      <Layers className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      <span className="font-medium text-slate-800 text-xs sm:text-sm truncate">{unit.name}</span>
                      <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium flex-shrink-0">
                        {unit.lessons.length} 课
                      </span>
                    </div>
                  </button>

                  {/* 课时列表 */}
                  {expandedUnits.has(unit.id) && unit.lessons.map((lesson) => (
                    <div key={lesson.id} className="border-t border-gray-50 p-3 pl-10 sm:pl-14 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            <Clock className="w-3.5 h-3.5 text-green-600 mr-2 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">{lesson.name}</span>
                          </div>
                          {lesson.knowledgePoints.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 ml-5">
                              {lesson.knowledgePoints.map(kp => (
                                <span key={kp.id} className="inline-flex items-center px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px]">
                                  <Tag className="w-2.5 h-2.5 mr-0.5" />{kp.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="ml-5 mt-1">
                            {lesson.teachingPlan ? (
                              <span className="text-[10px] text-green-600 flex items-center"><CheckCircle className="w-2.5 h-2.5 mr-0.5" />已有教案</span>
                            ) : (
                              <span className="text-[10px] text-gray-400">未上传教案</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                          <button onClick={() => setEditingLesson({ semesterId: semester.id, unitId: unit.id, lesson: { ...lesson, knowledgePoints: [...lesson.knowledgePoints] } })}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded active:bg-sky-100">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteLesson(semester.id, unit.id, lesson.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded active:bg-red-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {filteredSemesters.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">{semesters.length === 0 ? '还没有课程，点击"创建课程"开始' : '当前筛选条件下没有课程'}</p>
            </div>
          )}
        </div>
      </div>

      {/* ========== 创建方式选择 ========== */}
      {createMode === 'choose' && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">创建课程</h2>
              <button onClick={() => setCreateMode('none')} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <button onClick={() => setCreateMode('file')}
                className="w-full p-4 bg-sky-50 border-2 border-sky-200 rounded-xl text-left hover:border-indigo-400 active:bg-sky-100 transition-all">
                <div className="flex items-center mb-1">
                  <Upload className="w-5 h-5 text-sky-600 mr-2" />
                  <span className="font-semibold text-slate-800">文件识别</span>
                </div>
                <p className="text-xs text-gray-600 ml-7">上传教材目录、课程表或教学计划，AI 自动识别课程结构</p>
              </button>
              <button onClick={() => setCreateMode('ai-describe')}
                className="w-full p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-left hover:border-amber-400 active:bg-amber-100 transition-all">
                <div className="flex items-center mb-1">
                  <FileText className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="font-semibold text-slate-800">AI 描述创建</span>
                </div>
                <p className="text-xs text-gray-600 ml-7">用自然语言描述课程内容，AI 自动生成完整课程结构和教案</p>
              </button>
              <button onClick={() => setCreateMode('manual')}
                className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-xl text-left hover:border-green-400 active:bg-green-100 transition-all">
                <div className="flex items-center mb-1">
                  <Pencil className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-slate-800">手动创建</span>
                </div>
                <p className="text-xs text-gray-600 ml-7">按年级学期 → 单元 → 课时逐步填写，可同时添加教案和知识点</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 文件识别弹窗 ========== */}
      {createMode === 'file' && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">文件识别课程</h2>
              <button onClick={() => { setCreateMode('none'); setRecognizedData(null); setRecognizeError(''); setRecognizeRaw('') }}
                className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {!recognizedData && !recognizeRaw && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">上传教材目录、课程表或教学计划</p>
                  <p className="text-xs text-gray-400 mb-3">支持图片（PNG/JPG）、文本（TXT/MD）等格式</p>
                  <label className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg text-sm cursor-pointer hover:bg-sky-600 active:bg-indigo-800">
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />识别中...</> : <><Upload className="w-4 h-4 mr-2" />选择文件</>}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*,.txt,.md,.csv,.json" />
                  </label>
                </div>
                {recognizeError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{recognizeError}
                  </div>
                )}
              </>
            )}
            {recognizedData && (
              <>
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center mb-4">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />识别成功！请确认课程结构
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm max-h-60 overflow-y-auto">
                  {recognizedData.semesters?.map((sem: any, si: number) => (
                    <div key={si} className="mb-2">
                      <div className="font-semibold text-sky-700">{sem.grade || ''}{sem.term || ''}</div>
                      {sem.units?.map((unit: any, ui: number) => (
                        <div key={ui} className="ml-3 mb-1">
                          <div className="text-purple-700 text-xs font-medium">{unit.name}</div>
                          {unit.lessons?.map((lesson: any, li: number) => (
                            <div key={li} className="ml-3 text-xs text-gray-600">· {lesson.name}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button onClick={confirmImport} className="flex-1 bg-sky-500 text-white py-2.5 rounded-lg font-medium hover:bg-sky-600 active:bg-indigo-800">确认导入</button>
                  <button onClick={() => { setRecognizedData(null); setRecognizeRaw('') }} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">重新上传</button>
                </div>
              </>
            )}
            {recognizeRaw && (
              <>
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm flex items-start mb-4">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />AI 返回了非标准格式，请参考内容手动创建
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs max-h-60 overflow-y-auto whitespace-pre-wrap">{recognizeRaw}</div>
                <button onClick={() => { setRecognizeRaw(''); setCreateMode('manual') }}
                  className="w-full bg-sky-500 text-white py-2.5 rounded-lg font-medium hover:bg-sky-600">切换到手动创建</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========== AI 描述创建弹窗 ========== */}
      {createMode === 'ai-describe' && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">AI 描述创建</h2>
              <button onClick={() => { setCreateMode('none'); setRecognizedData(null); setRecognizeError(''); setRecognizeRaw('') }}
                className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {!recognizedData && !recognizeRaw && (
              <>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-3">用自然语言描述你想创建的课程，AI 会自动生成完整的课程结构、教案和知识点。</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-amber-800 mb-1">示例描述：</p>
                    <p className="text-xs text-amber-700">“三年级上学期第三单元除法，包含3个课时：除法的意义、有余数的除法、除法验算”</p>
                    <p className="text-xs text-amber-700 mt-1">“四年级下学期第一单元到第四单元，包括四则运算、观察物体、运算律、小数的意义和性质”</p>
                  </div>
                  <textarea
                    id="ai-describe-input"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="请描述你想创建的课程内容..."
                  />
                </div>
                <button
                  onClick={async () => {
                    const textarea = document.getElementById('ai-describe-input') as HTMLTextAreaElement
                    const desc = textarea?.value?.trim()
                    if (!desc) return
                    setUploading(true)
                    setRecognizeError('')
                    try {
                      const res = await fetch('/api/courses/describe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ description: desc, subject: teacherSubject })
                      })
                      const result = await res.json()
                      if (!res.ok) throw new Error(result.error || '生成失败')
                      if (result.raw) {
                        setRecognizeRaw(result.content)
                      } else {
                        setRecognizedData(result.data)
                      }
                    } catch (err: any) {
                      setRecognizeError(err.message)
                    } finally {
                      setUploading(false)
                    }
                  }}
                  disabled={uploading}
                  className="w-full py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 flex items-center justify-center">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />生成中...</> : <><FileText className="w-4 h-4 mr-2" />AI 生成课程</>}
                </button>
                {recognizeError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-xs text-red-700">{recognizeError}</span>
                  </div>
                )}
              </>
            )}

            {/* AI 生成结果预览 - 复用文件识别的确认逻辑 */}
            {recognizedData && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-xs text-green-700">AI 已生成课程结构，请确认后保存</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(recognizedData, null, 2)}</pre>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => { setRecognizedData(null); setRecognizeRaw('') }}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">重新生成</button>
                  <button onClick={() => confirmImport()}
                    className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">确认保存</button>
                </div>
              </div>
            )}

            {recognizeRaw && (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-xs text-yellow-700">AI 返回了非标准格式，请参考以下内容手动创建</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{recognizeRaw}</pre>
                </div>
                <button onClick={() => { setRecognizeRaw(''); setCreateMode('manual') }}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">切换到手动创建</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== 手动创建弹窗 ========== */}
      {createMode === 'manual' && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">手动创建课时</h2>
              <button onClick={() => setCreateMode('none')} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleManualCreate() }} className="space-y-3">
              {/* 学期选择：已有的可直接选，也可新建 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">学期</label>
                <select value={manualForm.semesterId}
                  onChange={e => {
                    const val = e.target.value
                    if (val === '__new__') {
                      setManualForm({ ...manualForm, semesterId: '', unitId: '' })
                    } else {
                      const sem = semesters.find(s => s.id === val)
                      setManualForm({ ...manualForm, semesterId: val, grade: sem?.grade || '三年级', term: sem?.term || '上学期', unitId: '' })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {semesters.length > 0 && semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.label}（{s.units.length}个单元）</option>
                  ))}
                  <option value="__new__">＋ 新建学期</option>
                </select>
              </div>

              {/* 新建学期时显示年级和学期选择 */}
              {!manualForm.semesterId && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-sky-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-sky-700 mb-1">年级</label>
                    <select value={manualForm.grade} onChange={e => setManualForm({ ...manualForm, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-sky-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                      {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-sky-700 mb-1">学期</label>
                    <select value={manualForm.term} onChange={e => setManualForm({ ...manualForm, term: e.target.value })}
                      className="w-full px-3 py-2 border border-sky-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                      {termOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* 单元选择：只有已创建的单元才能选，也可新建 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">单元</label>
                {availableUnits.length > 0 ? (
                  <select value={manualForm.unitId}
                    onChange={e => {
                      const val = e.target.value
                      if (val === '__new__') {
                        setManualForm({ ...manualForm, unitId: '' })
                      } else {
                        // 选择已有单元后，自动设置课时序号为下一个
                        const selectedUnit = availableUnits.find(u => u.id === val)
                        const nextLesson = selectedUnit ? String(selectedUnit.lessons.length + 1) : '1'
                        setManualForm({ ...manualForm, unitId: val, lessonNo: nextLesson })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {availableUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.name}（已有{u.lessons.length}课时）</option>
                    ))}
                    <option value="__new__">＋ 新建单元</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                    {manualForm.semesterId ? '该学期下暂无单元，请新建' : '请先选择或新建学期'}
                  </div>
                )}
              </div>

              {/* 新建单元时（或该学期无单元时）显示单元序号和标题 */}
              {(!manualForm.unitId || availableUnits.length === 0) && (
                <div className="p-3 bg-green-50 rounded-lg space-y-2">
                  <div className="text-[10px] font-medium text-green-700">新建单元</div>
                  <div className="flex items-center space-x-2">
                    <select value={manualForm.unitNo} onChange={e => setManualForm({ ...manualForm, unitNo: e.target.value })}
                      className="w-24 flex-shrink-0 px-3 py-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                      {unitNoOptions.map(n => <option key={n} value={n}>第{n}单元</option>)}
                    </select>
                    <input type="text" value={manualForm.unitTitle} onChange={e => setManualForm({ ...manualForm, unitTitle: e.target.value })}
                      className="flex-1 px-3 py-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      placeholder="单元标题，如：万以内的加法和减法" required />
                  </div>
                </div>
              )}

              {/* 课时 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">课时</label>
                <div className="flex items-center space-x-2">
                  <select value={manualForm.lessonNo} onChange={e => setManualForm({ ...manualForm, lessonNo: e.target.value })}
                    className="w-24 flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {lessonNoOptions.map(n => <option key={n} value={n}>第{n}课</option>)}
                  </select>
                  <input type="text" value={manualForm.lessonTitle} onChange={e => setManualForm({ ...manualForm, lessonTitle: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="课时标题，如：两位数加法" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">教学目标 <span className="text-gray-400 font-normal">(可选)</span></label>
                <input type="text" value={manualForm.objectives} onChange={e => setManualForm({ ...manualForm, objectives: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="本课时的教学目标" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">教案内容 <span className="text-gray-400 font-normal">(可选，后续可补充)</span></label>
                <textarea value={manualForm.teachingPlan} onChange={e => setManualForm({ ...manualForm, teachingPlan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3} placeholder="详细教案内容，AI 批改时会参考此内容判断知识点掌握情况" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">知识点 <span className="text-gray-400 font-normal">(逗号分隔)</span></label>
                <input type="text" value={manualForm.knowledgePoints} onChange={e => setManualForm({ ...manualForm, knowledgePoints: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="如：进位加法，竖式计算，数位对齐" />
              </div>
              <div className="flex space-x-3 pt-1">
                <button type="submit" className="flex-1 bg-sky-500 text-white py-2.5 rounded-lg font-medium hover:bg-sky-600 active:bg-indigo-800">添加课时</button>
                <button type="button" onClick={() => setCreateMode('none')} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">关闭</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== 编辑课时教案弹窗 ========== */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">编辑教案</h2>
              <button onClick={() => setEditingLesson(null)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">课时名称</label>
                <input type="text" value={editingLesson.lesson.name}
                  onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, name: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">教学目标</label>
                <input type="text" value={editingLesson.lesson.objectives}
                  onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, objectives: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="本课时的教学目标" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">教案内容</label>
                <textarea value={editingLesson.lesson.teachingPlan}
                  onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, teachingPlan: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={5} placeholder="详细的教案内容" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">知识点</label>
                <div className="space-y-2">
                  {editingLesson.lesson.knowledgePoints.map((kp, idx) => (
                    <div key={kp.id} className="flex items-center space-x-2">
                      <input type="text" value={kp.name}
                        onChange={e => {
                          const kps = [...editingLesson.lesson.knowledgePoints]
                          kps[idx] = { ...kps[idx], name: e.target.value }
                          setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, knowledgePoints: kps } })
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="知识点名称" />
                      <input type="text" value={kp.description}
                        onChange={e => {
                          const kps = [...editingLesson.lesson.knowledgePoints]
                          kps[idx] = { ...kps[idx], description: e.target.value }
                          setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, knowledgePoints: kps } })
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="描述（可选）" />
                      <button onClick={() => {
                        const kps = editingLesson.lesson.knowledgePoints.filter((_, i) => i !== idx)
                        setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, knowledgePoints: kps } })
                      }} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const kps = [...editingLesson.lesson.knowledgePoints, { id: genId(), name: '', description: '' }]
                    setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, knowledgePoints: kps } })
                  }} className="text-xs text-sky-600 hover:text-sky-700 flex items-center">
                    <Plus className="w-3.5 h-3.5 mr-1" />添加知识点
                  </button>
                </div>
              </div>
              <div className="flex space-x-3 pt-1">
                <button onClick={saveLesson} className="flex-1 bg-sky-500 text-white py-2.5 rounded-lg font-medium hover:bg-sky-600 active:bg-indigo-800 flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />保存
                </button>
                <button onClick={() => setEditingLesson(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
