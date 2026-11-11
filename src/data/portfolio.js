export const navLinks = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'github', label: 'GitHub', href: '#github' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'contact', label: 'Contact', href: '#contact' }
]

export const profile = {
  handle: 'raditted',
  name: 'Radithya Mahesa Syabil',
  greeting: "Hey, I'm Radithya.",
  role: 'Back-end & Full-Stack Dev',
  location: 'Bandung, Indonesia',
  summary:
    'Informatics Engineering student at Politeknik Negeri Bandung. I spend most of my time building back-end services, Automation tools, and web apps that make everyday workflows easier.',
  avatar: {
    src: '/images/profile.jpg',
    alt: 'Portrait of Radithya Mahesa Syabil',
    width: 640,
    height: 659
  }
}

export const aboutCopy = [
  'I graduated in Software Engineering (RPL) from SMKS Mahardhika Batujajar and am now studying D3 Informatics Engineering at Politeknik Negeri Bandung.',
  'Most of my work lives behind the scenes: server logic, chat automation, and monitoring scripts, though I still enjoy putting together clean web interfaces when a project calls for it.'
]

export const aboutPillars = [
  {
    index: '01',
    title: 'Back-end & APIs',
    description:
      'Handling server flows, REST endpoints, and database schemas using Node.js, Bun.js, Express, PHP, Laravel, PostgreSQL, MySQL, and MongoDB.'
  },
  {
    index: '02',
    title: 'Web Interfaces',
    description:
      'Putting together responsive web pages and full-stack apps with Vue.js, TypeScript, and Tailwind CSS.'
  },
  {
    index: '03',
    title: 'Bots & Server Monitoring',
    description:
      'Building practical automation tools such as Baileys WhatsApp top-up bots and automated Grafana snapshot reporters packaged with Docker and Docker-Compose.'
  },
  {
    index: '04',
    title: 'Study & Freelance',
    description:
      'After graduating from SMKS Mahardhika Batujajar in 2025, I started D3 Informatics Engineering at Polban while taking freelance back-end work at M-Code Services.'
  }
]

export const techGroups = [
  {
    label: 'Frontend',
    items: [
      { name: 'Vue.js', icon: '/images/tech/vue.png' },
      { name: 'TypeScript', icon: '/images/tech/typescript.svg' },
      { name: 'Tailwind CSS', icon: '/images/tech/tailwindcss.svg' }
    ]
  },
  {
    label: 'Backend & Languages',
    items: [
      { name: 'Node.js', icon: '/images/tech/nodejs.svg' },
      { name: 'Bun.js', icon: '/images/tech/bun.svg' },
      { name: 'Express', icon: '/images/tech/express.svg' },
      { name: 'PHP', icon: '/images/tech/php.svg' },
      { name: 'Laravel', icon: '/images/tech/laravel.svg' },
      { name: 'Java', icon: '/images/tech/java.svg' }
    ]
  },
  {
    label: 'Databases',
    items: [
      { name: 'PostgreSQL', icon: '/images/tech/postgresql.svg' },
      { name: 'MySQL', icon: '/images/tech/mysql.svg' },
      { name: 'MongoDB', icon: '/images/tech/mongodb.svg' }
    ]
  },
  {
    label: 'Tools & Infrastructure',
    items: [
      { name: 'Docker', icon: '/images/tech/docker.svg' },
      { name: 'Git', icon: '/images/tech/git.svg' },
      { name: 'Postman', icon: '/images/tech/postman.svg' }
    ]
  }
]

export const education = [
  {
    period: '2025 - Present',
    title: 'D3 Informatics Engineering',
    organization: 'Politeknik Negeri Bandung'
  },
  {
    period: '2022 - 2025',
    title: 'Computer Software Engineering (RPL)',
    organization: 'SMKS Mahardhika Batujajar'
  }
]

export const workExperience = [
  {
    period: '2025 - Present',
    title: 'Back-end Developer (Freelance)',
    organization: 'M-Code Services'
  },
  {
    period: 'Oct 15 - Nov 15, 2024',
    title: 'Web Developer (Apprenticeship)',
    organization: 'PAC - PT. Sarana Pactindo'
  },
  {
    period: 'Jul 15 - Nov 15, 2024',
    title: 'Infrastructure Support Specialist (Internship)',
    organization: 'PAC - PT. Sarana Pactindo'
  }
]

