const f = document.getElementById("loginForm");
const user = document.getElementById("user");
const pass = document.getElementById("pass");
const err = document.getElementById("err");

f.addEventListener("submit", async (e) => {
  e.preventDefault();
  err.textContent = "";
  try {
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.value.trim(), password: pass.value }),
    });
    if (!r.ok) throw new Error("Invalid credentials");
    location.href = "/";
  } catch {
    err.textContent = "Invalid user or password";
  }
});

const showCreate = document.getElementById("showCreate");
const cForm = document.getElementById("createForm");
const cName = document.getElementById("c_name");
const cUser = document.getElementById("c_username");
const cPw = document.getElementById("c_password");
const cInit = document.getElementById("c_initials");
const cColor = document.getElementById("c_color");
const cErr = document.getElementById("c_err");

showCreate.addEventListener("click", () => {
  cForm.classList.toggle("hidden");
  if (!cForm.classList.contains("hidden")) cName.focus();
});

cForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  cErr.textContent = "";
  const payload = {
    username: cUser.value.trim(),
    password: cPw.value,
    name: cName.value.trim(),
    color: cColor.value,
    initials: cInit.value.trim() || undefined,
  };
  if (!payload.username || !payload.password || !payload.name || !payload.color) {
    cErr.textContent = "Complete the form.";
    return;
  }
  try {
    const r = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.status === 409) {
      cErr.textContent = "Name, username, initials or color have already been used.";
      return;
    }
    if (!r.ok) throw new Error();
    const r2 = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: payload.username, password: payload.password }),
    });
    if (!r2.ok) {
      cErr.textContent = "User created but login failed.";
      return;
    }
    location.href = "/";
  } catch {
    cErr.textContent = "Failed to create user.";
  }
});
