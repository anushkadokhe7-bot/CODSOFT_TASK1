/**
 * CareerConnect Complete SPA Script
 */

const KEYS = {
  ACCOUNTS: 'careerconnect-demo-accounts',
  SESSION: 'careerconnect-demo-session',
  JOBS: 'careerconnect-employer-jobs',
  APPLICATIONS: 'careerconnect-applications',
  PAGE_VIEWS: 'careerconnect-page-views'
};

const SAMPLE_JOBS = [
  {
    id: 'job-1',
    title: 'Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Remote',
    type: 'Full-time',
    salary: '$80,000 - $100,000',
    description: 'Looking for a skilled HTML, CSS, and JavaScript developer to build modern responsive web interfaces.',
    employerEmail: 'employer@techcorp.com',
    createdAt: new Date().toISOString()
  },
  {
    id: 'job-2',
    title: 'UI/UX Product Designer',
    company: 'Creative Studio',
    location: 'New York, NY',
    type: 'Part-time',
    salary: '$50,000 - $65,000',
    description: 'Design intuitive workflows, wireframes, and beautiful client-facing web and mobile components.',
    employerEmail: 'employer@techcorp.com',
    createdAt: new Date().toISOString()
  }
];

let candidateChartInstance = null;
let employerChartInstance = null;

// XSS Sanitizer
function sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Storage Helpers
function getStore(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStore(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  if (!getStore(KEYS.JOBS, null)) {
    setStore(KEYS.JOBS, SAMPLE_JOBS);
  }
  
  // Track page visit
  let visits = parseInt(localStorage.getItem(KEYS.PAGE_VIEWS) || '0', 10) + 1;
  localStorage.setItem(KEYS.PAGE_VIEWS, visits.toString());

  setupMobileNav();
  updateNavbarAuth();
  navigateTo('home');
});

function setupMobileNav() {
  const toggle = document.getElementById('mobileNavToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('active'));
  }
}

// SPA Router / View Switcher
function navigateTo(viewName, param = null) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const session = getStore(KEYS.SESSION, null);

  // Role Guardrails
  if (viewName === 'candidate' && (!session || session.role !== 'Candidate')) {
    alert('Candidate access required.');
    viewName = 'auth';
  }
  if (viewName === 'employer' && (!session || session.role !== 'Employer')) {
    alert('Employer access required.');
    viewName = 'auth';
  }

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.classList.remove('hidden');

  // Trigger view renderers
  if (viewName === 'home') initHomeView();
  if (viewName === 'jobs') initBrowseJobsView();
  if (viewName === 'candidate') initCandidateDashboard();
  if (viewName === 'employer') initEmployerDashboard();
  if (viewName === 'job-details' && param) initJobDetailsView(param);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  const links = document.getElementById('navLinks');
  if (links) links.classList.remove('active');
}

// Navbar Authentication State UI
function updateNavbarAuth() {
  const session = getStore(KEYS.SESSION, null);
  const container = document.getElementById('dynamicNavArea');
  if (!container) return;

  if (session && session.email) {
    const dash = session.role === 'Employer' ? 'employer' : 'candidate';
    container.innerHTML = `
      <a href="#" class="nav-link" onclick="navigateTo('${dash}')">Dashboard (${sanitize(session.name)})</a>
      <button class="btn btn-danger" onclick="handleLogout()" style="padding: 6px 12px; font-size: 0.85rem;">Logout</button>
    `;
  } else {
    container.innerHTML = `
      <a href="#" class="nav-link" onclick="navigateTo('auth')">Login / Sign Up</a>
    `;
  }
}

function handleLogout() {
  localStorage.removeItem(KEYS.SESSION);
  updateNavbarAuth();
  navigateTo('home');
}

// 1. HOME VIEW
function initHomeView() {
  const jobs = getStore(KEYS.JOBS, []);
  const apps = getStore(KEYS.APPLICATIONS, []);
  const users = getStore(KEYS.ACCOUNTS, []);
  const visits = localStorage.getItem(KEYS.PAGE_VIEWS) || '1';

  document.getElementById('statTotalJobs').textContent = jobs.length;
  document.getElementById('statTotalApplications').textContent = apps.length;
  document.getElementById('statTotalUsers').textContent = users.length;
  document.getElementById('statPageVisits').textContent = visits;

  renderJobListings('homeJobListings', jobs.slice(0, 6));
}

function handleHomeSearch() {
  navigateTo('jobs');
}

// 2. BROWSE JOBS VIEW
function initBrowseJobsView() {
  const jobs = getStore(KEYS.JOBS, []);
  renderJobListings('browseJobListings', jobs);
}

