/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Calendar, 
  MoreHorizontal, 
  Moon, 
  Sun, 
  X, 
  Layout,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Column, Priority } from './types';

// --- Components ---

interface CardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const Card = ({ task, onClick }: CardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const priorityLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-blue-500 h-32 mb-3"
      />
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layoutId={task.id}
      onClick={() => onClick(task)}
      className="group bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all mb-3 cursor-pointer relative"
    >
      <div className="flex items-start gap-2">
        <div 
          {...attributes} 
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 text-slate-300 dark:text-slate-600 hover:text-slate-500 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            {task.dueDate && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Calendar size={10} />
                {task.dueDate}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mb-1">
            {task.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {task.description || '설명이 없습니다.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface ColumnContainerProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onCardClick: (task: Task) => void;
}

const ColumnContainer = ({ column, tasks, onAddTask, onEditColumn, onCardClick }: ColumnContainerProps) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-full md:w-[320px] shrink-0 h-full"
    >
      <div className="flex items-center justify-between mb-4 px-2 group">
        <div className="flex items-center gap-2">
          <h2 
            onClick={() => onEditColumn(column)}
            className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {column.title}
          </h2>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onAddTask(column.id)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[150px]">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <Card key={task.id} task={task} onClick={onCardClick} />
              ))
            ) : (
              <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
                <Layout size={24} strokeWidth={1.5} />
                <p className="text-xs">카드가 없습니다</p>
              </div>
            )}
          </div>
        </SortableContext>
        
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all"
        >
          <Plus size={14} />
          새 카드 추가
        </button>
      </div>
    </div>
  );
};

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskModal = ({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) setEditedTask({ ...task });
  }, [task]);

  if (!isOpen || !editedTask) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layout className="text-blue-500" size={20} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">업무 상세</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">제목</label>
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-300 p-0"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">우선순위</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Priority })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">마감일</label>
                  <input
                    type="date"
                    value={editedTask.dueDate}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">설명</label>
                <textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                  placeholder="상세 내용을 입력하세요..."
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('정말 삭제하시겠습니까?')) {
                  onDelete(editedTask.id);
                }
              }}
              className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              <Trash2 size={16} />
              삭제하기
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => onSave(editedTask)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                저장하기
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pro-kanban-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem('pro-kanban-columns');
    return saved ? JSON.parse(saved) : [
      { id: 'todo', title: '할 일' },
      { id: 'in-progress', title: '진행 중' },
      { id: 'done', title: '완료' },
    ];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('pro-kanban-theme');
    return saved === 'dark';
  });

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortColumns, setSortColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem('pro-kanban-tasks', JSON.stringify(tasks));
    localStorage.setItem('pro-kanban-columns', JSON.stringify(columns));
    localStorage.setItem('pro-kanban-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tasks, columns, isDarkMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const getFilteredAndSortedTasks = (columnId: string) => {
    let filtered = tasks.filter(t => t.columnId === columnId);
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    if (sortColumns[columnId]) {
      return [...filtered].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    }

    return filtered;
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        tasks[activeIndex].columnId = overId as string;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: '새로운 업무',
      description: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      columnId,
      createdAt: Date.now(),
    };
    setTasks([...tasks, newTask]);
    setSelectedTask(newTask);
    setIsModalOpen(true);
  };

  const addColumn = () => {
    const title = prompt('컬럼 이름을 입력하세요:');
    if (title) {
      setColumns([...columns, { id: Math.random().toString(36).substring(2, 9), title }]);
    }
  };

  const editColumn = (column: Column) => {
    const title = prompt('컬럼 이름을 수정하세요:', column.title);
    if (title) {
      setColumns(columns.map(c => c.id === column.id ? { ...c, title } : c));
    }
  };

  const toggleSort = (columnId: string) => {
    setSortColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const saveTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setIsModalOpen(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F1F3F5] dark:bg-slate-950 transition-colors duration-300 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">프로 칸반</h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">워크스페이스</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    filterPriority === p 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {p === 'all' ? '전체' : p === 'high' ? '높음' : p === 'medium' ? '보통' : '낮음'}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mr-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <AlertCircle size={12} className="text-rose-500" /> {tasks.length} 업무
              </span>
            </div>
            
            <button
              onClick={addColumn}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
            >
              <Plus size={18} />
              컬럼 추가
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-8 overflow-x-auto">
        <div className="max-w-[1600px] mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-8 items-start min-h-[calc(100vh-180px)]">
              {columns.map(col => (
                <div key={col.id} className="flex flex-col w-full md:w-[320px] shrink-0 h-full">
                  <div className="flex items-center justify-between mb-4 px-2 group">
                    <div className="flex items-center gap-2">
                      <h2 
                        onClick={() => editColumn(col)}
                        className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {col.title}
                      </h2>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {getFilteredAndSortedTasks(col.id).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleSort(col.id)}
                        title="우선순위 정렬"
                        className={`p-1.5 rounded-lg transition-colors ${sortColumns[col.id] ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'}`}
                      >
                        <Layout size={14} className="rotate-90" />
                      </button>
                      <button 
                        onClick={() => addTask(col.id)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1">
                    <SortableContext items={getFilteredAndSortedTasks(col.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="min-h-[150px]">
                        {getFilteredAndSortedTasks(col.id).length > 0 ? (
                          getFilteredAndSortedTasks(col.id).map(task => (
                            <Card key={task.id} task={task} onClick={(t) => {
                              setSelectedTask(t);
                              setIsModalOpen(true);
                            }} />
                          ))
                        ) : (
                          <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
                            <Layout size={24} strokeWidth={1.5} />
                            <p className="text-xs">카드가 없습니다</p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                    
                    <button
                      onClick={() => addTask(col.id)}
                      className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all"
                    >
                      <Plus size={14} />
                      새 카드 추가
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addColumn}
                className="w-[320px] shrink-0 h-32 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all gap-2 group"
              >
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-bold">컬럼 추가하기</span>
              </button>
            </div>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.5' } },
              }),
            }}>
              {activeTask ? (
                <motion.div 
                  initial={{ rotate: 0, scale: 1 }}
                  animate={{ rotate: 3, scale: 1.05 }}
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-blue-400 dark:border-blue-500 w-[300px] cursor-grabbing"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider">
                      {activeTask.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                    {activeTask.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {activeTask.description}
                  </p>
                </motion.div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTask}
        onDelete={deleteTask}
      />

      <footer className="max-w-[1600px] mx-auto px-8 py-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
          <Layout size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Pro Kanban v1.0</span>
        </div>
        <p className="text-slate-400 dark:text-slate-600 text-xs font-medium">
          © 2026 프로 칸반 · 최신 B2B SaaS 스타일의 업무 관리 도구
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs font-bold text-slate-400 dark:text-slate-600 hover:text-blue-500 transition-colors uppercase tracking-widest">문서</a>
          <a href="#" className="text-xs font-bold text-slate-400 dark:text-slate-600 hover:text-blue-500 transition-colors uppercase tracking-widest">지원</a>
        </div>
      </footer>
    </div>
  );
}
