const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email")
        .value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const role = document.getElementById("login-role").value;

    const accountsKey = "careerconnect-demo-accounts";
    let accounts = [];

    try {
        accounts = JSON.parse(localStorage.getItem(accountsKey) || "[]");
        if (!Array.isArray(accounts)) accounts = [];
    } catch {
        accounts = [];
    }

    const account = accounts.find(
        item =>
            item.email === email &&
            item.password === password &&
            item.role === role
    );

    if (!account) {
        loginMessage.textContent =
            "Incorrect email, password, or account type.";
        return;
    }

    // Demo session only — not secure authentication.
    sessionStorage.setItem(
        "careerconnect-demo-session",
        JSON.stringify({
            name: account.name,
            email: account.email,
            role: account.role
        })
    );

    loginMessage.style.color = "#0f766e";
    loginMessage.textContent = "Login successful! Opening your dashboard...";

    setTimeout(() => {
        if (account.role === "employer") {
            window.location.href = "employer.html";
        } else {
            window.location.href = "candidate.html";
        }
    }, 700);
});