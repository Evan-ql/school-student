'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2, KeyRound, UserCheck, UserX, Clock, MoreHorizontal, X, AlertTriangle } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  subject: string
  school: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export default function UsersManagePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  // 弹窗状态
  const [modal, setModal] = useState<{
    type: 'reset_password' | 'delete' | 'change_status' | null
    userId: string
    userName: string
  }>({ type: null, userId: '', userName: '' })
  const [newPassword, setNewPassword] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [modalLoading, setModalLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: 'all' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClick = () => setActionMenuId(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) return
    setModalLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${modal.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', password: newPassword }),
      })
      if (res.ok) {
        setModal({ type: null, userId: '', userName: '' })
        setNewPassword('')
        alert('密码已重置')
      }
    } catch (error) {
      console.error('Reset password failed:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async () => {
    setModalLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${modal.userId}`, { method: 'DELETE' })
      if (res.ok) {
        setModal({ type: null, userId: '', userName: '' })
        fetchUsers()
      }
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleChangeStatus = async () => {
    if (!newStatus) return
    setModalLoading(true)
    try {
      const action = newStatus === 'approved' ? 'approve' : 'reject'
      const res = await fetch(`/api/admin/users/${modal.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setModal({ type: null, userId: '', userName: '' })
        setNewStatus('')
        fetchUsers()
      }
    } catch (error) {
      console.error('Change status failed:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />待审核</span>
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><UserCheck className="w-3 h-3" />已通过</span>
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><UserX className="w-3 h-3" />已拒绝</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名、邮箱、学校..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 用户表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            加载中...
          </div>
        ) : (
          <>
            {/* 桌面端表格 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">用户</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">学科</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">学校</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">注册时间</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-600 font-medium text-sm">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.school || '-'}</td>
                      <td className="px-4 py-3">{statusBadge(user.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === user.id ? null : user.id) }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                          {actionMenuId === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => { setModal({ type: 'change_status', userId: user.id, userName: user.name }); setNewStatus(user.status === 'approved' ? 'rejected' : 'approved'); setActionMenuId(null) }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                {user.status === 'approved' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                {user.status === 'approved' ? '禁用账户' : '启用账户'}
                              </button>
                              <button
                                onClick={() => { setModal({ type: 'reset_password', userId: user.id, userName: user.name }); setActionMenuId(null) }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <KeyRound className="w-4 h-4" />
                                重置密码
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => { setModal({ type: 'delete', userId: user.id, userName: user.name }); setActionMenuId(null) }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                删除用户
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 移动端卡片 */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map(user => (
                <div key={user.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {statusBadge(user.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>{user.subject}</span>
                    <span>{user.school || '未填写学校'}</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setModal({ type: 'change_status', userId: user.id, userName: user.name }); setNewStatus(user.status === 'approved' ? 'rejected' : 'approved') }}
                      className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      {user.status === 'approved' ? '禁用' : '启用'}
                    </button>
                    <button
                      onClick={() => setModal({ type: 'reset_password', userId: user.id, userName: user.name })}
                      className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      重置密码
                    </button>
                    <button
                      onClick={() => setModal({ type: 'delete', userId: user.id, userName: user.name })}
                      className="py-1.5 px-3 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {users.length === 0 && (
              <div className="p-12 text-center text-gray-500">暂无用户数据</div>
            )}
          </>
        )}
      </div>

      {/* 弹窗 */}
      {modal.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal({ type: null, userId: '', userName: '' })}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                {modal.type === 'reset_password' && '重置密码'}
                {modal.type === 'delete' && '删除用户'}
                {modal.type === 'change_status' && (newStatus === 'approved' ? '启用账户' : '禁用账户')}
              </h3>
              <button onClick={() => setModal({ type: null, userId: '', userName: '' })} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              {modal.type === 'reset_password' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">为用户 <strong>{modal.userName}</strong> 设置新密码：</p>
                  <input
                    type="text"
                    placeholder="输入新密码（至少6位）"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleResetPassword}
                    disabled={modalLoading || newPassword.length < 6}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {modalLoading ? '处理中...' : '确认重置'}
                  </button>
                </div>
              )}

              {modal.type === 'delete' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">此操作不可撤销！将永久删除用户 <strong>{modal.userName}</strong> 及其所有数据。</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModal({ type: null, userId: '', userName: '' })}
                      className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={modalLoading}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {modalLoading ? '删除中...' : '确认删除'}
                    </button>
                  </div>
                </div>
              )}

              {modal.type === 'change_status' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    确定要{newStatus === 'approved' ? '启用' : '禁用'}用户 <strong>{modal.userName}</strong> 的账户吗？
                  </p>
                  {newStatus === 'rejected' && (
                    <p className="text-xs text-gray-500">禁用后该用户将无法登录系统。</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModal({ type: null, userId: '', userName: '' })}
                      className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleChangeStatus}
                      disabled={modalLoading}
                      className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${
                        newStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {modalLoading ? '处理中...' : '确认'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
