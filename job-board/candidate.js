const applicationsKey = "careerconnect-applications";

const applicationList = document.getElementById("application-list");
const applicationCount = document.getElementById("application-count");

function displayApplications() {
    let applications = [];

    try {
        const saved = JSON.parse(
            localStorage.getItem(applicationsKey) || "[]"
        );

        applications = Array.isArray(saved) ? saved : [];
    } catch {
        applications = [];
    }

    applicationCount.textContent =
        `${applications.length} application(s) submitted`;

    applicationList.replaceChildren();

    if (applications.length === 0) {
        applicationList.textContent =
            "You haven't applied for any jobs yet. Browse jobs to get started.";
        return;
    }

    applications.forEach((application) => {
        const card = document.createElement("article");
        card.className = "dashboard-card";

        const title = document.createElement("h3");
        title.textContent = application.jobTitle || "Job title unavailable";

        const company = document.createElement("p");
        company.textContent =
            "Company: " + (application.company || "Not specified");

        const status = document.createElement("p");
        status.textContent =
            "Status: " + (application.status || "Pending");

        const date = document.createElement("p");
        date.textContent =
            "Applied on: " + (application.appliedAt || "Date unavailable");

        card.append(title, company, status, date);
        applicationList.appendChild(card);
    });
}

displayApplications();
