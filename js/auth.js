const USERS_KEY = "glass_auth_users";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(?:\+98|0)?9\d{9}$/;

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const tabIndicator = document.getElementById("tabIndicator");
const forgotModal = document.getElementById("forgotModal");
const forgotForm = document.getElementById("forgotForm");
const toast = document.getElementById("toast");
const authCard = document.getElementById("authCard");
const successView = document.getElementById("successView");

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeIdentifier(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function isValidIdentifier(value) {
  return emailRegex.test(value) || phoneRegex.test(value.replace(/[\s-]/g, ""));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function setError(input, message) {
  const wrap = input.closest("div");
  const error = wrap?.querySelector("[data-error]");
  if (error) error.textContent = message || "";
  input.classList.toggle("border-rose-400", Boolean(message));
}

function clearFormErrors(form) {
  form.querySelectorAll("[data-error]").forEach((el) => {
    el.textContent = "";
  });
}

function switchTab(mode) {
  const isLogin = mode === "login";
  loginForm.classList.toggle("active", isLogin);
  signupForm.classList.toggle("active", !isLogin);
  tabLogin.classList.toggle("text-white/70", !isLogin);
  tabSignup.classList.toggle("text-white/70", isLogin);
  tabIndicator.style.transform = isLogin ? "translateX(0)" : "translateX(-100%)";
}

function showSuccess(name) {
  authCard.style.display = "none";
  successView.classList.add("show");
  document.getElementById("welcomeTitle").textContent = "ورود موفق";
  document.getElementById("welcomeText").textContent = name
    ? `${name} عزیز، به پنل خود خوش آمدید.`
    : "به پنل خود خوش آمدید.";
}

tabLogin.addEventListener("click", () => switchTab("login"));
tabSignup.addEventListener("click", () => switchTab("signup"));

document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    button.querySelector(".icon-eye").classList.toggle("hidden", hidden);
    button.querySelector(".icon-eye-off").classList.toggle("hidden", !hidden);
    button.setAttribute("aria-label", hidden ? "پنهان کردن رمز عبور" : "نمایش رمز عبور");
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFormErrors(loginForm);

  const identifierInput = document.getElementById("loginIdentifier");
  const passwordInput = document.getElementById("loginPassword");
  const identifier = normalizeIdentifier(identifierInput.value);
  const password = passwordInput.value;
  let valid = true;

  if (!isValidIdentifier(identifier)) {
    setError(identifierInput, "ایمیل یا شماره تلفن معتبر وارد کنید.");
    valid = false;
  }
  if (password.length < 8) {
    setError(passwordInput, "رمز عبور حداقل ۸ کاراکتر است.");
    valid = false;
  }
  if (!valid) return;

  const user = getUsers().find((item) => item.identifier === identifier);
  if (!user || user.password !== password) {
    showToast("اطلاعات ورود نادرست است. اگر حساب ندارید ثبت‌نام کنید.");
    return;
  }

  showSuccess(user.name);
  showToast("با موفقیت وارد شدید.");
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFormErrors(signupForm);

  const nameInput = document.getElementById("signupName");
  const identifierInput = document.getElementById("signupIdentifier");
  const passwordInput = document.getElementById("signupPassword");
  const confirmInput = document.getElementById("signupConfirm");

  const name = nameInput.value.trim();
  const identifier = normalizeIdentifier(identifierInput.value);
  const password = passwordInput.value;
  const confirm = confirmInput.value;
  let valid = true;

  if (name.length < 2) {
    setError(nameInput, "نام را کامل وارد کنید.");
    valid = false;
  }
  if (!isValidIdentifier(identifier)) {
    setError(identifierInput, "ایمیل یا شماره تلفن معتبر وارد کنید.");
    valid = false;
  }
  if (password.length < 8) {
    setError(passwordInput, "رمز عبور حداقل ۸ کاراکتر باشد.");
    valid = false;
  }
  if (password !== confirm) {
    setError(confirmInput, "تکرار رمز عبور مطابقت ندارد.");
    valid = false;
  }
  if (!valid) return;

  const users = getUsers();
  if (users.some((item) => item.identifier === identifier)) {
    showToast("این ایمیل یا شماره قبلاً ثبت شده است. وارد شوید.");
    switchTab("login");
    document.getElementById("loginIdentifier").value = identifierInput.value;
    return;
  }

  users.push({ name, identifier, password });
  saveUsers(users);
  showSuccess(name);
  showToast("حساب شما ساخته شد و وارد شدید.");
});

document.getElementById("forgotOpen").addEventListener("click", () => {
  forgotModal.classList.add("open");
  document.getElementById("forgotIdentifier").value = document.getElementById("loginIdentifier").value;
});

document.getElementById("forgotClose").addEventListener("click", () => {
  forgotModal.classList.remove("open");
});

forgotModal.addEventListener("click", (event) => {
  if (event.target === forgotModal) forgotModal.classList.remove("open");
});

forgotForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("forgotIdentifier");
  const identifier = normalizeIdentifier(input.value);
  if (!isValidIdentifier(identifier)) {
    setError(input, "ایمیل یا شماره تلفن معتبر وارد کنید.");
    return;
  }
  setError(input, "");
  forgotModal.classList.remove("open");
  showToast("اگر حسابی با این مشخصات وجود داشته باشد، لینک بازیابی ارسال می‌شود.");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  successView.classList.remove("show");
  authCard.style.display = "block";
  loginForm.reset();
  signupForm.reset();
  switchTab("login");
  showToast("از حساب خارج شدید.");
});

switchTab("login");
