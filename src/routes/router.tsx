import React, { lazy } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import PublicLayout from '@/layouts/publicLayout';
import AdminLayout from '@/layouts/adminLayout';
import EmployeeLayout from '@/layouts/employeeLayout';
import ProtectedRoute from '@/pages/layout/ProtectedRoute';
import PublicRoute from '@/pages/layout/PublicRoute';
import AuthLayout from '@/layouts/authLayout';
import MarketingLayout from '@/layouts/marketingLayout';
import { ADMIN_ROLES, USER_ROLES } from '@/constants/roles';

// Public
const HomePage               = lazy(() => import('@/pages/public/homePage'));
const NotFound               = lazy(() => import('@/pages/404'));
const Forbidden              = lazy(() => import('@/pages/403'));

// Auth
const Login                  = lazy(() => import('@/pages/auth/Login'));
const ForgetPassword         = lazy(() => import('@/pages/auth/ForgetPassword'));
const VerifyOTP              = lazy(() => import('@/pages/auth/VerifyOTP'));
const ResetPassword          = lazy(() => import('@/pages/auth/ResetPassword'));
const AcceptInvite           = lazy(() => import('@/pages/auth/AcceptInvite'));

// Admin core
const AdminDashboard         = lazy(() => import('@/pages/admin/dashboard'));
const AdminProjects          = lazy(() => import('@/pages/admin/projects'));
const AdminTimesheet         = lazy(() => import('@/pages/admin/timesheet'));
const AdminSaved             = lazy(() => import('@/pages/admin/saved'));
const AdminTeam              = lazy(() => import('@/pages/admin/team'));
const AdminSettings          = lazy(() => import('@/pages/admin/settings'));
const AdminUsers             = lazy(() => import('@/pages/admin/users'));
// Admin new modules
const AdminAssets            = lazy(() => import('@/pages/admin/assets'));
const AdminPerformance       = lazy(() => import('@/pages/admin/performance'));
const AdminDepartments       = lazy(() => import('@/pages/admin/departments'));
const AdminHRDashboard       = lazy(() => import('@/pages/admin/hr-dashboard'));
const AdminOperations        = lazy(() => import('@/pages/admin/operations'));
const AdminEstimator         = lazy(() => import('@/pages/admin/estimator'));

// Employee
const EmployeeDashboard      = lazy(() => import('@/pages/employee/dashboard'));
const EmployeeProjects       = lazy(() => import('@/pages/employee/projects'));
const EmployeeTimesheet      = lazy(() => import('@/pages/employee/timesheet'));
const EmployeeSaved          = lazy(() => import('@/pages/employee/saved'));
const EmployeeSettings       = lazy(() => import('@/pages/employee/settings'));
const EmployeeTickets        = lazy(() => import('@/pages/employee/tickets'));
const StarredQueries         = lazy(() => import('@/pages/employee/starred'));
const DailyReport            = lazy(() => import('@/pages/employee/daily-report'));

// Shared
const SharedNotifications    = lazy(() => import('@/pages/shared/notifications'));
const ProjectDetailPage      = lazy(() => import('@/pages/shared/projectDetail'));
const ProfilePage            = lazy(() => import('@/pages/shared/profile'));

// Marketing
const MarketingDashboard     = lazy(() => import('@/pages/marketing/dashboard'));
const MarketingWonDeals      = lazy(() => import('@/pages/marketing/won-deals'));
const MarketingSalaryBuilder = lazy(() => import('@/pages/marketing/salary-builder'));
const MarketingSalaryHistory = lazy(() => import('@/pages/marketing/salary-history'));

// Chat (untouched)
const ChatPage               = lazy(() => import('@/pages/chat'));

const adminRoles = [...ADMIN_ROLES] as any[];
const allRoles   = Object.values(USER_ROLES) as any[];

const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/',    element: <HomePage /> },
      { path: '/403', element: <Forbidden /> },
      { path: '/404', element: <NotFound /> },
      { path: '*',    element: <NotFound /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { path: '/login',           element: <Login /> },
          { path: '/forget-password', element: <ForgetPassword /> },
          { path: '/verify-otp',      element: <VerifyOTP /> },
          { path: '/reset-password',  element: <ResetPassword /> },
          { path: '/invite/:token',   element: <AcceptInvite /> },
        ],
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        element: <ProtectedRoute roles={adminRoles} />,
        children: [
          // Core admin routes
          { path: '/admin',                      element: <AdminDashboard /> },
          { path: '/admin/projects',             element: <AdminProjects /> },
          { path: '/admin/timesheet',            element: <AdminTimesheet /> },
          { path: '/admin/starred',              element: <AdminSaved /> },
          { path: '/admin/team',                 element: <AdminTeam /> },
          { path: '/admin/settings',             element: <AdminSettings /> },
          { path: '/admin/users',                element: <AdminUsers /> },
          { path: '/admin/notifications',        element: <SharedNotifications /> },
          { path: '/admin/project-detail',       element: <ProjectDetailPage /> },
          { path: '/admin/profile/:memberId?',   element: <ProfilePage /> },
          // New ERP modules
          { path: '/admin/assets',               element: <AdminAssets /> },
          { path: '/admin/performance',          element: <AdminPerformance /> },
          { path: '/admin/departments',          element: <AdminDepartments /> },
          { path: '/admin/hr',                   element: <AdminHRDashboard /> },
          { path: '/admin/operations',           element: <AdminOperations /> },
          { path: '/admin/estimator',            element: <AdminEstimator /> },
        ],
      },
      { path: '/admin/*', element: <NotFound /> },
    ],
  },
  {
    element: <EmployeeLayout />,
    children: [
      {
        element: <ProtectedRoute roles={[USER_ROLES.EMPLOYEE]} />,
        children: [
          { path: '/employee',                     element: <EmployeeDashboard /> },
          { path: '/employee/projects',            element: <EmployeeProjects /> },
          { path: '/employee/starred',             element: <StarredQueries /> },
          { path: '/employee/timesheet',           element: <EmployeeTimesheet /> },
          { path: '/employee/tickets',             element: <EmployeeTickets /> },
          { path: '/employee/saved',               element: <EmployeeSaved /> },
          { path: '/employee/settings',            element: <EmployeeSettings /> },
          { path: '/employee/daily-report',        element: <DailyReport /> },
          { path: '/employee/notifications',       element: <SharedNotifications /> },
          { path: '/employee/project-detail',      element: <ProjectDetailPage /> },
          { path: '/employee/profile/:memberId?',  element: <ProfilePage /> },
        ],
      },
      { path: '/employee/*', element: <NotFound /> },
    ],
  },
  {
    element: <MarketingLayout />,
    children: [
      {
        element: <ProtectedRoute roles={[USER_ROLES.MARKETING, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]} />,
        children: [
          { path: '/marketing',                          element: <MarketingDashboard /> },
          { path: '/marketing/won-deals',                element: <MarketingWonDeals /> },
          { path: '/marketing/salary-builder/:memberId', element: <MarketingSalaryBuilder /> },
          { path: '/marketing/salary-history',           element: <MarketingSalaryHistory /> },
        ],
      },
      { path: '/marketing/*', element: <NotFound /> },
    ],
  },
  {
    element: <ProtectedRoute roles={allRoles} />,
    children: [{ path: '/chat', element: <ChatPage /> }],
  },
];

export const router = createBrowserRouter(routes);
export default router;
