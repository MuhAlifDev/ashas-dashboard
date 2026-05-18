export default function DashboardHome() {
  return (
    <>
      {/* SideNavBar */}
      <nav className="bg-glass-surface dark:bg-inverse-surface/40 font-body-md text-body-md h-screen w-20 flex flex-col items-center py-8 backdrop-blur-xl border-r border-glass-border shadow-[40px_0_60px_-15px_rgba(99,102,241,0.05)] fixed left-0 top-0 z-50 justify-between">
        <div className="flex flex-col items-center gap-10">
          {/* Brand Logo */}
          <div className="font-display-lg text-[24px] font-bold text-accent-black dark:text-surface-lowest leading-none">
            f
          </div>
          {/* Tabs */}
          <ul className="flex flex-col gap-6">
            <li>
              <a aria-label="Home" className="flex items-center justify-center bg-accent-black dark:bg-surface-bright text-on-secondary rounded-full p-3 scale-95 shadow-lg transition-all duration-300 ease-out group" href="#">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              </a>
            </li>
            <li>
              <a aria-label="Projects" className="flex items-center justify-center text-on-surface-variant dark:text-outline-variant p-3 hover:scale-105 hover:text-accent-black dark:hover:text-surface-lowest transition-all duration-300 ease-out group" href="#">
                <span className="material-symbols-outlined">analytics</span>
              </a>
            </li>
            <li>
              <a aria-label="Clients" className="flex items-center justify-center text-on-surface-variant dark:text-outline-variant p-3 hover:scale-105 hover:text-accent-black dark:hover:text-surface-lowest transition-all duration-300 ease-out group" href="#">
                <span className="material-symbols-outlined">group</span>
              </a>
            </li>
            <li>
              <a aria-label="Invoices" className="flex items-center justify-center text-on-surface-variant dark:text-outline-variant p-3 hover:scale-105 hover:text-accent-black dark:hover:text-surface-lowest transition-all duration-300 ease-out group" href="#">
                <span className="material-symbols-outlined">receipt_long</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center gap-6">
          <a aria-label="Settings" className="flex items-center justify-center text-on-surface-variant dark:text-outline-variant p-3 hover:scale-105 hover:text-accent-black dark:hover:text-surface-lowest transition-all duration-300 ease-out group" href="#">
            <span className="material-symbols-outlined">settings</span>
          </a>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-glass-border shadow-sm">
            <img alt="Finanku Logo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgjkYDVWNuhseMPHdwToIiM4RQtY2W1NZRu7rmhWmijttos1S7-GRpzmlD2yUBfFE5AwAriOSUeXmdecGw7gGfRP6JAF6u7J9agApnxbc8RGEa5_DTrdNvG4A5b5dTZWRaoj2-JipF07FOZC8Tk04bOuEe2f7HEsRmujRoOiaheQsuCt40hD0VPwvl4x251Mcrsg_4izKdeZxTod724pJzPA0nUfEQrNffyyK5qbS-2JFy8yEGjnQFbC3gfyXtnpV_Vxwku-O4t7E3"/>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="ml-20 flex-1 flex flex-col min-h-screen px-container-padding py-8 max-w-[1600px] mx-auto w-full">
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full mb-10 h-20 bg-transparent text-accent-black dark:text-surface-bright font-headline-md text-headline-md scale-98 transition-transform">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-accent-black">Finanku</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Start managing your finances</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="clay-pill px-4 py-2 rounded-full font-num-data text-num-data text-on-surface-variant flex items-center gap-2 tabular-nums-custom">
              <span>**** 4168</span>
              <span className="text-outline">01/29</span>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:text-primary transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:text-primary transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter flex-1">
          {/* Left/Center Column (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-gutter">
            {/* Hero Card: Total Revenue */}
            <div className="glass-card rounded-3xl p-card-padding relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              {/* Metaball decorative background */}
              <div className="absolute inset-0 z-0 opacity-80 pointer-events-none flex items-center justify-center blur-2xl">
                <div className="w-48 h-48 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-60 absolute left-1/4 top-1/2 -translate-y-1/2"></div>
                <div className="w-56 h-56 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-50 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="w-40 h-40 bg-tertiary-fixed-dim rounded-full mix-blend-multiply filter blur-2xl opacity-40 absolute right-1/4 top-1/2 -translate-y-1/2"></div>
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h2 className="font-body-md text-body-md text-on-surface-variant mb-2">Total Revenue</h2>
                  <p className="font-num-display text-num-display text-accent-black tabular-nums-custom tracking-tight">$45,250.00</p>
                </div>
                <div className="flex gap-2 clay-pill rounded-full p-1">
                  <button className="px-4 py-1.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-glass-surface transition-colors">EUR</button>
                  <button className="clay-pill-active px-4 py-1.5 rounded-full font-label-caps text-label-caps">USD</button>
                </div>
              </div>

              {/* Metaball data visualization pods */}
              <div className="relative z-10 mt-12 flex items-center justify-center">
                <div className="flex items-center space-x-[-20px]">
                  {/* Web Projects */}
                  <div className="w-32 h-32 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm flex flex-col items-center justify-center relative z-20">
                    <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">$25,208</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">Web Projects</span>
                  </div>
                  {/* Retainers (Center, highlighted) */}
                  <div className="w-40 h-40 rounded-full bg-primary/90 backdrop-blur-md shadow-lg flex flex-col items-center justify-center relative z-30 transform scale-110">
                    <span className="font-num-data text-num-data text-white tabular-nums-custom">$15,558</span>
                    <span className="font-label-caps text-label-caps text-white/80 mt-1">Retainers</span>
                  </div>
                  {/* Pending */}
                  <div className="w-32 h-32 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm flex flex-col items-center justify-center relative z-20">
                    <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">$4,484</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">Pending</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex justify-end gap-4 mt-8">
                <button className="clay-pill px-6 py-3 rounded-full font-body-sm text-body-sm text-on-surface-variant hover:bg-glass-surface transition-colors">Receive Money</button>
                <button className="bg-accent-black text-on-secondary px-8 py-3 rounded-full font-body-sm text-body-sm hover:scale-105 ambient-shadow transition-all duration-300">Create Invoice</button>
              </div>
            </div>

            {/* Middle Row: Financial Health (Chart) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Expense Statistic (Bar) */}
              <div className="glass-card rounded-3xl p-card-padding flex flex-col justify-between h-64">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-body-md text-body-md text-on-surface-variant">Expense statistic</h3>
                  <div className="clay-pill px-3 py-1 rounded-full font-label-caps text-label-caps text-on-surface-variant">Monthly</div>
                </div>
                {/* Simulated Bar Chart */}
                <div className="flex-1 flex items-end justify-between px-4">
                  <div className="w-8 h-12 clay-pill rounded-t-lg relative group">
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-on-surface-variant opacity-50">MAY</span>
                  </div>
                  <div className="w-8 h-20 clay-pill rounded-t-lg relative group">
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-on-surface-variant opacity-50">JUN</span>
                  </div>
                  {/* Active Bar */}
                  <div className="w-10 h-32 bg-gradient-to-t from-primary/80 to-primary/40 rounded-t-xl relative shadow-[0_-10px_20px_rgba(99,102,241,0.2)]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent-black text-white px-2 py-1 rounded-md font-label-caps text-label-caps">$45k</div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-accent-black font-bold">JUL</span>
                  </div>
                  <div className="w-8 h-16 clay-pill rounded-t-lg relative group">
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-on-surface-variant opacity-50">AUG</span>
                  </div>
                  <div className="w-8 h-10 clay-pill rounded-t-lg relative group">
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-on-surface-variant opacity-50">SEP</span>
                  </div>
                </div>
              </div>

              {/* Financial Health (Line Chart) */}
              <div className="glass-card rounded-3xl p-card-padding flex flex-col justify-between h-64 bg-gradient-to-br from-primary/20 to-transparent relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <h3 className="font-body-md text-body-md text-accent-black">Financial health</h3>
                  <button className="w-8 h-8 clay-pill rounded-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                  </button>
                </div>
                <div className="relative z-10 mt-2">
                  <span className="font-headline-lg text-headline-lg text-accent-black tabular-nums-custom">85%</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant ml-2">since last month</span>
                </div>
                {/* Simulated Line Chart */}
                <div className="absolute bottom-0 left-0 right-0 h-32 z-0">
                  {/* SVG Path for curve */}
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                    <path d="M0,80 Q50,60 100,70 T200,50 T300,80 T400,20" fill="none" stroke="rgba(255,255,255,0.8)" strokeLinecap="round" strokeWidth="3"></path>
                    <path d="M0,80 Q50,60 100,70 T200,50 T300,80 T400,20 L400,100 L0,100 Z" fill="url(#grad)" opacity="0.4"></path>
                    <defs>
                      <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#4648d4" stopOpacity="0.5"></stop>
                        <stop offset="100%" stopColor="#4648d4" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    {/* Glowing bead */}
                    <circle cx="300" cy="80" fill="white" filter="drop-shadow(0 0 4px #4648d4)" r="4"></circle>
                    <text className="tabular-nums-custom" fill="#464554" fontFamily="Inter" fontSize="12" fontWeight="600" x="300" y="70">16.7%</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Row: Upcoming Invoices */}
            <div className="glass-card rounded-3xl p-card-padding flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-body-md text-body-md text-accent-black font-semibold">Upcoming payments</h3>
                <button className="bg-accent-black text-on-secondary px-4 py-1.5 rounded-full font-label-caps text-label-caps hover:scale-105 transition-transform">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {/* Invoice Item 1 (Today) */}
                <div className="clay-pill rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-primary">storefront</span>
                    </div>
                    <span className="font-body-md text-body-md text-accent-black font-medium">E-commerce UI/UX</span>
                  </div>
                  <div className="w-1/4">
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-caps text-label-caps">Today</span>
                  </div>
                  <div className="w-1/4">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Design System</span>
                  </div>
                  <div className="w-1/6 text-right">
                    <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">$3,000</span>
                  </div>
                </div>
                {/* Invoice Item 2 */}
                <div className="bg-white/30 rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-glass-border transition-colors">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-on-surface-variant">draw</span>
                    </div>
                    <span className="font-body-md text-body-md text-accent-black font-medium">Acme Rebranding</span>
                  </div>
                  <div className="w-1/4">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Jun 23</span>
                  </div>
                  <div className="w-1/4">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Brand Identity</span>
                  </div>
                  <div className="w-1/6 text-right">
                    <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">$1,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-gutter">
            {/* Transactions / Recent Client Payments */}
            <div className="glass-card rounded-3xl p-card-padding flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-headline-md text-headline-md text-accent-black">Transactions</h2>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:text-primary transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </button>
                  <button className="bg-accent-black text-on-secondary px-4 py-1.5 rounded-full font-label-caps text-label-caps hover:scale-105 transition-transform">View All</button>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Latest transfers</p>
              
              <div className="flex flex-col gap-4">
                {/* Transaction 1 */}
                <div className="flex items-center justify-between group hover:bg-white/20 p-2 rounded-xl transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-accent-black">arrow_upward_alt</span>
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-accent-black font-medium">Acme Corp Revamp</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">Jun 15</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-label-caps text-label-caps text-[10px]">Pending</span>
                    <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">+$2,500</span>
                  </div>
                </div>

                {/* Transaction 2 */}
                <div className="flex items-center justify-between group hover:bg-white/20 p-2 rounded-xl transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-accent-black">arrow_upward_alt</span>
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-accent-black font-medium">Folks Media Branding</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">Jun 14</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-glass-surface text-on-surface-variant px-2 py-0.5 rounded-full font-label-caps text-label-caps text-[10px]">Paid</span>
                    <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">+$1,200</span>
                  </div>
                </div>

                {/* Transaction 3 */}
                <div className="flex items-center justify-between group hover:bg-white/20 p-2 rounded-xl transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-accent-black">arrow_downward_alt</span>
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-accent-black font-medium">Vercel Hosting</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">Jun 13</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-glass-surface text-on-surface-variant px-2 py-0.5 rounded-full font-label-caps text-label-caps text-[10px]">Expense</span>
                    <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">-$120</span>
                  </div>
                </div>
              </div>

              {/* CTA Text block */}
              <div className="mt-8 pt-6 border-t border-glass-border">
                <h4 className="font-body-md text-body-md font-semibold text-accent-black mb-1">How to reduce expenses by 25%?</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">View these useful tips to save your money.</p>
                <a className="font-body-sm text-body-sm text-primary underline underline-offset-2" href="#">Learn more</a>
              </div>
            </div>

            {/* Quick Action Widget */}
            <div className="glass-card rounded-3xl p-card-padding clay-pill border-none">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-body-md text-body-md text-accent-black font-medium">Quick transfer</h3>
                <div className="flex gap-2 text-label-caps font-label-caps">
                  <button className="text-on-surface-variant">All</button>
                  <button className="bg-white px-3 py-1 rounded-full shadow-sm text-accent-black">Contacts</button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
                {/* Add New */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button className="w-12 h-12 rounded-full border border-dashed border-outline-variant flex items-center justify-center hover:bg-white/50 transition-colors">
                    <span className="material-symbols-outlined text-outline-variant">add</span>
                  </button>
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">Add new</span>
                </div>
                {/* Contact 1 */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <img alt="Client Avatar 1" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWbkyoNuXgsS65IzBYYR7uVl0mRmWUEsrUL6YGqVmSDkVx7aLKNX_ZGH0sQwIvloK3fR5vSkonE2joCO1mGWFIjvJHnilsPdjD5fx0TRkIbc_RrztFHvaOqkQdG58ksLxdy-TzVaoniDycShdLMhn1YGqCN8_ZBV9_BlpTsac21D4eGEAct40eVmERif-_RkGds9XKOFeVoWIgdiLUL82zi0ABySB2iibLg38URDNBf7nds0s2w2btOb8O8A9oyjKBot0ewa3v4LPs"/>
                  <span className="font-label-caps text-label-caps text-accent-black text-[10px]">F. Alonso</span>
                </div>
                {/* Contact 2 */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <img alt="Client Avatar 2" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe0cgOzMtd9hYtpE5GVdQBf2--k11G7A4a5x-WOxHHG_K6OZyLsbZXEktiXA_gkz-cDIhLvVBmErtq1FoSPRjooTwsw3le7qG65uSr0jZJ0TivuNjcmffZkW-zBB-kCWbD0CBGdNz_VxTS2J0E13bKV4_Bz8dzKfEDPoSDSsNKdlZVZU9gorihgqcNZdQUC-3zj3mvkiwnPnsLJjullbqdw8cTHIkKCc94PTUIWTuRDHANaxqgjX3xtwbV1Mm5xHAg5LnsUXa4UFxo"/>
                  <span className="font-label-caps text-label-caps text-accent-black text-[10px]">C. Leclerc</span>
                </div>
                {/* Contact 3 */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <img alt="Client Avatar 3" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTlx_BgUopNT8wOK7J2GNY2IyXr6FByFNOTSOe6CIMCT1HJy9ny7Bc-rWCCW5KWfTGVImtE2kKaN72DLQcxBzulaZbMX9PvZuULYvmSLF3d9BNK_YhHdDMnpud7RxecAFdZEyyoHES79cqMDAAZ597ZJK34LaDXgBCG86aL2TEBlYDxVh3BLh4Qvab4UdYinSAuyGNl_3dTHxw-ZWfm7ipf1Bicaud_c6cWhWuXvH5OTA-zEvgVd0UfumZYSZwDmh4aqWqDKfid6Rf"/>
                  <span className="font-label-caps text-label-caps text-accent-black text-[10px]">M. Naira</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-white/40 rounded-full p-2 pl-6 backdrop-blur-sm border border-white/60">
                <span className="font-num-data text-num-data text-accent-black tabular-nums-custom">$100.00</span>
                <button className="bg-accent-black text-on-secondary px-6 py-2 rounded-full font-body-sm text-body-sm hover:scale-105 transition-transform shadow-md">Send</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
