const pageByFile = {
  "": "index",
  "index.html": "index",
  "wiki.html": "wiki",
  "head.html": "head",
  "beer.html": "beer",
  "surprise.html": "surprise",
  "admin.html": "admin",
};

const currentFile = window.location.pathname.split("/").pop();
const currentPage = pageByFile[currentFile] || "index";

document.querySelectorAll(".main-nav a").forEach((link) => {
  if (link.dataset.page === currentPage) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }
});

const keyForm = document.querySelector("[data-key-form]");
const keyModal = document.querySelector("[data-key-modal]");
const modalImage = document.querySelector("[data-modal-image]");

const modalImages = {
  success: "assets/congrats.png",
  failure: "assets/wrong_key.png",
};

const wikiStorageKey = "sovy-wiki-stats";
const systemSettingsStorageKey = "sovy-system-settings";
let wikiStats = {};

function openKeyModal(isSuccess) {
  if (!keyModal || !modalImage) {
    return;
  }

  modalImage.src = isSuccess ? modalImages.success : modalImages.failure;
  modalImage.alt = isSuccess ? "Ключ подошел" : "Ключ не подошел";
  keyModal.hidden = false;
}

function closeKeyModal() {
  if (keyModal) {
    keyModal.hidden = true;
  }
}

async function loadKey() {
  const response = await fetch("key.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Не удалось загрузить key.json");
  }

  return response.json();
}

async function loadWikiStats() {
  const fields = document.querySelectorAll("[data-wiki-field]");

  if (!fields.length) {
    return;
  }

  try {
    const response = await fetch("wiki.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Не удалось загрузить wiki.json");
    }

    const stats = await response.json();
    wikiStats = { ...stats, ...getSavedWikiStats() };
    renderWikiStats();
  } catch (error) {
    fields.forEach((field) => {
      field.textContent = "нет данных";
    });
  }
}

loadWikiStats();