export const projectCategories = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web' },
  { id: 'bot-automation', label: 'Bot / Automation' },
  { id: 'academy', label: 'Academy' },
  { id: 'etc', label: 'Etc' }
]

export const featuredProjects = [
  {
    id: 'mbg-monitoring',
    category: ['web', 'academy'],
    context: 'Proyek 3 Polban',
    title: 'Food Safety Monitoring App (MBG)',
    description:
      'Coursework web system built in Laravel Blade and MySQL for recording and monitoring meal safety test cases.',
    stack: ['Laravel Blade', 'MySQL', 'PHP'],
    repoUrl: 'https://github.com/raditted/proyek-3_mini_project_025_Radithya-Mahesa-Syabil'
  },
  {
    id: 'todo-ukk',
    category: 'web',
    context: 'UKK 2025 Assessment',
    title: 'My TODO (UKK 2025)',
    description:
      'A task management web app built for the vocational competency exam to organize daily schedules with Laravel, MySQL, and Tailwind CSS.',
    stack: ['Laravel', 'MySQL', 'Tailwind CSS'],
    image: {
      src: '/images/project-todo.png',
      alt: 'Screenshot of My TODO UKK 2025 application',
      width: 1200,
      height: 580,
      fit: 'cover'
    },
    repoUrl: 'https://github.com/raditted/Todo_list_UKK2025'
  },
  {
    id: 'memo-web',
    category: 'web',
    context: 'Contributed Project',
    title: 'RPL-2 MemoWeb',
    description:
      'Collaborative note-taking and memo web application built with Next.js and TypeScript for RPL class productivity.',
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    repoUrl: 'https://github.com/Noerdinn/RPL-2-MemoWeb'
  },
  {
    id: 'mossad-downloader',
    category: 'web',
    context: 'Closed Project',
    title: 'MossadDownloader',
    description:
      'All-In-One web media downloader supporting Instagram, Facebook, X, and TikTok with real-time statistics and clean UI.',
    stack: ['Next.js', 'Vercel', 'Tailwind CSS', 'REST API'],
    image: {
      src: '/images/project-mossad.png',
      alt: 'Screenshot of MossadDownloader web application',
      width: 1024,
      height: 497,
      fit: 'cover'
    },
    repoUrl: 'https://downloader-mossad.vercel.app/'
  },
  {
    id: 'host-panel-monitoring',
    category: 'bot-automation',
    context: 'Server Bot',
    title: 'Host Panel Monitoring Discord',
    description:
      'Discord bot automation for tracking hosting panels, server metrics, and alerting administrators to downtime or resource spikes.',
    stack: ['Node.js', 'Discord.js', 'Monitoring'],
    repoUrl: 'https://github.com/raditted/host-panel-monitoring-discord'
  },
  {
    id: 'attendance-reminder',
    category: 'bot-automation',
    context: 'Class Automation',
    title: 'Class Attendance Reminder',
    description:
      'A WhatsApp attendance reminder bot for class 1A-D3 Polban, built with Bun.js to broadcast scheduled session alerts.',
    stack: ['Bun.js', 'WhatsApp Bot', 'Automation'],
    repoUrl: 'https://github.com/raditted/class-attendance-reminder'
  },
  {
    id: 'polban-auto-absen',
    category: 'bot-automation',
    context: 'Contributed Project',
    title: 'Polban Auto Absen',
    description:
      'Automated login and attendance confirmation script for the Polban academic portal with local IP verification and structured logs.',
    stack: ['Node.js', 'Automation', 'Academic Portal'],
    repoUrl: 'https://github.com/haikaldwiaryaa/Polban-Auto-Absen'
  },
  {
    id: 'wangsaff-bot',
    category: 'bot-automation',
    context: 'Chat Automation',
    title: 'Wangsaff Bot',
    description:
      'Multi-device WhatsApp automation bot built on Baileys with command routing, group management, and automated replies.',
    stack: ['Node.js', 'Baileys', 'WhatsApp'],
    repoUrl: 'https://github.com/raditted/wangsaff-bot'
  }
]

