const userPrompt = document.getElementById("userPrompt");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const result = document.getElementById("result");
const formulaText = document.getElementById("formulaText");
const explanationText = document.getElementById("explanationText");
const exampleText = document.getElementById("exampleText");
const tipsList = document.getElementById("tipsList");
const copyBtn = document.getElementById("copyBtn");
const exampleItems = document.querySelectorAll(".example-item");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function showResult(data) {
  formulaText.textContent = data.formula || "";
  explanationText.textContent = data.explanation || "";
  exampleText.textContent = data.example || "";

  tipsList.innerHTML = "";
  if (Array.isArray(data.tips)) {
    data.tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      tipsList.appendChild(li);
    });
  }

  result.classList.remove("hidden");
}

function clearAll() {
  userPrompt.value = "";
  hideError();
  result.classList.add("hidden");
  formulaText.textContent = "";
  explanationText.textContent = "";
  exampleText.textContent = "";
  tipsList.innerHTML = "";
}

generateBtn.addEventListener("click", async () => {
  const prompt = userPrompt.value.trim();

  hideError();
  result.classList.add("hidden");

  if (!prompt) {
    showError("יש לכתוב בקשה לפני יצירת נוסחה.");
    return;
  }

  showLoading();

  try {
    const response = await fetch("/api/generate-formula", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "אירעה שגיאה.");
      return;
    }

    showResult(data);
  } catch (error) {
    showError("לא ניתן להתחבר לשרת.");
  } finally {
    hideLoading();
  }
});

clearBtn.addEventListener("click", clearAll);

copyBtn.addEventListener("click", async () => {
  const text = formulaText.textContent.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "הועתק";
    setTimeout(() => {
      copyBtn.textContent = "העתק";
    }, 1500);
  } catch (error) {
    alert("לא ניתן להעתיק כרגע.");
  }
});

exampleItems.forEach((item) => {
  item.addEventListener("click", () => {
    userPrompt.value = item.textContent.trim();
    userPrompt.focus();
  });
});
