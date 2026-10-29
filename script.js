/*
 * 365 Letters — starter version.
 * IMPORTANT: This is a client-side demo. LocalStorage can be cleared and is not secure.
 * The first letter is available on the first visit; one additional letter unlocks each local calendar day.
 */
const TOTAL_LETTERS = 365;
const STORAGE_KEY = "365-letters-progress-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

// Edit these example messages. Replace them with your own words; no personal memories are invented.
const messages = [
  {
    title: "Я рад, что ты есть",
    text: "Я хотел, чтобы у тебя было маленькое место, куда можно заглянуть и почувствовать тепло.\n\nНе нужно сегодня ничего доказывать или быть идеальной. Просто будь собой. Ты заслуживаешь заботы, добрых слов и спокойных дней.\n\nПусть это письмо станет маленьким напоминанием: есть человек, которому хочется дарить тебе улыбки."
  },
  {
    title: "На случай трудного дня",
    text: "Если сегодня всё идёт не так, как хотелось, пожалуйста, не будь слишком строгой к себе.\n\nТы можешь устать. Можешь сделать паузу. Необязательно справляться со всем сразу. Один маленький шаг — тоже шаг.\n\nНадеюсь, это письмо добавит тебе немного спокойствия и напомнит, что ты не обязана быть сильной каждую секунду."
  },
  {
    title: "Маленькое спасибо",
    text: "Сегодня я просто хочу сказать спасибо — за моменты, которые мы разделяем, за разговоры и за возможность узнавать тебя всё лучше.\n\nЯ не хочу придумывать красивые истории вместо настоящих. Мне хочется собирать наши реальные воспоминания постепенно, вместе с тобой.\n\nПусть впереди у нас будет ещё много тёплых моментов."
  },
  {
    title: "Маленькая мечта",
    text: "Представь день, когда никуда не нужно торопиться: можно гулять, разговаривать обо всём на свете и смеяться над какой-нибудь ерундой.\n\nИногда счастье — это не что-то грандиозное, а обычный момент, который хочется запомнить.\n\nКакой маленький момент ты хотела бы однажды пережить вместе?"
  },
  {
    title: "Ты можешь гордиться собой",
    text: "На минутку остановись и вспомни, сколько всего ты уже прошла и чему научилась.\n\nДаже если сегодня кажется, что прогресса мало, это не значит, что ты стоишь на месте. Маленькие усилия тоже имеют значение.\n\nЯ желаю тебе замечать свои победы — даже самые тихие."
  },
  {
    title: "Письмо без повода",
    text: "У этого письма нет особого повода. Не праздник, не годовщина и не важная дата.\n\nПросто иногда хорошее нужно говорить не только по расписанию.\n\nНадеюсь, у тебя сегодня найдётся хотя бы одна причина улыбнуться. А если день выдался тяжёлым — пусть завтра будет чуть легче."
  },
  {
    title: "Давай сохраним момент",
    text: "Сегодняшнее маленькое задание: выбери один приятный момент дня и сохрани его — в заметке, фотографии или просто в памяти.\n\nНе обязательно, чтобы он был особенным для кого-то ещё. Достаточно, чтобы он был важен тебе.\n\nА когда захочешь, расскажи мне о нём."
  }
];

const $ = (id) => document.getElementById(id);
const envelopeButton = $("envelopeButton");
const openButton = $("openButton");
const modal = $("letterModal");
const toast = $("toast");

