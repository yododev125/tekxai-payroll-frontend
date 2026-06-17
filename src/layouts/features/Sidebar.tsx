import React, { useMemo, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Settings, FolderCheck, Clock, Star, LogOut, X } from 'lucide-react';
import {
  Users2, Ticket, Package, TrendingUp, FileText,
  Building2, Heart, Wrench, Calculator,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clearAuthTokens } from '@/utils/tokenMemory';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES, ADMIN_ROLES } from '@/constants/roles';
import { cn } from '@/utils/cn';
import tekxaiLogo from '@/assets/icons/tekxai-logo.svg';

// icon imports (SVG)
import dashboardIconBlack from '@/assets/icons/dashboard-black-icon.svg';
import dashboardIconWhite from '@/assets/icons/dashboard-icon-white.svg';
import projectIconBlack   from '@/assets/icons/project-icon-black.svg';
import projectIconWhite   from '@/assets/icons/project-icon-white.svg';
import timesheetBlack     from '@/assets/icons/timesheet-black.svg';
import timesheetWhite     from '@/assets/icons/timesheet-white.svg';
import timesheetEmployeeBlack from '@/assets/icons/timesheet-emplooye-black.svg';
import timesheetEmployeeWhite from '@/assets/icons/timesheet-emplooye-white.svg';
import settingsBlack      from '@/assets/icons/settings-black.svg';
import settingsWhite      from '@/assets/icons/settings-white.svg';
import teamManagementBlack from '@/assets/icons/teammanagment-black.svg';
import teamManagementWhite from '@/assets/icons/teammanagement-white.svg';
import savedBlack         from '@/assets/icons/saved-black.svg';
import savedWhite         from '@/assets/icons/saved-white.svg';

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  inactive?: string;
  active?: string;
  end?: boolean;
}

interface SidebarProps {
  onClose?: () => void;
}

const SvgIcon: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-5 h-5 object-contain" />
);

const NavItem: React.FC<{ link: SidebarLink }> = ({ link }) => (
  <NavLink
    to={link.to}
    end={link.end}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group text-[13px] font-bold',
        isActive
          ? 'bg-[#005CDA] text-white shadow-lg shadow-blue-200'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )
    }
  >
    {({ isActive }) => (
      <>
        <span className="shrink-0 w-5 h-5 flex items-center justify-center">
          {link.inactive && link.active ? (
            <SvgIcon src={isActive ? link.active : link.inactive} alt={link.label} />
          ) : (
            <span className={cn('transition-colors', isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700')}>
              {link.icon}
            </span>
          )}
        </span>
        <span className="truncate">{link.label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { role, userLogout } = useAuth();
  const navigate = useNavigate();

  const links: SidebarLink[] = useMemo(() => {
    const isAdmin = ADMIN_ROLES.includes(role as any);

    if (!isAdmin) {
      // Employee sidebar
      return [
        { to: '/employee',              label: 'Home',             icon: <Home size={20} />,      inactive: dashboardIconBlack, active: dashboardIconWhite, end: true },
        { to: '/employee/projects',     label: 'Projects',         icon: <FolderCheck size={20} />,inactive: projectIconBlack,   active: projectIconWhite },
        { to: '/employee/starred',      label: 'Starred Queries',  icon: <Star size={20} /> },
        { to: '/employee/timesheet',    label: 'Timesheet',        icon: <Clock size={20} />,     inactive: timesheetEmployeeBlack, active: timesheetEmployeeWhite },
        { to: '/employee/tickets',      label: 'Support Tickets',  icon: <Ticket size={20} /> },
        { to: '/employee/daily-report', label: 'Daily Report',     icon: <FileText size={20} /> },
        { to: '/employee/settings',     label: 'Settings',         icon: <Settings size={20} />,  inactive: settingsBlack, active: settingsWhite },
      ];
    }

    // Admin / HR / Manager sidebar
    const adminLinks: SidebarLink[] = [
      { to: '/admin',             label: 'Dashboard',         icon: <Home size={20} />,      inactive: dashboardIconBlack, active: dashboardIconWhite, end: true },
      { to: '/admin/users',       label: 'Users',             icon: <Users2 size={20} /> },
      { to: '/admin/departments', label: 'Departments',       icon: <Building2 size={20} /> },
      { to: '/admin/team',        label: 'Teams',             icon: <Clock size={20} />,     inactive: teamManagementBlack, active: teamManagementWhite },
      { to: '/admin/projects',    label: 'Projects',          icon: <FolderCheck size={20} />,inactive: projectIconBlack, active: projectIconWhite },
      { to: '/admin/timesheet',   label: 'Timesheet',         icon: <Users size={20} />,     inactive: timesheetBlack, active: timesheetWhite },
      { to: '/admin/assets',      label: 'Assets',            icon: <Package size={20} /> },
      { to: '/admin/performance', label: 'Performance',       icon: <TrendingUp size={20} /> },
      { to: '/admin/estimator',   label: 'Estimator Tracker', icon: <Calculator size={20} /> },
      { to: '/admin/hr',          label: 'HR Dashboard',      icon: <Heart size={20} /> },
      { to: '/admin/operations',  label: 'Operations',        icon: <Wrench size={20} /> },
      { to: '/admin/starred',     label: 'Starred',           icon: <Star size={20} />,      inactive: savedBlack, active: savedWhite },
      { to: '/admin/settings',    label: 'Settings',          icon: <Settings size={20} />,  inactive: settingsBlack, active: settingsWhite },
    ];

    return adminLinks;
  }, [role]);

  const handleLogout = () => {
    clearAuthTokens();
    userLogout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-white border-r border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <img src={tekxaiLogo} alt="Tekxai" className="h-8" />
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {links.map((link) => (
          <NavItem key={link.to} link={link} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default memo(Sidebar);
