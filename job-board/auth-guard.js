function getCareerConnectSession() {
    try {
        return JSON.parse(
            sessionStorage.getItem("careerconnect-demo-session") || "null"
        );
    } catch {
        return null;
    }
}

function requireCareerConnectLogin(requiredRole = null) {
    const session = getCareerConnectSession();

    if (!session || !session.email || !session.role) {
        window.location.replace("login.html");
        return false;
    }

    if (requiredRole && session.role !== requiredRole) {
        if (session.role === "employer") {
            window.location.replace("employer.html");
        } else {
            window.location.replace("candidate.html");
        }

        return false;
    }

    return true;
}

function redirectToCareerConnectDashboard() {
    const session = getCareerConnectSession();

    if (!session || !session.email || !session.role) {
        window.location.replace("login.html");
        return;
    }

    if (session.role === "employer") {
        window.location.replace("employer.html");
    } else {
        window.location.replace("candidate.html");
    }
}