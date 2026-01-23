// ✅ 使用本地真实截图图片（通过 scripts/generate-screenshots.js 生成）
// 或使用 SVG 占位图，避免运行时调用外部 API
// 运行 `npm run screenshots` 生成真实截图
export interface BaseItem { name: string; link: string; image: string; desc?: string }
export interface ProjectItem extends BaseItem { slug?: string }
export type NoteItem = BaseItem
export type ToolItem = BaseItem

export const projects: ProjectItem[] = [
  {
    name: "GitHub",
    desc: "My GitHub profile where I share various open-source projects and contributions.",
    link: "https://github.com/undefcc",
    image: "/images/preview/github-com.png", // ✅ 真实截图（490KB）
  },
  {
    name: "LangLangYun Courses",
    desc: "",
    link: "http://course.langlangyun.com/h5/index.html",
    image: "/images/preview/llcourse.png",
  },
  {
    name: "芃禾托育",
    slug: "ph",
    image: "/images/preview/ph.png",
    link: "/miniapp/ph",
  },
  {
    name: "AI班级群",
    slug: "aiclass",
    image: "/images/preview/aiclass1.png",
    link: "/miniapp/aiclass",
  },
  {
    name: "GameDemo",
    desc: "",
    link: "https://ccoding.cn/web-desktop/",
    image: "images/preview/fpdemo.png",
  },
  {
    name: "Fujica Center",
    desc: "",
    link: "https://fst.fujica.com.cn",
    image: "/images/preview/fst-fujica-com-cn.png",
  },
  {
    name: "Fujica Parking App",
    desc: "",
    link: "https://www.fujica.com.cn/lists/104.html",
    image: "/images/preview/www-fujica-com-cn.png",
  },
  {
    name: "Fujica BigData",
    desc: "",
    link: "https://fsbigdata.fujica.com.cn/#/login?redirect=%2Fdashboard",
    image: "/images/preview/fsbigdata-fujica-com-cn.png",
  },
  {
    name: "爱泊客V2",
    slug: "abk",
    image: "/images/preview/abk.png",
    link: "/miniapp/abk",
  },
  {
    name: "富小维",
    slug: "fxw",
    image: "/images/preview/fxw.png",
    link: "/miniapp/fxw",
  },
];

export const notes: NoteItem[] = [
  {
    name: "YuQue",
    desc: "My study Notes.",
    link: "https://www.yuque.com/hexc",
    image: "/images/preview/www-yuque-com.png",
  },
  {
    name: "Blog",
    desc: "A personal blog built with Next.js, Tailwind CSS, and Contentlayer.",
    link: "https://undefcc.github.io",
    image: "/images/preview/undefcc-github-io.png",
  },
  {
    name: "CNBlog",
    desc: "A personal blog built with Next.js, Tailwind CSS, and Contentlayer.",
    link: "https://www.cnblogs.com/cc1997",
    image: "/images/preview/www-cnblogs-com.png",
  },
];

export const tools: ToolItem[] = [
  {
    name: "Org Fujica on NPM",
    desc: "",
    link: "https://www.npmjs.com/org/fujica",
    image: "/images/preview/www-npmjs-com.png",
  },
  {
    name: "Utils Modules",
    desc: "",
    link: "https://fujicafe.github.io/utils/modules.html",
    image: "/images/preview/fujicafe-github-io.png",
  },
];
