window.addEventListener("DOMContentLoaded", function (e) {
    const password = this.document.getElementById("password");
    const confirmPassword = this.document.getElementById("comfirmPassword");
    const form = this.document.getElementById("form");
    this.document.getElementById("form-submit").addEventListener("submit", function () {
        if (password.value !== confirmPassword.value) {
            alert("Passwords do not match");
            return false;
        }
        return fetch("http://localhost:5000/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password.value,
                token: new URLSearchParams(window.location.search).get("token"),
                id: new URLSearchParams(window.location.search).get("id")
            })
        }).then(function (res) {
            if (res.status === 200) {
                alert("Password updated successfully");
            } else {
                alert("An error occurred. Please try again");
            }
        });
    })
})