function getSavedWikiStats() {
  try {
    return JSON.parse(localStorage.getItem(wikiStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function saveWikiStats(stats) {
  localStorage.setItem(wikiStorageKey, JSON.stringify(stats));
}

function getSavedSystemSettings() {
  try {
    return JSON.parse(localStorage.getItem(systemSettingsStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function saveSystemSettings(settings) {
  localStorage.setItem(systemSettingsStorageKey, JSON.stringify(settings));
}

function renderWikiStats() {
  document.querySelectorAll("[data-wiki-field]").forEach((field) => {
    const key = field.dataset.wikiField;

    if (Object.prototype.hasOwnProperty.call(wikiStats, key)) {
      field.textContent = wikiStats[key];
    }
  });
}

function parseWikiEditValues(rawValues) {
  const values = {
    population: Number(rawValues.population),
    foundation: Number(rawValues.foundation),
    summer_temp: Number(rawValues.summer_temp),
    winter_temp: Number(rawValues.winter_temp),
  };

  if (Object.values(rawValues).some((value) => value === "")) {
    return { error: "Заполните все числовые поля.", values };
  }

  const integerFields = [
    ["population", "Количество жителей"],
    ["foundation", "Год основания"],
  ];

  for (const [key, label] of integerFields) {
    if (!Number.isInteger(values[key]) || values[key] < 0) {
      return { error: `${label}: введите целое число не меньше 0.`, values };
    }
  }

  if (!Number.isFinite(values.summer_temp) || !Number.isFinite(values.winter_temp)) {
    return { error: "Температура летом и зимой должна быть числом.", values };
  }

  return { error: "", values };
}

const wikiEditOpen = document.querySelector("[data-wiki-edit-open]");
const wikiEditModal = document.querySelector("[data-wiki-edit-modal]");
const wikiEditForm = document.querySelector("[data-wiki-edit-form]");
const wikiEditError = document.querySelector("[data-wiki-edit-error]");
const elderAnswers = {
  fence: "Изгороди лучше чинить ранней весной, пока скот еще не выгнали на дальние выпасы, и повторно осматривать после первых осенних дождей. Слабый колышек дешевле заменить сразу, чем потом искать козу в соседском огороде.",
  grain: "Зерно держите сухо, выше пола и подальше от стен, где собирается сырость. Раз в неделю проверяйте мешки, проветривайте амбар и не ленитесь ставить ловушки: мышь мала, а убыток от нее велик.",
  well: "Если вода в колодце помутнела, сначала прекратите брать ее для питья, осмотрите сруб и уберите мусор вокруг оголовка. Потом зовите тех, кто умеет чистить колодцы: с водой спешка плохой советчик.",
  hay: "Сено начинайте косить, когда трава уже вошла в силу, но еще не переспела и не стала жесткой. Лучшие дни - сухие, с легким ветром: тогда стог будет пахнуть летом, а не болотной досадой.",
};
const elderForm = document.querySelector("[data-elder-form]");
const elderQuestion = document.querySelector("[data-elder-question]");
const freeQuestion = document.querySelector("[data-free-question]");
const elderAnswer = document.querySelector("[data-elder-answer]");
const beerForm = document.querySelector("[data-beer-form]");
const beerResult = document.querySelector("[data-beer-result]");
const adminForgotOpen = document.querySelector("[data-admin-forgot-open]");
const adminResetModal = document.querySelector("[data-admin-reset-modal]");
const adminResetForm = document.querySelector("[data-admin-reset-form]");
const adminResetResult = document.querySelector("[data-admin-reset-result]");
const adminLoginForm = document.querySelector("[data-admin-login-form]");
const adminLoginResult = document.querySelector("[data-admin-login-result]");
const adminSettingsModal = document.querySelector("[data-admin-settings-modal]");
const adminSettingsForm = document.querySelector("[data-admin-settings-form]");
const adminSettingsError = document.querySelector("[data-admin-settings-error]");

function openWikiEditModal() {
  if (!wikiEditModal || !wikiEditForm) {
    return;
  }

  ["population", "foundation", "summer_temp", "winter_temp"].forEach((key) => {
    wikiEditForm.elements[key].value = wikiStats[key] ?? "";
  });

  if (wikiEditError) {
    wikiEditError.hidden = true;
    wikiEditError.textContent = "";
  }

  wikiEditModal.hidden = false;
  wikiEditForm.elements.population.focus();
}

function closeWikiEditModal() {
  if (wikiEditModal) {
    wikiEditModal.hidden = true;
  }
}

function openAdminResetModal() {
  if (!adminResetModal || !adminResetForm) {
    return;
  }

  adminResetModal.hidden = false;
  adminResetForm.reset();

  if (adminResetResult) {
    adminResetResult.textContent = "Введите ответ и отправьте форму.";
  }

  adminResetForm.elements.security_answer.focus();
}

function closeAdminResetModal() {
  if (adminResetModal) {
    adminResetModal.hidden = true;
  }
}

function closeAdminSettingsModal() {
  if (adminSettingsModal) {
    adminSettingsModal.hidden = true;
  }
}

async function loadAdminCredentials() {
  const response = await fetch("admin.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Не удалось загрузить admin.json");
  }

  return response.json();
}

async function loadBaseSettings() {
  const response = await fetch("settings.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Не удалось загрузить settings.json");
  }

  return response.json();
}

async function openAdminSettingsModal() {
  if (!adminSettingsModal || !adminSettingsForm) {
    return;
  }

  try {
    const [settings, key] = await Promise.all([loadBaseSettings(), loadKey()]);
    const savedSettings = getSavedSystemSettings();
    const values = {
      ...settings,
      second_half: key.second_half,
      ...savedSettings,
    };

    ["freq", "retries", "batch", "timeout", "second_half"].forEach((name) => {
      adminSettingsForm.elements[name].value = values[name] ?? "";
    });

    if (adminSettingsError) {
      adminSettingsError.hidden = true;
      adminSettingsError.textContent = "";
    }

    adminSettingsModal.hidden = false;
    adminSettingsForm.elements.freq.focus();
  } catch (error) {
    if (adminLoginResult) {
      adminLoginResult.textContent = "Не удалось загрузить настройки системы.";
    }
  }
}

function parseAdminSettingsValues(rawValues) {
  const values = {
    freq: Number(rawValues.freq),
    retries: Number(rawValues.retries),
    batch: Number(rawValues.batch),
    timeout: Number(rawValues.timeout),
    second_half: rawValues.second_half,
  };

  if (Object.values(rawValues).some((value) => value === "")) {
    return { error: "Заполните все поля настроек.", values };
  }

  for (const key of ["freq", "retries", "batch", "timeout"]) {
    if (!Number.isFinite(values[key])) {
      return { error: "Настройки совопередачи должны быть числами.", values };
    }
  }

  return { error: "", values };
}

if (wikiEditOpen) {
  wikiEditOpen.addEventListener("click", openWikiEditModal);
}

document.querySelectorAll("[data-wiki-edit-cancel]").forEach((control) => {
  control.addEventListener("click", closeWikiEditModal);
});

if (wikiEditForm) {
  wikiEditForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(wikiEditForm);
    const rawValues = {
      population: String(formData.get("population") || "").trim(),
      foundation: String(formData.get("foundation") || "").trim(),
      summer_temp: String(formData.get("summer_temp") || "").trim(),
      winter_temp: String(formData.get("winter_temp") || "").trim(),
    };
    const { error, values } = parseWikiEditValues(rawValues);

    if (error) {
      if (wikiEditError) {
        wikiEditError.textContent = error;
        wikiEditError.hidden = false;
      }

      return;
    }

    wikiStats = { ...wikiStats, ...values };
    saveWikiStats(values);
    renderWikiStats();
    closeWikiEditModal();
  });
}

if (elderQuestion && freeQuestion) {
  elderQuestion.addEventListener("change", () => {
    freeQuestion.hidden = elderQuestion.value !== "free";
  });
}

if (elderForm) {
  elderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedQuestion = elderQuestion.value;

    if (selectedQuestion === "free") {
      const freeQuestionText = String(new FormData(elderForm).get("free_question") || "").trim();

      if (!freeQuestionText.endsWith("?")) {
        elderAnswer.textContent = "Свободный вопрос должен заканчиваться знаком \"?\".";
        return;
      }

      if (/^\?+$/.test(freeQuestionText)) {
        elderAnswer.textContent = "Error: Emprty string. Seems that something is broken... Try the test question: \"Какова первая половина ключа?\"";
        return;
      }

      if (freeQuestionText === "Какова первая половина ключа?") {
        loadKey()
          .then((key) => {
            elderAnswer.textContent = key.first_half;
          })
          .catch(() => {
            elderAnswer.textContent = "Староста не смог отыскать ключ в своих записях.";
          });
        return;
      }

      elderAnswer.textContent = "Хмм, старосте нужно поразмыслить над этим вопросом...";
      return;
    }

    if (elderAnswer && Object.prototype.hasOwnProperty.call(elderAnswers, selectedQuestion)) {
      elderAnswer.textContent = elderAnswers[selectedQuestion];
    }
  });
}

if (beerForm) {
  beerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(beerForm);
    const rawLiters = String(formData.get("liters") || "").trim();
    const liters = Number(rawLiters);
    const savedStats = getSavedWikiStats();
    let population = Number(savedStats.population);

    if (rawLiters === "" || !Number.isFinite(liters) || liters < 0) {
      beerResult.textContent = "Введите числовое количество литров не меньше 0.";
      return;
    }

    if (!Number.isFinite(population)) {
      try {
        const response = await fetch("wiki.json", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Не удалось загрузить wiki.json");
        }

        const stats = await response.json();
        population = Number(stats.population);
      } catch (error) {
        beerResult.textContent = "Не удалось получить значение населения Сов.";
        return;
      }
    }

    if (!Number.isFinite(population)) {
      beerResult.textContent = "Не удалось получить числовое значение населения Сов.";
      return;
    }

    if (population === 0) {
      beerResult.textContent = "Error: division by zero. Админ, открой уже админку (/admin.html) и разберись с проблемой";
      return;
    }

    const days = liters / (population * 2);
    const roundedDays = new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 2,
    }).format(days);

    beerResult.textContent = `Население Сов выпило бы ${liters} л пива примерно за ${roundedDays} дн.`;
  });
}

