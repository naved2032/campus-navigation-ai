export const CATEGORIES = [
  { id: 'All', label: 'All Places', color: 'bg-slate-700 text-slate-200 border-slate-600' },
  { id: 'Labs', label: 'Labs', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', pinColor: '#06b6d4', icon: 'FlaskConical' },
  { id: 'Departments', label: 'Departments', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', pinColor: '#6366f1', icon: 'Landmark' },
  { id: 'Offices', label: 'Offices', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', pinColor: '#f59e0b', icon: 'Briefcase' },
  { id: 'Classrooms', label: 'Classrooms', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', pinColor: '#10b981', icon: 'GraduationCap' },
  { id: 'Facilities', label: 'Facilities', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', pinColor: '#f43f5e', icon: 'Compass' }
];

export function getCategoryMeta(categoryName) {
  const found = CATEGORIES.find(c => c.id === categoryName);
  if (found) return found;
  return {
    id: categoryName || 'Other',
    label: categoryName || 'Other',
    color: 'bg-slate-600/20 text-slate-300 border-slate-500/30',
    pinColor: '#64748b',
    icon: 'MapPin'
  };
}
