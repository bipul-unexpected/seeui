import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('page.jsx'),
  route('preview', 'preview/page.jsx'),
  route('extract', 'extract/page.jsx'),
  route('gradient', 'gradient/page.jsx'),
  route('donate/success', 'donate/success/page.jsx'),
  route('donate/cancel', 'donate/cancel/page.jsx'),
] satisfies RouteConfig;