function filterBrowseJobs() {
  const query = (document.getElementById('browseSearchInput')?.value || '').toLowerCase();
  const jobs = getStore(KEYS.JOBS, []).filter(j => 
    j.title.toLowerCase().includes(query) || 
    j.company.toLowerCase().includes(query) || 
    j.description.toLowerCase().includes(query)
  );
  renderJobListings('browseJobListings', jobs);
}

function jobCardTemplate(job) {
  return `
    <div class="job-card">
      <div>
        <div class="job-card-header">
          <a class="job-title" onclick="navigateTo('job-details', '${sanitize(job.id)}')">${sanitize(job.title)}</a>
          <span class="job-badge">${sanitize(job.type)}</span>
        </div>
        <div class="job-company">${sanitize(job.company)}</div>
        <div class="job-details-meta">
          <span>📍 ${sanitize(job.location)}</span>
          <span>💰 ${sanitize(job.salary)}</span>
        </div>
        <p class="job-desc">${sanitize(job.description)}</p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
        <small style="color: var(--text-muted);">${new Date(job.createdAt || Date.now()).toLocaleDateString()}</small>
        <button class="btn btn-primary" style="padding: 6px 14px; font-size: 0.85rem;" onclick="navigateTo('job-details', '${sanitize(job.id)}')">View & Apply</button>
      </div>
    </div>
  `;
}

function renderJobListings(elementId, list) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (list.length === 0) {
    el.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 30px;">No job listings found.</p>';
    return;
  }
  el.innerHTML = list.map(job => jobCardTemplate(job)).join('');
}

// 3. AUTH VIEW (Login / Signup)
function switchAuthMode(mode) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginBtn = document.getElementById('tabLoginBtn');
  const signupBtn = document.getElementById('tabSignupBtn');

  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginBtn.classList.add('active');
    signupBtn.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    loginBtn.classList.remove('active');
    signupBtn.classList.add('active');
  }
}

function processSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const role = document.getElementById('signupRole').value;

  let accounts = getStore(KEYS.ACCOUNTS, []);
  if (accounts.some(acc => acc.email === email)) {
    alert('An account with this email already exists.');
    return;
  }

  accounts.push({ name, email, password, role });
  setStore(KEYS.ACCOUNTS, accounts);
  alert('Account created successfully! Please log in.');
  switchAuthMode('login');
}

function processLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  let accounts = getStore(KEYS.ACCOUNTS, []);
  const user = accounts.find(acc => acc.email === email && acc.password === password);

  if (!user) {
    alert('Invalid email or password.');
    return;
  }

  setStore(KEYS.SESSION, { name: user.name, email: user.email, role: user.role });
  updateNavbarAuth();
  alert(`Welcome back, ${user.name}!`);

  if (user.role === 'Employer') {
    navigateTo('employer');
  } else {
    navigateTo('candidate');
  }
}

// 4. CANDIDATE DASHBOARD
function initCandidateDashboard() {
  const session = getStore(KEYS.SESSION, null);
  if (!session) return;

  document.getElementById('candidateWelcomeMsg').textContent = `Welcome back, ${session.name}!`;

  const apps = getStore(KEYS.APPLICATIONS, []).filter(a => a.candidateEmail === session.email);
  const total = apps.length;
  const pending = apps.filter(a => a.status === 'Pending').length;
  const accepted = apps.filter(a => a.status === 'Accepted').length;
  const rejected = apps.filter(a => a.status === 'Rejected').length;

  document.getElementById('candStatTotal').textContent = total;
  document.getElementById('candStatPending').textContent = pending;
  document.getElementById('candStatAccepted').textContent = accepted;
  document.getElementById('candStatRejected').textContent = rejected;

  // Render Applications Table
  const tbody = document.getElementById('candidateApplicationsTable');
  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-muted">You haven't submitted any applications yet.</td></tr>`;
  } else {
    tbody.innerHTML = apps.map(app => `
      <tr>
        <td><strong>${sanitize(app.jobTitle)}</strong></td>
        <td>${sanitize(app.company)}</td>
        <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
        <td><span class="status-badge status-${sanitize(app.status)}">${sanitize(app.status)}</span></td>
      </tr>
    `).join('');
  }

  renderCandidateJobBoard();
  renderCandidateChart(pending, accepted, rejected);
}

function renderCandidateJobBoard() {
  const query = (document.getElementById('candidateSearchInput')?.value || '').toLowerCase();
  const jobs = getStore(KEYS.JOBS, []).filter(j => 
    j.title.toLowerCase().includes(query) || j.company.toLowerCase().includes(query)
  );

  const container = document.getElementById('candidateJobBoard');
  if (!container) return;

  if (jobs.length === 0) {
    container.innerHTML = `<p class="text-muted p-20">No matching jobs found.</p>`;
    return;
  }

  container.innerHTML = jobs.map(job => `
    <div class="card p-15" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>${sanitize(job.title)}</strong><br>
        <small style="color: var(--secondary-color);">${sanitize(job.company)} (${sanitize(job.location)})</small>
      </div>
      <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="navigateTo('job-details', '${sanitize(job.id)}')">View</button>
    </div>
  `).join('');
}

