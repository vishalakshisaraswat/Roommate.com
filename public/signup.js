document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const email = e.target.email.value;
    const password = e.target.password.value;
  
    const res = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/success.html";
    } else {
      alert(data.message);
    }
  });
  