function localDateKey(date = new Date()) {
  // Local calendar date, not a UTC date, so the letter changes at local midnight.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function dayNumberFromStart(startDateKey, todayKey) {
  const [sy, sm, sd] = startDateKey.split("-").map(Number);
  const [ty, tm, td] = todayKey.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const today = new Date(ty, tm - 1, td);
  return Math.floor((today - start) / DAY_MS) + 1;
}
function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.startDate || !Array.isArray(parsed.opened)) return null;
    return parsed;
  } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { showToast("Не получилось сохранить прогресс в этом браузере."); }
}
let state = readState();
const todayKey = localDateKey();
if (!state) {
  state = { startDate: todayKey, opened: [], lastOpenedDate: null };
  saveState(state);
}
function currentDay() {
  return Math.min(TOTAL_LETTERS, Math.max(1, dayNumberFromStart(state.startDate, todayKey)));
}
function openedToday() { return state.lastOpenedDate === todayKey; }
function isTodayLetterOpened() { return state.opened.includes(currentDay()); }
function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
}
function updateUI() {
  const day = currentDay();
  const count = state.opened.length;
  $("todayLabel").textContent = `${formatDate()} · письмо № ${day}`;
  $("progressCount").textContent = `${count} / ${TOTAL_LETTERS}`;
  $("progressFill").style.width = `${Math.min(100, count / TOTAL_LETTERS * 100)}%`;
  $("progressLabel").textContent = count === 0 ? "Путь только начинается" : count === TOTAL_LETTERS ? "Целый год тёплых слов" : "Каждое письмо — маленький момент";
  if (openedToday() || isTodayLetterOpened()) {
    openButton.disabled = true;
    openButton.innerHTML = "Письмо уже открыто сегодня ✓";
    $("tapHint").textContent = "Ты уже прочитала сегодняшнее письмо";
    $("lockNote").textContent = day >= TOTAL_LETTERS ? "Все 365 писем пройдены. Спасибо за этот год. ❤️" : "Следующий конверт откроется завтра. Береги это чувство. ❤️";
    envelopeButton.classList.add("opened");
    envelopeButton.setAttribute("aria-label", "Сегодняшнее письмо уже открыто");
  } else {
    openButton.disabled = false;
    openButton.innerHTML = "Открыть письмо <span>↗</span>";
    $("tapHint").textContent = "Нажми на конверт, чтобы открыть письмо";
    $("lockNote").textContent = "Следующее письмо будет ждать тебя завтра. ❤️";
    envelopeButton.classList.remove("opened");
    envelopeButton.setAttribute("aria-label", "Открыть сегодняшнее письмо");
  }
}
function messageForDay(day) {
  if (day <= messages.length) return messages[day - 1];
  // Reusable template for days not yet personalized; replace this with your own 365 entries.
  const prompts = [
    ["Сегодня — новый маленький шанс", "Пусть сегодня найдётся что-то хорошее, даже если это будет совсем маленькая вещь.\n\nНе торопи себя и не сравнивай свой путь с чужим. Ты имеешь право идти в своём темпе.\n\nЭто письмо — маленькое пожелание спокойствия, тепла и хорошего дня."],
    ["Я желаю тебе улыбки", "Пусть сегодня случится хотя бы одна вещь, которая заставит тебя улыбнуться.\n\nЕсли захочешь, расскажи мне, что это было. Мне интересно узнавать твой мир — не по придуманным историям, а по-настоящему.\n\nОбнимаю мысленно и желаю тебе мягкого, доброго дня."],
    ["Не забывай отдыхать", "Напоминание на сегодня: отдых — не награда, которую нужно заслужить. Это обычная часть жизни.\n\nСделай паузу, выпей воды, послушай любимую песню или просто побудь в тишине.\n\nПусть у тебя будет немного времени только для себя."]
  ];
  return prompts[(day - messages.length - 1) % prompts.length];
}
function openLetter() {
  if (openedToday() || isTodayLetterOpened()) {
    showToast("Одно письмо в день ❤️ Следующее будет ждать завтра.");
    return;
  }
  envelopeButton.classList.add("opening");
  const day = currentDay();
  const message = messageForDay(day);
  window.setTimeout(() => {
    $("modalDay").textContent = `ПИСЬМО № ${day} · ${formatDate()}`;
    $("letterTitle").textContent = message.title;
    $("letterContent").textContent = message.text;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // Mark opened only after the letter is shown.
    state.opened = [...new Set([...state.opened, day])].sort((a, b) => a - b);
    state.lastOpenedDate = todayKey;
    saveState(state);
    updateUI();
  }, 420);
}
function closeLetter() {
  modal.hidden = true;
  document.body.style.overflow = "";
  envelopeButton.classList.remove("opening");
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}
envelopeButton.addEventListener("click", openLetter);
openButton.addEventListener("click", openLetter);
$("closeModal").addEventListener("click", closeLetter);
$("doneButton").addEventListener("click", () => {
  closeLetter();
  showToast("Письмо сохранено в твоих воспоминаниях ♡");
});
modal.addEventListener("click", (event) => { if (event.target === modal) closeLetter(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeLetter(); });
updateUI();