function renderCandidateChart(pending, accepted, rejected) {
  const ctx = document.getElementById('candidateChart');
  if (!ctx) return;
  if (candidateChartInstance) candidateChartInstance.destroy();

  candidateChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Accepted', 'Rejected'],
      datasets: [{
        data: [pending, accepted, rejected],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// 5. EMPLOYER DASHBOARD
function initEmployerDashboard() {
  const session = getStore(KEYS.SESSION, null);
  if (!session) return;

  document.getElementById('employerWelcomeMsg').textContent = `Recruiter Portal — ${session.email}`;
  document.getElementById('empVisitorDisplay').textContent = `${localStorage.getItem(KEYS.PAGE_VIEWS) || '1'} Visits Recorded`;

  const jobs = getStore(KEYS.JOBS, []).filter(j => j.employerEmail === session.email);
  const jobIds = jobs.map(j => j.id);
  const apps = getStore(KEYS.APPLICATIONS, []).filter(a => jobIds.includes(a.jobId));

  const totalJobs = jobs.length;
  const totalApps = apps.length;
  const pending = apps.filter(a => a.status === 'Pending').length;
  const accepted = apps.filter(a => a.status === 'Accepted').length;

  document.getElementById('empStatJobs').textContent = totalJobs;
  document.getElementById('empStatApps').textContent = totalApps;
  document.getElementById('empStatPending').textContent = pending;
  document.getElementById('empStatAccepted').textContent = accepted;

  // Render Employer's Jobs
  const jobsListEl = document.getElementById('employerJobsList');
  if (jobs.length === 0) {
    jobsListEl.innerHTML = `<p class="text-muted">You haven't posted any jobs yet.</p>`;
  } else {
    jobsListEl.innerHTML = jobs.map(j => `
      <div class="card p-15 mb-10" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${sanitize(j.title)}</strong> (${sanitize(j.type)}) — 📍 ${sanitize(j.location)}
          <br><small style="color: var(--text-muted);">Salary: ${sanitize(j.salary)}</small>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" onclick="editJob('${sanitize(j.id)}')">Edit</button>
          <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteJob('${sanitize(j.id)}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // Render Applicants Table
  const applicantsTbody = document.getElementById('employerApplicantsTable');
  if (apps.length === 0) {
    applicantsTbody.innerHTML = `<tr><td colspan="7" class="text-muted">No applications received yet.</td></tr>`;
  } else {
    applicantsTbody.innerHTML = apps.map(app => `
      <tr>
        <td><strong>${sanitize(app.candidateName)}</strong></td>
        <td>${sanitize(app.candidateEmail)}</td>
        <td>${sanitize(app.jobTitle)}</td>
        <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
        <td><a href="#" onclick="alert('Downloading ${sanitize(app.resumeName)}...')">${sanitize(app.resumeName)}</a></td>
        <td><span class="status-badge status-${sanitize(app.status)}">${sanitize(app.status)}</span></td>
        <td>
          <button class="btn btn-accent" style="padding: 4px 8px; font-size: 0.75rem;" onclick="updateAppStatus('${sanitize(app.id)}', 'Accepted')">Accept</button>
          <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="updateAppStatus('${sanitize(app.id)}', 'Rejected')">Reject</button>
        </td>
      </tr>
    `).join('');
  }

  renderEmployerChart(pending, accepted, apps.filter(a => a.status === 'Rejected').length);
}

function renderEmployerChart(pending, accepted, rejected) {
  const ctx = document.getElementById('employerChart');
  if (!ctx) return;
  if (employerChartInstance) employerChartInstance.destroy();

  employerChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Pending', 'Accepted', 'Rejected'],
      datasets: [{
        label: 'Applicants',
        data: [pending, accepted, rejected],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

// Job Management Modal & Actions
function openJobModal(jobToEdit = null) {
  const session = getStore(KEYS.SESSION, null);
  if (!session || session.role !== 'Employer') {
    alert('Only employers can post jobs.');
    navigateTo('auth');
    return;
  }

  document.getElementById('jobModal').classList.remove('hidden');
  if (jobToEdit) {
    document.getElementById('jobModalTitle').textContent = 'Edit Job Listing';
    document.getElementById('editJobId').value = jobToEdit.id;
    document.getElementById('jobTitle').value = jobToEdit.title;
    document.getElementById('jobCompany').value = jobToEdit.company;
    document.getElementById('jobLocation').value = jobToEdit.location;
    document.getElementById('jobType').value = jobToEdit.type;
    document.getElementById('jobSalary').value = jobToEdit.salary;
    document.getElementById('jobDescription').value = jobToEdit.description;
  } else {
    document.getElementById('jobModalTitle').textContent = 'Post New Job Listing';
    document.getElementById('jobForm').reset();
    document.getElementById('editJobId').value = '';
  }
}

function closeJobModal() {
  document.getElementById('jobModal').classList.add('hidden');
}

function saveJobListing(e) {
  e.preventDefault();
  const session = getStore(KEYS.SESSION, null);
  const jobId = document.getElementById('editJobId').value;
  const jobs = getStore(KEYS.JOBS, []);

  const newJobData = {
    id: jobId || 'job-' + Date.now(),
    title: document.getElementById('jobTitle').value,
    company: document.getElementById('jobCompany').value,
    location: document.getElementById('jobLocation').value,
    type: document.getElementById('jobType').value,
    salary: document.getElementById('jobSalary').value,
    description: document.getElementById('jobDescription').value,
    employerEmail: session.email,
    createdAt: new Date().toISOString()
  };

  if (jobId) {
    const idx = jobs.findIndex(j => j.id === jobId);
    if (idx !== -1) jobs[idx] = newJobData;
  } else {
    jobs.push(newJobData);
  }

  setStore(KEYS.JOBS, jobs);
  closeJobModal();
  initEmployerDashboard();
  alert('Job listing saved successfully!');
}

function editJob(id) {
  const jobs = getStore(KEYS.JOBS, []);
  const job = jobs.find(j => j.id === id);
  if (job) openJobModal(job);
}

function deleteJob(id) {
  if (!confirm('Are you sure you want to delete this job listing?')) return;
  let jobs = getStore(KEYS.JOBS, []).filter(j => j.id !== id);
  setStore(KEYS.JOBS, jobs);
  initEmployerDashboard();
}

function updateAppStatus(appId, newStatus) {
  let apps = getStore(KEYS.APPLICATIONS, []);
  const idx = apps.findIndex(a => a.id === appId);
  if (idx !== -1) {
    apps[idx].status = newStatus;
    setStore(KEYS.APPLICATIONS, apps);
    initEmployerDashboard();
    alert(`Application marked as ${newStatus}.`);
  }
}

// 6. JOB DETAILS & APPLICATION VIEW
function initJobDetailsView(jobId) {
  const jobs = getStore(KEYS.JOBS, []);
  const job = jobs.find(j => j.id === jobId);
  const container = document.getElementById('jobDetailsContent');

  if (!job) {
    container.innerHTML = `<h3>Job not found.</h3>`;
    return;
  }

  container.innerHTML = `
    <span class="job-badge mb-10" style="display:inline-block;">${sanitize(job.type)}</span>
    <h1 class="mb-10">${sanitize(job.title)}</h1>
    <h3 style="color: var(--secondary-color); margin-bottom: 16px;">${sanitize(job.company)}</h3>
    <div class="job-details-meta mb-20">
      <span>📍 ${sanitize(job.location)}</span>
      <span>💰 ${sanitize(job.salary)}</span>
      <span>📅 Posted: ${new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
    </div>
    <hr style="border: 0; border-top: 1px solid var(--border-color); margin-bottom: 20px;">
    <h4 class="mb-10">Job Description</h4>
    <p class="mb-30" style="white-space: pre-line; color: var(--text-muted);">${sanitize(job.description)}</p>
    
    <div id="applyActionArea">
      <button class="btn btn-primary" onclick="submitApplication('${sanitize(job.id)}', '${sanitize(job.title)}', '${sanitize(job.company)}')">Apply For This Position</button>
    </div>
  `;
}

function submitApplication(jobId, jobTitle, company) {
  const session = getStore(KEYS.SESSION, null);
  if (!session || session.role !== 'Candidate') {
    alert('Please log in as a candidate to apply for jobs.');
    navigateTo('auth');
    return;
  }

  let apps = getStore(KEYS.APPLICATIONS, []);
  const alreadyApplied = apps.some(a => a.jobId === jobId && a.candidateEmail === session.email);
  if (alreadyApplied) {
    alert('You have already applied for this job listing.');
    return;
  }

  const newApp = {
    id: 'app-' + Date.now(),
    jobId,
    jobTitle,
    company,
    candidateName: session.name,
    candidateEmail: session.email,
    resumeName: `Resume_${session.name.replace(/\s+/g, '_')}.pdf`,
    status: 'Pending',
    appliedAt: new Date().toISOString()
  };

  apps.push(newApp);
  setStore(KEYS.APPLICATIONS, apps);
  alert('Application submitted successfully!');
  navigateTo('candidate');
}