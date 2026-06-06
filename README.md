
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .readme {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-primary);
    max-width: 680px;
    padding: 2rem 0 3rem;
  }

  .hero {
    border-bottom: 0.5px solid var(--color-border-tertiary);
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }

  .hero-eyebrow {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
    margin-bottom: 0.5rem;
  }

  .hero-title {
    font-family: 'Fraunces', serif;
    font-size: 42px;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--color-text-primary);
    margin-bottom: 1rem;
  }

  .hero-title em {
    font-style: italic;
    color: var(--color-text-secondary);
  }

  .hero-desc {
    font-size: 13px;
    color: var(--color-text-secondary);
    max-width: 480px;
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }

  .badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    padding: 3px 10px;
    border-radius: 100px;
    border: 0.5px solid var(--color-border-secondary);
    color: var(--color-text-secondary);
    background: var(--color-background-secondary);
  }

  .badge-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.5;
  }

  .section {
    margin-bottom: 2.5rem;
  }

  .section-label {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: var(--color-border-tertiary);
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1px;
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    background: var(--color-border-tertiary);
  }

  .feature-card {
    background: var(--color-background-primary);
    padding: 1rem 1.25rem;
  }

  .feature-icon {
    font-size: 16px;
    color: var(--color-text-tertiary);
    margin-bottom: 8px;
  }

  .feature-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 4px;
    font-family: 'DM Mono', monospace;
  }

  .feature-desc {
    font-size: 11px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .stack-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
  }

  .stack-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-md);
    background: var(--color-background-secondary);
  }

  .stack-icon {
    font-size: 18px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .stack-label {
    font-size: 12px;
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .stack-sub {
    font-size: 10px;
    color: var(--color-text-tertiary);
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
  }

  .step {
    display: grid;
    grid-template-columns: 48px 1fr;
    border-bottom: 0.5px solid var(--color-border-tertiary);
    background: var(--color-background-primary);
  }

  .step:last-child { border-bottom: none; }

  .step-num {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem 0;
    font-size: 11px;
    color: var(--color-text-tertiary);
    border-right: 0.5px solid var(--color-border-tertiary);
    font-family: 'DM Mono', monospace;
  }

  .step-body {
    padding: 1rem 1.25rem;
  }

  .step-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 6px;
    font-family: 'DM Mono', monospace;
  }

  .step-desc {
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .code-block {
    background: var(--color-background-secondary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-md);
    padding: 10px 14px;
    font-size: 11.5px;
    font-family: 'DM Mono', monospace;
    color: var(--color-text-secondary);
    line-height: 1.8;
    overflow-x: auto;
    white-space: pre;
  }

  .code-comment {
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  .env-var {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .env-val {
    color: var(--color-text-secondary);
  }

  .env-section {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 0.5px solid var(--color-border-tertiary);
  }

  .folder-tree {
    background: var(--color-background-secondary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 1.25rem 1.5rem;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    line-height: 2;
  }

  .tree-dir {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .tree-file {
    color: var(--color-text-secondary);
  }

  .tree-comment {
    color: var(--color-text-tertiary);
    font-size: 11px;
    margin-left: 6px;
  }

  .tree-indent-1 { padding-left: 16px; }
  .tree-indent-2 { padding-left: 32px; }

  .script-table {
    width: 100%;
    border-collapse: collapse;
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    font-size: 12px;
  }

  .script-table th {
    background: var(--color-background-secondary);
    padding: 8px 16px;
    text-align: left;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
    border-bottom: 0.5px solid var(--color-border-tertiary);
  }

  .script-table td {
    padding: 10px 16px;
    border-bottom: 0.5px solid var(--color-border-tertiary);
    color: var(--color-text-secondary);
    vertical-align: middle;
  }

  .script-table tr:last-child td { border-bottom: none; }

  .script-table .cmd {
    font-family: 'DM Mono', monospace;
    color: var(--color-text-primary);
    font-weight: 500;
    font-size: 12px;
  }

  .note-box {
    border-left: 2px solid var(--color-border-secondary);
    padding: 12px 16px;
    background: var(--color-background-secondary);
    border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
    margin-top: 8px;
  }

  .note-box p {
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.7;
    margin-bottom: 4px;
  }

  .note-box p:last-child { margin-bottom: 0; }

  .note-box .note-icon {
    font-size: 14px;
    color: var(--color-text-tertiary);
    margin-right: 6px;
    vertical-align: -2px;
  }

  .deploy-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .deploy-card {
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 1rem 1.25rem;
    background: var(--color-background-primary);
  }

  .deploy-card-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .deploy-card-desc {
    font-size: 11px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
</style>

<div class="readme">
  <div class="hero">
    <p class="hero-eyebrow">full-stack productivity · next.js + mongodb</p>
    <h1 class="hero-title">Habit <em>Tracker</em></h1>
    <p class="hero-desc">A daily habit-tracking dashboard with streak analytics, calendar heatmaps, badge rewards, and secure transactional email workflows — built for consistency and accountability.</p>
    <div class="badge-row">
      <span class="badge"><span class="badge-dot"></span>Next.js 16</span>
      <span class="badge"><span class="badge-dot"></span>React 19</span>
      <span class="badge"><span class="badge-dot"></span>Tailwind CSS 4</span>
      <span class="badge"><span class="badge-dot"></span>Prisma + MongoDB</span>
      <span class="badge"><span class="badge-dot"></span>NextAuth</span>
      <span class="badge"><span class="badge-dot"></span>Cloudinary</span>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Features</div>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon"><i class="ti ti-lock" aria-hidden="true"></i></div>
        <div class="feature-title">Authentication</div>
        <div class="feature-desc">Email + password login, session signing, account recovery flows</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="ti ti-checklist" aria-hidden="true"></i></div>
        <div class="feature-title">Daily tracking</div>
        <div class="feature-desc">Boolean, timed, or page-count habits logged every day</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="ti ti-chart-bar" aria-hidden="true"></i></div>
        <div class="feature-title">Analytics</div>
        <div class="feature-desc">Streaks, calendar heatmap, accuracy rates, monthly reports</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="ti ti-medal" aria-hidden="true"></i></div>
        <div class="feature-title">Badges</div>
        <div class="feature-desc">Earn achievement badges to stay motivated over time</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="ti ti-mail" aria-hidden="true"></i></div>
        <div class="feature-title">Email workflows</div>
        <div class="feature-desc">Password reset, email verification, and change flows via SMTP</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="ti ti-user-circle" aria-hidden="true"></i></div>
        <div class="feature-title">Avatar uploads</div>
        <div class="feature-desc">Profile images stored via Cloudinary integration</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Tech stack</div>
    <div class="stack-grid">
      <div class="stack-item">
        <i class="ti ti-brand-nextjs stack-icon" aria-hidden="true"></i>
        <div><div class="stack-label">Next.js 16</div><div class="stack-sub">App Router</div></div>
      </div>
      <div class="stack-item">
        <i class="ti ti-brand-react stack-icon" aria-hidden="true"></i>
        <div><div class="stack-label">React 19</div><div class="stack-sub">Client + Server</div></div>
      </div>
      <div class="stack-item">
        <i class="ti ti-database stack-icon" aria-hidden="true"></i>
        <div><div class="stack-label">Prisma</div><div class="stack-sub">MongoDB ORM</div></div>
      </div>
      <div class="stack-item">
        <i class="ti ti-lock stack-icon" aria-hidden="true"></i>
        <div><div class="stack-label">NextAuth</div><div class="stack-sub">Credentials</div></div>
      </div>
      <div class="stack-item">
        <i class="ti ti-mail stack-icon" aria-hidden="true"></i>
        <div><div class="stack-label">Nodemailer</div><div class="stack-sub">SMTP / transactional</div></div>
      </div>
      <div class="stack-item">
        <i class="ti ti-photo stack-icon" aria-hidden="true"></i>
        <div><div class="stack-label">Cloudinary</div><div class="stack-sub">Avatar uploads</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Getting started</div>
    <div class="steps">
      <div class="step">
        <div class="step-num">01</div>
        <div class="step-body">
          <div class="step-title">Install dependencies</div>
          <div class="code-block">pnpm install</div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">02</div>
        <div class="step-body">
          <div class="step-title">Configure environment variables</div>
          <div class="step-desc">Create a <code style="font-family:inherit;background:var(--color-background-secondary);padding:1px 5px;border-radius:3px;font-size:11px">.env</code> file at the project root:</div>
          <div class="code-block"><span class="code-comment"># database</span>
<span class="env-var">DATABASE_URL</span>=<span class="env-val">"mongodb+srv://user:pass@cluster/db"</span>

<span class="code-comment"># auth</span>
<span class="env-var">NEXTAUTH_URL</span>=<span class="env-val">"http://localhost:3000"</span>
<span class="env-var">NEXTAUTH_SECRET</span>=<span class="env-val">"a-long-random-secret"</span>
<div class="env-section"><span class="code-comment"># email (SMTP)</span>
<span class="env-var">EMAIL_HOST</span>=<span class="env-val">smtp.example.com</span>
<span class="env-var">EMAIL_PORT</span>=<span class="env-val">465</span>
<span class="env-var">EMAIL_SECURE</span>=<span class="env-val">true</span>
<span class="env-var">EMAIL_USER</span>=<span class="env-val">your-smtp-user</span>
<span class="env-var">EMAIL_PASS</span>=<span class="env-val">your-smtp-password</span>
<span class="env-var">EMAIL_FROM</span>=<span class="env-val">"Habit Tracker &lt;noreply@yourdomain.com&gt;"</span></div><div class="env-section"><span class="code-comment"># cloudinary (optional — avatar uploads only)</span>
<span class="env-var">CLOUDINARY_CLOUD_NAME</span>=<span class="env-val">your-cloud-name</span>
<span class="env-var">CLOUDINARY_API_KEY</span>=<span class="env-val">your-api-key</span>
<span class="env-var">CLOUDINARY_API_SECRET</span>=<span class="env-val">your-api-secret</span></div></div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">03</div>
        <div class="step-body">
          <div class="step-title">Initialize Prisma</div>
          <div class="code-block">pnpm prisma generate
pnpm prisma db push</div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">04</div>
        <div class="step-body">
          <div class="step-title">Run the dev server</div>
          <div class="code-block">pnpm dev</div>
          <div class="step-desc" style="margin-top:8px">Open <span style="color:var(--color-text-info)">http://localhost:3000</span> — register at <code style="font-family:inherit;background:var(--color-background-secondary);padding:1px 5px;border-radius:3px;font-size:11px">/register</code>, then create your first habit.</div>
        </div>
      </div>
    </div>

    <div class="note-box" style="margin-top:12px">
      <p><i class="ti ti-info-circle note-icon" aria-hidden="true"></i>Email delivery requires valid SMTP credentials. Cloudinary variables are optional — skip them if you don't need avatar uploads. Always set <code style="font-size:11px;background:var(--color-background-primary);padding:1px 4px;border-radius:3px">NEXTAUTH_SECRET</code> in production.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Scripts</div>
    <table class="script-table">
      <thead>
        <tr>
          <th>command</th>
          <th>description</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="cmd">pnpm dev</td><td>Start the development server</td></tr>
        <tr><td class="cmd">pnpm build</td><td>Build the production bundle</td></tr>
        <tr><td class="cmd">pnpm start</td><td>Start the production server</td></tr>
        <tr><td class="cmd">pnpm lint</td><td>Run ESLint across the project</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-label">Project structure</div>
    <div class="folder-tree">
<span class="tree-dir">app/</span>
<div class="tree-indent-1"><span class="tree-dir">api/</span><span class="tree-comment">→ auth, badges, habits, stats, settings</span></div>
<div class="tree-indent-1"><span class="tree-dir">dashboard/</span><span class="tree-comment">→ analytics, calendar, habits, insights, settings</span></div>
<div class="tree-indent-1"><span class="tree-dir">login/ &nbsp;register/ &nbsp;reset-password/</span></div>
<div class="tree-indent-1"><span class="tree-dir">SessionProvider/</span></div>
<span class="tree-dir" style="margin-top:4px;display:block">context/</span><span class="tree-comment">→ client-side session state</span>
<span class="tree-dir">lib/</span>
<div class="tree-indent-1"><span class="tree-file">cloudinary.js &nbsp;email.js &nbsp;prisma.js</span></div>
<span class="tree-dir">prisma/</span><span class="tree-comment">→ schema + migrations</span>
<span class="tree-dir">public/</span><span class="tree-comment">→ static assets</span>
<span class="tree-dir">types/</span><span class="tree-comment">→ TypeScript declarations</span>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Deployment</div>
    <div class="deploy-grid">
      <div class="deploy-card">
        <div class="deploy-card-title"><i class="ti ti-brand-vercel" style="font-size:16px" aria-hidden="true"></i> Vercel</div>
        <div class="deploy-card-desc">Recommended. Connect your repo, add environment variables, and deploy. Zero configuration needed.</div>
      </div>
      <div class="deploy-card">
        <div class="deploy-card-title"><i class="ti ti-server" style="font-size:16px" aria-hidden="true"></i> Node hosting</div>
        <div class="deploy-card-desc">Any Node-compatible environment works. Ensure env vars are set and MongoDB Atlas is reachable from the host.</div>
      </div>
    </div>
  </div>
</div>