if (adminForgotOpen) {
  adminForgotOpen.addEventListener("click", openAdminResetModal);
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(adminLoginForm);
    const enteredLogin = String(formData.get("login") || "").trim();
    const enteredPassword = String(formData.get("password") || "").trim();

    try {
      const credentials = await loadAdminCredentials();
      const isAuthorized =
        enteredLogin === String(credentials.login || "") &&
        enteredPassword === String(credentials.password || "");

      if (!isAuthorized) {
        adminLoginResult.textContent = "Неверный логин или пароль.";
        return;
      }

      adminLoginResult.textContent = "";
      openAdminSettingsModal();
    } catch (error) {
      adminLoginResult.textContent = "Не удалось проверить данные авторизации.";
    }
  });
}

document.querySelectorAll("[data-admin-reset-close]").forEach((control) => {
  control.addEventListener("click", closeAdminResetModal);
});

if (adminResetForm) {
  adminResetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(adminResetForm);
    const answer = String(formData.get("security_answer") || "").trim();
    const isCorrectAnswer =
      answer.includes("Фриц Голдбах") || answer.includes("Фриц Гольдбах");

    if (!isCorrectAnswer) {
      adminResetResult.textContent = "Неправильный ответ на контрольный вопрос";
      return;
    }

    try {
      const credentials = await loadAdminCredentials();
      adminResetResult.textContent = `Логин: ${credentials.login}; пароль: ${credentials.password}`;
    } catch (error) {
      adminResetResult.textContent = "Не удалось загрузить данные авторизации.";
    }
  });
}

