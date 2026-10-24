
const STORAGE_KEY = "careerconnect-employer-jobs";

const jobForm = document.getElementById("job-form");
const formMessage = document.getElementById("form-message");
const postedJobs = document.getElementById("posted-jobs");

function getPostedJobs() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function showPostedJobs() {
    postedJobs.replaceChildren();

    const jobs = getPostedJobs();

    if (jobs.length === 0) {
        const message = document.createElement("p");
        message.textContent = "You have not posted any jobs yet.";
        postedJobs.appendChild(message);
        return;
    }

    jobs.forEach((job) => {
        const card = document.createElement("article");
        card.className = "job-card";

        const title = document.createElement("h3");
        title.textContent = job.title;

        const company = document.createElement("p");
        company.textContent = `Company: ${job.company}`;

        const location = document.createElement("p");
        location.textContent = `Location: ${job.location}`;

        const type = document.createElement("p");
        type.textContent = `Job type: ${job.type}`;

        card.append(title, company, location, type);
        postedJobs.appendChild(card);
    });
}

jobForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newJob = {
        id: `employer-${Date.now()}`,
        title: document.getElementById("title").value.trim(),
        company: document.getElementById("company").value.trim(),
        location: document.getElementById("location").value.trim(),
        type: document.getElementById("type").value,
        description: document.getElementById("description").value.trim()
    };

    if (
        !newJob.title ||
        !newJob.company ||
        !newJob.location ||
        !newJob.type ||
        !newJob.description
    ) {
        formMessage.textContent = "Please complete every field.";
        return;
    }

    try {
        const jobs = getPostedJobs();
        jobs.unshift(newJob);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));

        formMessage.textContent = "Job saved in this browser!";
        jobForm.reset();
        showPostedJobs();
    } catch {
        formMessage.textContent =
            "Could not save this job. Check your browser storage settings.";
    }
});

showPostedJobs();
