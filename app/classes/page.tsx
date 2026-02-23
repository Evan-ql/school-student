'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Users, X, ChevronUp, ArrowRightLeft, Archive,
  UserPlus, Trash2, GraduationCap, Calendar, User
} from 'lucide-react'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

// ========== 数据类型 ==========
interface Student {
  id: string; name: string; studentNo: string; enrollYear: number; currentGrade: number
}
interface TeachingRecord {
  teacherName: string; startDate: string; endDate: string | null
}
interface ClassInfo {
  id: string; name: string; grade: number; schoolYear: string
  status: 'active' | 'transferred' | 'graduated'
  students: Student[]; teachingHistory: TeachingRecord[]; createdAt: string
}

// ========== 演示数据 ==========
const currentYear = new Date().getFullYear()
const schoolYear = `${currentYear - 1}-${currentYear}`
const demoClasses: ClassInfo[] = [
  {
    id: '1', name: '1班', grade: 3, schoolYear, status: 'active',
    students: [
      { id: 's1', name: '张小明', studentNo: '2023001', enrollYear: 2023, currentGrade: 3 },
      { id: 's2', name: '李小红', studentNo: '2023002', enrollYear: 2023, currentGrade: 3 },
      { id: 's3', name: '王小刚', studentNo: '2023003', enrollYear: 2023, currentGrade: 3 },
      { id: 's4', name: '赵小丽', studentNo: '2023004', enrollYear: 2023, currentGrade: 3 },
    ],
    teachingHistory: [{ teacherName: '当前教师', startDate: '2025-09-01', endDate: null }],
    createdAt: '2023-09-01T00:00:00Z',
  },
  {
    id: '2', name: '2班', grade: 3, schoolYear, status: 'active',
    students: [
      { id: 's5', name: '刘小伟', studentNo: '2023005', enrollYear: 2023, currentGrade: 3 },
      { id: 's6', name: '陈小芳', studentNo: '2023006', enrollYear: 2023, currentGrade: 3 },
      { id: 's7', name: '周小杰', studentNo: '2023007', enrollYear: 2023, currentGrade: 3 },
    ],
    teachingHistory: [{ teacherName: '当前教师', startDate: '2025-09-01', endDate: null }],
    createdAt: '2023-09-01T00:00:00Z',
  },
  {
    id: '3', name: '1班', grade: 5, schoolYear: `${currentYear - 2}-${currentYear - 1}`, status: 'transferred',
    students: [
      { id: 's8', name: '孙小龙', studentNo: '2021001', enrollYear: 2021, currentGrade: 5 },
      { id: 's9', name: '吴小燕', studentNo: '2021002', enrollYear: 2021, currentGrade: 5 },
    ],
    teachingHistory: [
      { teacherName: '张老师', startDate: '2023-09-01', endDate: '2024-07-01' },
      { teacherName: '当前教师', startDate: '2024-09-01', endDate: '2025-07-01' },
    ],
    createdAt: '2021-09-01T00:00:00Z',
  },
]
const gradeLabels = ['', '一', '二', '三', '四', '五', '六']
let idCounter = 300
const genId = () => `id_${++idCounter}`