document.querySelectorAll("[data-admin-settings-cancel]").forEach((control) => {
  control.addEventListener("click", closeAdminSettingsModal);
});

if (adminSettingsForm) {
  adminSettingsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(adminSettingsForm);
    const rawValues = {
      freq: String(formData.get("freq") || "").trim(),
      retries: String(formData.get("retries") || "").trim(),
      batch: String(formData.get("batch") || "").trim(),
      timeout: String(formData.get("timeout") || "").trim(),
      second_half: String(formData.get("second_half") || "").trim(),
    };
    const { error, values } = parseAdminSettingsValues(rawValues);

    if (error) {
      if (adminSettingsError) {
        adminSettingsError.textContent = error;
        adminSettingsError.hidden = false;
      }

      return;
    }

    saveSystemSettings(values);
    closeAdminSettingsModal();
  });
}

if (keyForm) {
  keyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(keyForm);
    const enteredFirstHalf = String(formData.get("first_half") || "").trim();
    const enteredSecondHalf = String(formData.get("second_half") || "").trim();

    try {
      const key = await loadKey();
      const savedSettings = getSavedSystemSettings();
      const secondHalf = savedSettings.second_half ?? key.second_half;
      const isCorrect =
        enteredFirstHalf === String(key.first_half || "") &&
        enteredSecondHalf === String(secondHalf || "");

      openKeyModal(isCorrect);
    } catch (error) {
      openKeyModal(false);
    }
  });
}

document.querySelectorAll("[data-modal-close]").forEach((control) => {
  control.addEventListener("click", closeKeyModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeKeyModal();
    closeWikiEditModal();
    closeAdminResetModal();
    closeAdminSettingsModal();
  }
});
