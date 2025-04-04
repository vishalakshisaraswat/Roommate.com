document.addEventListener("DOMContentLoaded", async () => {
    await checkSession(); // Check session on page load
});

// ✅ Function to Check User Session & Redirect Accordingly
async function checkSession() {
    try {
        const response = await fetch("/user/session", {
            method: "GET",
            credentials: "include", // Ensure cookies are sent
        });

        const data = await response.json();

        if (response.ok && data.loggedIn) {
            console.log(`User is logged in as ${data.userId}`);
            updateUIForLoggedInUser(data.userId);
            handleRedirectFlow(data.userId); // Decide redirection based on session
        } else {
            console.log("User is not logged in.");
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error("Session Check Error:", error);
        updateUIForLoggedOutUser();
    }
}

// ✅ Redirect Flow Based on User Progress
async function handleRedirectFlow(userId) {
    const currentPage = window.location.pathname;

    if (currentPage === "/success.html") {
        window.location.href = "/profile.html"; // Move to profile setup
    } 
    else if (currentPage === "/profile.html") {
        const hasRoom = await checkIfUserHasRoom(userId);
        window.location.href = hasRoom ? "/room.html" : "/quessionaire.html"; // Check room status
    } 
    else if (currentPage === "/room.html") {
        window.location.href = "/ques-withRoom.html"; // Move to next step
    } 
    else if (currentPage === "/ques-withRoom.html" || currentPage === "/quessionaire.html") {
        window.location.href = "/responses.html"; // Final step
    }
}

// ✅ Check if User Has a Room (Mock API Call)
async function checkIfUserHasRoom(userId) {
    try {
        const response = await fetch(`/user/roomStatus?userId=${userId}`);
        const data = await response.json();
        return data.hasRoom; // true if user has a room, false otherwise
    } catch (error) {
        console.error("Room Check Error:", error);
        return false;
    }
}

// ✅ Function to Handle Logout
async function logoutUser() {
    try {
        const response = await fetch("/user/logout", {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            alert("Logged out successfully!");
            window.location.href = "/login.html"; // Redirect to login page
        } else {
            alert("Error logging out.");
        }
    } catch (error) {
        console.error("Logout Error:", error);
        alert("Error logging out.");
    }
}

// ✅ UI Updates for Login/Logout
function updateUIForLoggedInUser(userId) {
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("userInfo");

    if (logoutBtn) logoutBtn.style.display = "block";
    if (userInfo) userInfo.innerText = `Logged in as: ${userId}`;
}

function updateUIForLoggedOutUser() {
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("userInfo");

    if (logoutBtn) logoutBtn.style.display = "none";
    if (userInfo) userInfo.innerText = "";
}
