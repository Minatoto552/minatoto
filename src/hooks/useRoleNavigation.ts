import {
  BookOpen,
  CalendarCheck,
  Dice5,
  Home,
  LayoutGrid,
  Settings,
  Shield,
  ShoppingBag,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { type UserRole } from '../lib/VrcBarAppContext';

export interface RoleNavItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export function getEmployeeNavigation(role: UserRole | undefined): RoleNavItem[] {
  if (role === 'admin') {
    return [
      { path: '/app', label: 'ホーム', shortLabel: 'Home', icon: Home },
      { path: '/app/placement', label: '配置', shortLabel: '配置', icon: LayoutGrid },
      { path: '/app/staff', label: '注文管理', shortLabel: '注文', icon: ShoppingBag },
      { path: '/app/admin', label: '管理', shortLabel: '管理', icon: Shield },
      { path: '/app/attendance', label: 'シフト', shortLabel: 'シフト', icon: CalendarCheck },
    ];
  }

  if (role === 'staff') {
    return [
      { path: '/app', label: 'ホーム', shortLabel: 'Home', icon: Home },
      { path: '/app/placement', label: '配置', shortLabel: '配置', icon: LayoutGrid },
      { path: '/app/staff', label: '注文管理', shortLabel: '注文', icon: ShoppingBag },
      { path: '/app/recipes', label: 'レシピ', shortLabel: 'レシピ', icon: BookOpen },
      { path: '/app/attendance', label: 'シフト', shortLabel: 'シフト', icon: CalendarCheck },
    ];
  }

  if (role === 'cast') {
    return [
      { path: '/app', label: 'ホーム', shortLabel: 'Home', icon: Home },
      { path: '/app/placement', label: '配置', shortLabel: '配置', icon: LayoutGrid },
      { path: '/app/order', label: '注文登録', shortLabel: '注文', icon: ShoppingBag },
      { path: '/app/recipes', label: 'レシピ', shortLabel: 'レシピ', icon: BookOpen },
      { path: '/app/attendance', label: 'シフト', shortLabel: 'シフト', icon: CalendarCheck },
    ];
  }

  return [];
}

export function getCustomerNavigation(): RoleNavItem[] {
  return [
    { path: '/guest', label: 'ホーム', shortLabel: 'Home', icon: Home },
    { path: '/guest/menu', label: 'メニュー', shortLabel: 'メニュー', icon: BookOpen },
    { path: '/guest/point', label: 'ポイント', shortLabel: 'Point', icon: UserCircle },
    { path: '/guest/game', label: 'Dice', shortLabel: 'Dice', icon: Dice5 },
    { path: '/guest/profile', label: 'マイページ', shortLabel: 'My', icon: Settings },
  ];
}
