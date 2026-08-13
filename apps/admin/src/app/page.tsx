export default function AdminHomePage() {
  const stats = [
    { title: "Total Registered Aspirants", value: "1,248", change: "+12% this week", icon: "👥", color: "from-blue-500/20 to-indigo-500/20", borderColor: "border-blue-500/30" },
    { title: "Mains Submissions in Queue", value: "34", change: "6 pending AI eval", icon: "✍️", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/30" },
    { title: "Active Prelims MCQs", value: "5,420", change: "12 subjects active", icon: "🎯", color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-emerald-500/30" },
    { title: "Monthly Subscription ARR", value: "₹2,48,000", change: "+18% MoM growth", icon: "💳", color: "from-purple-500/20 to-pink-500/20", borderColor: "border-purple-500/30" },
  ];

  const sections = [
    {
      title: "Curriculum & Lesson CMS",
      description: "Manage GS1-GS4 subjects, chapters, NCERT-grounded notes, and rich-text study material.",
      tag: "Editorial",
      status: "Ready for CRUD",
    },
    {
      title: "Mains Evaluation Engine",
      description: "Review automated OCR transcripts, AI rubric scorings, and teacher overrides.",
      tag: "AI Pipeline",
      status: "Connected to Gateway",
    },
    {
      title: "MCQ & Question Bank",
      description: "Curate prelims question sets, PYQ tags, explanations, and topic difficulty weighting.",
      tag: "Assessment",
      status: "Active",
    },
    {
      title: "Current Affairs Feed",
      description: "Publish daily news summaries mapped directly to UPSC GS syllabus topics and micro-tests.",
      tag: "Daily Content",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-900 border border-indigo-500/20 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
              Aarambh360 Administration
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-3">
              UPSC Platform Command Center
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
              Manage curriculum content, monitor mains OCR & AI evaluation pipelines, track aspirant analytics, and administer subscription entitlements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/30">
              + New Lesson / MCQ
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`p-6 rounded-xl bg-gradient-to-br ${stat.color} bg-slate-900/60 border ${stat.borderColor} backdrop-blur`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xs font-medium text-slate-400">{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* CMS & Service Modules */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Core Management Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((sec, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-slate-800 px-2.5 py-1 rounded">
                  {sec.tag}
                </span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {sec.status}
                </span>
              </div>
              <h4 className="text-base font-semibold text-white mt-3">{sec.title}</h4>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{sec.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Next.js App Router Interface</span>
                <span className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                  Manage Module &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
