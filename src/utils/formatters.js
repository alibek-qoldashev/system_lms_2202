// "1400" -> "14:00" ko'rinishida, faqat raqamlar, soat 00-23, minut 00-59
export function formatTimeDigits(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  let hh = digits.slice(0, 2);
  let mm = digits.slice(2, 4);

  if (parseInt(hh, 10) > 23) hh = "23";
  if (mm.length === 2 && parseInt(mm, 10) > 59) mm = "59";

  return `${hh}:${mm}`;
}

// faqat harflar, har 2 harfdan keyin "-" avtomatik, jami 6 harf (3 ta kun)
// har bir kun: birinchi harf katta, ikkinchisi kichik -> "Mo", "We", "Fr"
export function formatDaysLetters(raw) {
  const letters = raw.replace(/[^a-zA-Z]/g, "").slice(0, 6);

  const groups = [];
  for (let i = 0; i < letters.length; i += 2) {
    groups.push(letters.slice(i, i + 2));
  }

  const formatted = groups.map((g) => {
    if (g.length === 0) return g;
    if (g.length === 1) return g[0].toUpperCase();
    return g[0].toUpperCase() + g[1].toLowerCase();
  });

  return formatted.join("-");
}

// faqat bitta so'z (probellar olib tashlanadi), birinchi harf katta
export function formatSingleWordName(raw) {
  const noSpaces = raw.replace(/\s/g, "");
  if (!noSpaces) return "";
  return noSpaces[0].toUpperCase() + noSpaces.slice(1);
}

// faqat raqam, 2 xonagacha
export function formatAge(raw) {
  return raw.replace(/\D/g, "").slice(0, 2);
}

// faqat raqam, 9 xonagacha (telefon +998 dan keyingi qism)
export function formatPhoneDigits(raw) {
  return raw.replace(/\D/g, "").slice(0, 9);
}

// ISO timestamp -> "27/07/2026 14:30"
export function formatHistoryDate(isoString) {
  const d = new Date(isoString);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatRealTimeDate(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}