export const archiveProjects = [
  {
    id: 'kg-modul1',
    category: 'academy',
    context: 'Polban Coursework',
    title: 'Komputer Grafika Modul 1',
    description:
      'Computer graphics lab implementation for 2A D3 Informatics Engineering covering fundamental 2D rasterization algorithms.',
    stack: ['C++', 'OpenGL', 'Computer Graphics'],
    repoUrl: 'https://github.com/raditted/-KG2026_2A_D3_2025-_Modul1_025'
  },
  {
    id: 'vsm-retrieval',
    category: 'academy',
    context: 'Academic Assignment',
    title: 'Vector Space Model Retrieval',
    description:
      'Information retrieval program representing text collections and queries as term vectors to rank search results using cosine similarity.',
    stack: ['Python', 'NLP', 'Information Retrieval'],
    repoUrl: 'https://github.com/raditted/vector-space-model-retrieval'
  },
  {
    id: 'bocchi-pj2',
    category: 'academy',
    context: 'Proyek 2 PJBL D3-1A',
    title: 'Team Bocchi The Rock PJ2',
    description:
      'Collaborative coursework project developed for Proyek 2 Project-Based Learning in D3 Informatics Engineering Polban.',
    stack: ['Java', 'PJBL', 'Polban'],
    repoUrl: 'https://github.com/raditted/Team-Bocchi-The-Rock-pj2'
  },
  {
    id: 'dotfiles',
    category: 'etc',
    context: 'Linux Workstation',
    title: 'Hyprland Rice Dotfiles',
    description:
      'Personal Wayland desktop rice configuration for Hyprland with customized Waybar status modules, animations, and rofi styling.',
    stack: ['Hyprland', 'Waybar', 'Wayland', 'Bash'],
    repoUrl: 'https://github.com/raditted/dotfiles'
  },
  {
    id: 'noctalia-dotfiles',
    category: 'etc',
    context: 'Desktop Rice',
    title: 'Noctalia Hyprland Dotfiles',
    description:
      'Curated Noctalia dark aesthetic configuration bundle for Hyprland, terminal emulators, and GTK theme synchronization.',
    stack: ['Hyprland', 'Linux', 'CSS', 'Shell'],
    repoUrl: 'https://github.com/raditted/Noctalia-Hyprland-Dotfiles'
  },
  {
    id: 'error-mommy-ext',
    category: 'etc',
    context: 'VS Code Extension',
    title: 'Error Mommy Sound Extension',
    description:
      'A VS Code extension that classifies failed builds, notebook cells, and terminal errors, then plays cached audio cues in a sidebar.',
    stack: ['TypeScript', 'VS Code API', 'Audio'],
    repoUrl: 'https://github.com/raditted/Error_Mommy_Sound_Extension'
  },
  {
    id: 'f22-balloon-game',
    category: 'etc',
    context: 'Retro Game',
    title: 'F22 vs Chinese Balloons Game',
    description:
      '2D aircraft arcade game simulating F-22 Raptor maneuvers and target interception with keyboard controls and score tracking.',
    stack: ['Python', 'Pygame', 'Arcade Game'],
    repoUrl: 'https://github.com/raditted/F22-VS-CHINESE-BALLONS-GAME'
  }
]

export const contacts = [
  {
    id: 'email',
    label: 'Email',
    value: 'radithya.syabil@gmail.com',
    href: 'mailto:radithya.syabil@gmail.com',
    external: false
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/raditted',
    href: 'https://github.com/raditted',
    external: true
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    value: 'gitlab.com/raditted',
    href: 'https://gitlab.com/raditted',
    external: true
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'in/radithya-mahesa-syabil',
    href: 'https://www.linkedin.com/in/radithya-mahesa-syabil/',
    external: true
  },
  {
    id: 'instagram',
    label: 'Instagram',
    value: '@rdthymhsa',
    href: 'https://www.instagram.com/rdthymhsa/',
    external: true
  }
]
