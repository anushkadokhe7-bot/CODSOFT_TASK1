
const jobs = [
    {
        id: "frontend",
        title: "Frontend Developer Intern",
        company: "BrightTech",
        location: "Remote",
        type: "Internship",
        description:
            "Build user-friendly websites using HTML, CSS and JavaScript."
    },
    {
        id: "python",
        title: "Junior Python Developer",
        company: "CodeWorks",
        location: "Pune, India",
        type: "Full-time",
        description:
            "Help develop applications, write Python code and work with a development team."
    },
    {
        id: "design",
        title: "UI/UX Design Intern",
        company: "Creative Labs",
        location: "Mumbai, India",
        type: "Internship",
        description:
            "Assist with interface design, wireframes and improving user experiences."
    }
];
const STORAGE_KEY = "careerconnect-employer-jobs";

function getEmployerJobs() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

const allJobs = [...jobs, ...getEmployerJobs()];
const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");
const job = allJobs.find((item) => item.id === jobId);

const title = document.getElementById("job-title");
const company = document.getElementById("job-company");
const locationText = document.getElementById("job-location");
const type = document.getElementById("job-type");
const description = document.getElementById("job-description");
const form = document.getElementById("application-form");
const message = document.getElementById("application-message");

if (!job) {
    title.textContent = "Job not found";
    company.textContent = "Return to the home page and select a listed job.";
    form.hidden = true;
} else {
    title.textContent = job.title;
    company.textContent = `Company: ${job.company}`;
    locationText.textContent = `Location: ${job.location}`;
    type.textContent = `Job type: ${job.type}`;
    description.textContent = job.description;
    document.title = `${job.title} | CareerConnect`;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!job) return;

    const resume = document.getElementById("candidate-resume").files[0];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = resume.name.toLowerCase();
    const validExtension = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
    );

    if (!validExtension) {
        message.textContent = "Please select a PDF, DOC or DOCX resume.";
        return;
    }

    if (resume.size > 5 * 1024 * 1024) {
        message.textContent = "Your resume must be 5 MB or smaller.";
        return;
    }

   const applicationsKey = "careerconnect-applications";

const application = {
    id: Date.now(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    candidateName: document.getElementById("candidate-name").value.trim(),
    candidateEmail: document.getElementById("candidate-email").value.trim(),
    resumeName: resume.name,
    status: "Pending",
    appliedAt: new Date().toLocaleDateString()
};

try {
    const savedApplications = JSON.parse(
        localStorage.getItem(applicationsKey) || "[]"
    );

    savedApplications.push(application);

    localStorage.setItem(
        applicationsKey,
        JSON.stringify(savedApplications)
    );

    message.textContent =
        "Application submitted successfully! Your application status is Pending.";

    form.reset();
    } catch {
    message.textContent =
        "Could not save your application. Please try again.";
    }
});