// ========== 主页面 ==========
export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'transferred' | 'graduated'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [showStudents, setShowStudents] = useState<ClassInfo | null>(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showPromote, setShowPromote] = useState<ClassInfo | null>(null)
  const [showTransfer, setShowTransfer] = useState<ClassInfo | null>(null)
  const [showHistory, setShowHistory] = useState<ClassInfo | null>(null)
  const [createForm, setCreateForm] = useState({ name: '', grade: 3 })
  const [studentForm, setStudentForm] = useState({ name: '', studentNo: '', enrollYear: currentYear })

  useEffect(() => { setClasses(demoClasses); setLoading(false) }, [])

  const handleCreate = () => {
    if (!createForm.name) return
    const newClass: ClassInfo = {
      id: genId(), name: createForm.name, grade: createForm.grade,
      schoolYear: `${currentYear - 1}-${currentYear}`, status: 'active', students: [],
      teachingHistory: [{ teacherName: '当前教师', startDate: new Date().toISOString().split('T')[0], endDate: null }],
      createdAt: new Date().toISOString(),
    }
    setClasses([newClass, ...classes]); setShowCreate(false); setCreateForm({ name: '', grade: 3 })
  }

  const handlePromote = (cls: ClassInfo) => {
    if (cls.grade >= 6) {
      setClasses(classes.map(c => c.id === cls.id ? { ...c, status: 'graduated' as const } : c))
    } else {
      setClasses(classes.map(c => {
        if (c.id !== cls.id) return c
        const newGrade = c.grade + 1
        return { ...c, grade: newGrade, schoolYear: `${currentYear}-${currentYear + 1}`, students: c.students.map(s => ({ ...s, currentGrade: newGrade })) }
      }))
    }
    setShowPromote(null)
  }

  const handleTransfer = (cls: ClassInfo) => {
    setClasses(classes.map(c => {
      if (c.id !== cls.id) return c
      return { ...c, status: 'transferred' as const, teachingHistory: c.teachingHistory.map(h => h.endDate === null ? { ...h, endDate: new Date().toISOString().split('T')[0] } : h) }
    }))
    setShowTransfer(null)
  }

  const handleAddStudent = () => {
    if (!showStudents || !studentForm.name || !studentForm.studentNo) return
    const newStudent: Student = { id: genId(), name: studentForm.name, studentNo: studentForm.studentNo, enrollYear: studentForm.enrollYear, currentGrade: showStudents.grade }
    const updated = classes.map(c => c.id !== showStudents.id ? c : { ...c, students: [...c.students, newStudent] })
    setClasses(updated); setShowStudents(updated.find(c => c.id === showStudents.id) || showStudents)
    setStudentForm({ name: '', studentNo: '', enrollYear: currentYear }); setShowAddStudent(false)
  }

  const handleDeleteStudent = (classId: string, studentId: string) => {
    const updated = classes.map(c => c.id !== classId ? c : { ...c, students: c.students.filter(s => s.id !== studentId) })
    setClasses(updated); if (showStudents) setShowStudents(updated.find(c => c.id === showStudents.id) || null)
  }

  const filteredClasses = filterStatus === 'all' ? classes : classes.filter(c => c.status === filterStatus)
  const statusLabel = (s: string) => s === 'active' ? '在教' : s === 'transferred' ? '已移交' : '已毕业'
  const statusColor = (s: string) => s === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : s === 'transferred' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-500 border border-slate-200'

  if (loading) {
    return (<div className="min-h-screen glass-bg-gradient"><TopNav /><div className="flex items-center justify-center h-[60vh]"><div className="text-slate-400">加载中...</div></div></div>)
  }

  return (
    <div className="min-h-screen glass-bg-gradient">
      <TopNav />
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-safe-nav">
        {/* 页头 */}
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">班级管理</h1>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center btn-primary px-3 py-2 sm:px-4 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4 mr-1.5" />创建班级
          </button>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="glass-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-sky-500">{classes.filter(c => c.status === 'active').length}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">在教班级</div>
          </div>
          <div className="glass-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-violet-500">{classes.reduce((a, c) => a + c.students.length, 0)}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">学生总数</div>
          </div>
          <div className="glass-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-emerald-500">{classes.filter(c => c.status === 'graduated').length}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">已毕业</div>
          </div>
        </div>

        {/* 状态筛选 */}
        <div className="glass-tab flex p-0.5 mb-4 w-fit">
          {[
            { key: 'all', label: '全部' },
            { key: 'active', label: '在教' },
            { key: 'transferred', label: '已移交' },
            { key: 'graduated', label: '已毕业' },
          ].map(item => (
            <button key={item.key} onClick={() => setFilterStatus(item.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === item.key ? 'glass-tab-active text-sky-600' : 'text-slate-400'}`}>
              {item.label}
            </button>
          ))}
        </div>

        {/* 班级列表 */}
        <div className="space-y-3">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="glass-card p-4 sm:p-5 animate-glass-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-sky-500" />
                  </div>
                  <div className="ml-3 min-w-0">
                    <div className="flex items-center">
                      <span className="text-sm sm:text-base font-semibold text-slate-700">{gradeLabels[cls.grade]}年级{cls.name}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(cls.status)}`}>
                        {statusLabel(cls.status)}
                      </span>
                    </div>
                    <div className="flex items-center text-[10px] sm:text-xs text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 mr-1" />{cls.schoolYear}学年
                      <span className="mx-1.5">·</span>
                      <Users className="w-3 h-3 mr-1" />{cls.students.length} 名学生
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowStudents(cls)}
                  className="glass-btn flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-sky-600">
                  <Users className="w-3.5 h-3.5 mr-1" />学生管理
                </button>
                {cls.status === 'active' && (
                  <>
                    <button onClick={() => setShowPromote(cls)}
                      className="glass-btn flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-600">
                      <ChevronUp className="w-3.5 h-3.5 mr-1" />{cls.grade >= 6 ? '毕业' : '升学'}
                    </button>
                    <button onClick={() => setShowTransfer(cls)}
                      className="glass-btn flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-amber-600">
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />移交
                    </button>
                  </>
                )}
                <button onClick={() => setShowHistory(cls)}
                  className="glass-btn flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500">
                  <Archive className="w-3.5 h-3.5 mr-1" />任教记录
                </button>
              </div>
            </div>
          ))}
          {filteredClasses.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-400">{classes.length === 0 ? '还没有班级，点击"创建班级"开始' : '当前筛选条件下没有班级'}</p>
            </div>
          )}
        </div>
      </div>

      {/* ========== 创建班级弹窗 ========== */}
      {showCreate && (
        <div className="fixed inset-0 glass-modal-overlay flex items-end sm:items-center justify-center z-50">
          <div className="glass-modal p-5 sm:p-6 w-full sm:max-w-md animate-glass-slide-up sm:animate-glass-scale" style={{ borderRadius: '22px 22px 0 0', ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { borderRadius: '22px' } : {}) }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-700">创建新班级</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-full hover:bg-slate-100/60"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleCreate() }} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">年级</label>
                <select value={createForm.grade} onChange={e => setCreateForm({ ...createForm, grade: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 glass-input rounded-xl text-sm">
                  {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{gradeLabels[g]}年级</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">班号</label>
                <input type="text" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 glass-input rounded-xl text-sm" placeholder="如：1班、2班" required />
              </div>
              <div className="p-3 glass-card-light text-xs text-slate-400">
                <p>学年：{currentYear - 1}-{currentYear}</p>
                <p className="mt-1">班级创建后，您将自动成为该班级的任教教师。</p>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-medium">创建</button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 glass-btn py-2.5 rounded-xl text-sm font-medium text-slate-500">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== 学生管理弹窗 ========== */}
      {showStudents && (
        <div className="fixed inset-0 glass-modal-overlay flex items-end sm:items-center justify-center z-50">
          <div className="glass-modal p-5 sm:p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-glass-slide-up sm:animate-glass-scale" style={{ borderRadius: '22px 22px 0 0', ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { borderRadius: '22px' } : {}) }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-700">{gradeLabels[showStudents.grade]}年级{showStudents.name} · 学生管理</h2>
              <button onClick={() => { setShowStudents(null); setShowAddStudent(false) }} className="p-1.5 rounded-full hover:bg-slate-100/60"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 mb-4">
              {showStudents.students.length === 0 && <div className="text-center py-6 text-slate-400 text-sm">暂无学生</div>}
              {showStudents.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 glass-card-light">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="ml-3 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{student.name}</div>
                      <div className="text-[10px] text-slate-400">学号 {student.studentNo} · {student.enrollYear}年入学</div>
                    </div>
                  </div>
                  {showStudents.status === 'active' && (
                    <button onClick={() => handleDeleteStudent(showStudents.id, student.id)}
                      className="p-1.5 text-rose-300 hover:text-rose-500 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {showStudents.status === 'active' && !showAddStudent && (
              <button onClick={() => setShowAddStudent(true)}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-sky-300 hover:text-sky-500 flex items-center justify-center transition-colors">
                <UserPlus className="w-4 h-4 mr-2" />添加学生
              </button>
            )}
            {showAddStudent && (
              <div className="glass-card-light p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">姓名</label>
                    <input type="text" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full px-2.5 py-2 glass-input rounded-xl text-sm" placeholder="学生姓名" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">学号</label>
                    <input type="text" value={studentForm.studentNo} onChange={e => setStudentForm({ ...studentForm, studentNo: e.target.value })}
                      className="w-full px-2.5 py-2 glass-input rounded-xl text-sm" placeholder="学号" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">入学年份</label>
                  <select value={studentForm.enrollYear} onChange={e => setStudentForm({ ...studentForm, enrollYear: parseInt(e.target.value) })}
                    className="w-full px-2.5 py-2 glass-input rounded-xl text-sm">
                    {Array.from({ length: 7 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}年</option>)}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleAddStudent} className="flex-1 btn-primary py-2 rounded-xl text-sm font-medium">添加</button>
                  <button onClick={() => setShowAddStudent(false)} className="flex-1 glass-btn py-2 rounded-xl text-sm font-medium text-slate-500">取消</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== 升学确认弹窗 ========== */}
      {showPromote && (
        <div className="fixed inset-0 glass-modal-overlay flex items-end sm:items-center justify-center z-50">
          <div className="glass-modal p-5 sm:p-6 w-full sm:max-w-sm animate-glass-scale">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-700">{showPromote.grade >= 6 ? '确认毕业' : '确认升学'}</h2>
              <button onClick={() => setShowPromote(null)} className="p-1.5 rounded-full hover:bg-slate-100/60"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="mb-4">
              {showPromote.grade >= 6 ? (
                <div className="p-3 glass-card-light text-sm text-amber-700">
                  <p className="font-medium mb-1">{gradeLabels[showPromote.grade]}年级{showPromote.name} 即将毕业</p>
                  <p className="text-xs text-amber-600/70">毕业后班级将归档，{showPromote.students.length} 名学生的历史数据将永久保留。</p>
                </div>
              ) : (
                <div className="p-3 glass-card-light text-sm text-emerald-700">
                  <p className="font-medium mb-1">{gradeLabels[showPromote.grade]}年级{showPromote.name} → {gradeLabels[showPromote.grade + 1]}年级{showPromote.name}</p>
                  <p className="text-xs text-emerald-600/70">升学后，{showPromote.students.length} 名学生将自动升入新年级，所有历史数据保留。</p>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => handlePromote(showPromote)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white ${showPromote.grade >= 6 ? 'btn-warning' : 'btn-success'}`}>
                {showPromote.grade >= 6 ? '确认毕业' : '确认升学'}
              </button>
              <button onClick={() => setShowPromote(null)} className="flex-1 glass-btn py-2.5 rounded-xl text-sm font-medium text-slate-500">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 移交确认弹窗 ========== */}
      {showTransfer && (
        <div className="fixed inset-0 glass-modal-overlay flex items-end sm:items-center justify-center z-50">
          <div className="glass-modal p-5 sm:p-6 w-full sm:max-w-sm animate-glass-scale">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-700">移交班级</h2>
              <button onClick={() => setShowTransfer(null)} className="p-1.5 rounded-full hover:bg-slate-100/60"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-3 glass-card-light text-sm text-amber-700 mb-4">
              <p className="font-medium mb-1">移交 {gradeLabels[showTransfer.grade]}年级{showTransfer.name}</p>
              <p className="text-xs text-amber-600/70">移交后您将不再管理此班级，但可查看任教期间的历史数据。新教师可通过"接管班级"获得管理权限。</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => handleTransfer(showTransfer)} className="flex-1 btn-warning py-2.5 rounded-xl text-sm font-medium">确认移交</button>
              <button onClick={() => setShowTransfer(null)} className="flex-1 glass-btn py-2.5 rounded-xl text-sm font-medium text-slate-500">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 任教记录弹窗 ========== */}
      {showHistory && (
        <div className="fixed inset-0 glass-modal-overlay flex items-end sm:items-center justify-center z-50">
          <div className="glass-modal p-5 sm:p-6 w-full sm:max-w-sm animate-glass-scale">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-700">任教记录</h2>
              <button onClick={() => setShowHistory(null)} className="p-1.5 rounded-full hover:bg-slate-100/60"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2">
              {showHistory.teachingHistory.map((record, idx) => (
                <div key={idx} className="flex items-center p-3 glass-card-light">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-700">{record.teacherName}</div>
                    <div className="text-[10px] text-slate-400">{record.startDate} ~ {record.endDate || '至今'}</div>
                  </div>
                  {!record.endDate && (
                    <span className="ml-auto px-2 py-0.5 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full text-[10px] font-medium">当前</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
