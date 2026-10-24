const signupForm = document.getElementById("signup-form");
const signupMessage = document.getElementById("signup-message");

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email")
        .value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const role = document.getElementById("signup-role").value;

    if (!name || !email || password.length < 8) {
        signupMessage.textContent =
            "Please enter your name, valid email, and password of at least 8 characters.";
        return;
    }

    const accountsKey = "careerconnect-demo-accounts";
    let accounts = [];

    try {
        accounts = JSON.parse(
            localStorage.getItem(accountsKey) || "[]"
        );

        if (!Array.isArray(accounts)) {
            accounts = [];
        }
    } catch {
        accounts = [];
    }

    const existingAccount = accounts.some(
        account => account.email === email
    );

    if (existingAccount) {
        signupMessage.style.color = "#b91c1c";
        signupMessage.textContent =
            "This email is already registered. Please log in.";
        return;
    }

    // Demo only: passwords are stored insecurely.
    // Use test credentials only until a secure backend is added.
    accounts.push({
        name: name,
        email: email,
        password: password,
        role: role
    });

    try {
        localStorage.setItem(
            accountsKey,
            JSON.stringify(accounts)
        );

        signupMessage.style.color = "#0f766e";
        signupMessage.textContent =
            "Account created successfully! Redirecting to login...";

        signupForm.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1000);

    } catch (error) {
        signupMessage.style.color = "#b91c1c";
        signupMessage.textContent =
            "Could not save the account. Please try again.";
    }
});