const MAX_DIFF_LENGTH = 20000;

const diffInput = document.querySelector("#diff-input");
const characterCount = document.querySelector("#character-count");
const validateButton = document.querySelector("#validate-button");
const reviewButton = document.querySelector("#review-button");
const feedback = document.querySelector(".feedback");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");
const resultPanel = document.querySelector("#result-panel");
const reviewResult = document.querySelector("#review-result");

let isBusy = false;
let previewIsCurrent = false;

function codePointLength(value) {
  return [...value].length;
}

function updateCharacterCount() {
  const length = codePointLength(diffInput.value);
  characterCount.textContent = `${length.toLocaleString("ru-RU")} / 20 000`;
  characterCount.classList.toggle("is-over-limit", length > MAX_DIFF_LENGTH);
}

function setStatus(message, isSuccess = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-success", isSuccess);
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  setStatus("Запрос не выполнен");
}

function setBusy(busy, message = "") {
  isBusy = busy;
  validateButton.disabled = busy;
  reviewButton.disabled = busy;
  feedback.setAttribute("aria-busy", String(busy));
  if (message) {
    setStatus(message);
  }
}

function messageForError(status, isPreview) {
  if (status === 413) {
    return "Diff не должен превышать 20 000 символов";
  }
  if (status === 422) {
    return "Diff должен быть непустым текстом и содержать хотя бы один непробельный символ";
  }
  if (status === 404 && isPreview) {
    return "Предварительная проверка сейчас недоступна";
  }
  return "Не удалось выполнить запрос. Попробуйте ещё раз";
}

async function postDiff(path) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ diff: diffInput.value }),
  });

  if (!response.ok) {
    const requestError = new Error("Request failed");
    requestError.status = response.status;
    throw requestError;
  }

  return response.json();
}

async function validateDiff() {
  if (isBusy) {
    return;
  }

  clearError();
  setBusy(true, "Проверяем diff…");
  try {
    await postDiff("/api/reviews/validate");
    previewIsCurrent = true;
    setStatus("Diff прошёл предварительную проверку", true);
  } catch (error) {
    previewIsCurrent = false;
    showError(messageForError(error.status, true));
  } finally {
    setBusy(false);
  }
}

async function runReview() {
  if (isBusy) {
    return;
  }

  clearError();
  resultPanel.hidden = true;
  setBusy(true, "Запускаем ревью…");
  try {
    const result = await postDiff("/api/reviews");
    reviewResult.textContent = result.comment;
    resultPanel.hidden = false;
    setStatus("Ревью завершено", true);
  } catch (error) {
    showError(messageForError(error.status, false));
  } finally {
    setBusy(false);
  }
}

diffInput.addEventListener("input", () => {
  updateCharacterCount();
  clearError();
  if (previewIsCurrent) {
    previewIsCurrent = false;
    setStatus("Diff изменён — проверьте его снова");
  }
});

validateButton.addEventListener("click", validateDiff);
reviewButton.addEventListener("click", runReview);
updateCharacterCount();
