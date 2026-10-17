const paths = {
  dashboard: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10',
  profile: 'M16 14a4 4 0 10-8 0M12 7a3 3 0 100-6 3 3 0 000 6M4 21a8 8 0 0116 0',
  teams: 'M17 20h5v-1a4 4 0 00-4-4M9 20H4v-1a4 4 0 014-4h4a4 4 0 014 4v1H9zM12 11a3 3 0 100-6 3 3 0 000 6M18 11a3 3 0 100-6',
  search: 'M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z',
  sparkles: 'M12 3l1.9 4.6L18 9l-4.1 1.4L12 15l-1.9-4.6L6 9l4.1-1.4zM19 14l.9 2.2L22 17l-2.1.8L19 20l-.9-2.2L16 17l2.1-.8z',
  requests: 'M4 4h16v12H5.2L4 17.2zM8 9h8M8 12h5',
  courses: 'M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2zM14 3v5h5',
  materials: 'M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zM14 2v5h5M9 13h6M9 17h6',
  quiz: 'M9 11l3 3 7-7M4 6a2 2 0 012-2h9M4 6v12a2 2 0 002 2h12a2 2 0 002-2v-5',
  announce: 'M3 11l14-6v14L3 13zM3 11v2M17 8a3 3 0 010 6',
  feed: 'M4 4h16v4H4zM4 12h10v8H4zM16 12h4v8h-4z',
  bell: 'M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 01-6 0v-1',
  users: 'M17 20h5v-1a4 4 0 00-3-3.9M9 20H4v-1a4 4 0 013-3.9M12 12a4 4 0 100-8 4 4 0 000 8M16 11a3 3 0 100-6',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  logout: 'M16 17l5-5-5-5M21 12H9M12 19H5a2 2 0 01-2-2V7a2 2 0 012-2h7',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13',
  edit: 'M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3zM13.5 6.5l3 3',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M5 21h14',
  check: 'M5 13l4 4L19 7',
  close: 'M6 6l12 12M18 6L6 18',
  link: 'M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1',
  upload: 'M12 21V9m0 0l-4 4m4-4l4 4M5 3h14',
  logo: 'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM7 6H4a3 3 0 003 3M17 6h3a3 3 0 01-3 3',
};

const Icon = ({ name, className = 'h-5 w-5', strokeWidth = 2 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
    <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || paths.dashboard} />
  </svg>
);

export default Icon;
