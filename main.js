/**
 * Úkol 4 – generování zaměstnanců a výpočet statistik.
 * @author Peter Benko 7643-1690-1
 */

/**
 * @typedef {object} AgeRange Rozmezí věku ve vstupu.
 * @property {number} min Minimální věk (v letech).
 * @property {number} max Maximální věk (v letech).
 */

/**
 * @typedef {object} DtoIn Vstupní data.
 * @property {number} count Počet zaměstnanců k vygenerování.
 * @property {AgeRange} age Věkové rozmezí {min, max}.
 */

/**
 * @typedef {'male'|'female'} Gender Pohlaví zaměstnance.
 */

/**
 * @typedef {object} Employee Zaměstnanec.
 * @property {Gender} gender Pohlaví (male/female).
 * @property {string} birthdate Datum narození ve formátu ISO Date-Time (YYYY-MM-DDTHH:mm:ss.sssZ).
 * @property {string} name Křestní jméno.
 * @property {string} surname Příjmení.
 * @property {number} workload Úvazek (10/20/30/40 hodin týdně).
 */

/**
 * @typedef {object} DtoOut Výstupní statistiky.
 * @property {number} total Počet zaměstnanců.
 * @property {number} workload10 Počet zaměstnanců s úvazkem 10.
 * @property {number} workload20 Počet zaměstnanců s úvazkem 20.
 * @property {number} workload30 Počet zaměstnanců s úvazkem 30.
 * @property {number} workload40 Počet zaměstnanců s úvazkem 40.
 * @property {number} averageAge Průměrný věk (zaokrouhleno na 1 desetinné místo).
 * @property {number} minAge Minimální věk (nejmladší zaměstnanec, celé roky).
 * @property {number} maxAge Maximální věk (nejstarší zaměstnanec, celé roky).
 * @property {number} medianAge Medián věku (celé roky).
 * @property {number} medianWorkload Medián úvazku.
 * @property {number} averageWomenWorkload Průměrný úvazek žen.
 * @property {Employee[]} sortedByWorkload Seznam zaměstnanců seřazený dle úvazku vzestupně.
 */

const MALE_NAMES = [
  "Adam", "Aleš", "Daniel", "David", "Filip",
  "Jaroslav", "Jan", "Jiří", "Karel", "Martin",
  "Milan", "Miloš", "Ondřej", "Pavel", "Radek",
  "Stanislav", "Tomáš", "Viktor", "Vladimír", "Vojtěch",
  "Vratislav", "Zdeněk", "Šimon", "Štěpán", "Marek"
];

const FEMALE_NAMES = [
  "Alžběta", "Barbora", "Božena", "Denisa", "Eva",
  "Hana", "Helena", "Irena", "Ivana", "Jitka",
  "Kateřina", "Kristýna", "Lenka", "Lucie", "Magdaléna",
  "Marie", "Michaela", "Petra", "Radka", "Romana",
  "Simona", "Šárka", "Tereza", "Veronika", "Zdeňka"
];

const MALE_SURNAMES = [
  "Balog", "Bartoš", "Beneš", "Beran", "Doležal",
  "Dvořák", "Fiala", "Hájek", "Horák", "Hruška",
  "Jelínek", "Kadlec", "Král", "Krejčí", "Kříž",
  "Kučera", "Malý", "Marek", "Mareš", "Navrátil",
  "Němec", "Novák", "Novotný", "Polák", "Pospíšil"
];

const FEMALE_SURNAMES = [
  "Adamová", "Balogová", "Bartošová", "Benešová", "Beranová",
  "Doležalová", "Dvořáková", "Fialová", "Hájeková", "Horáková",
  "Hrušková", "Jelínková", "Kadlecová", "Králová", "Krejčíová",
  "Kučerová", "Malá", "Marešová", "Navrátilová", "Němcová",
  "Nováková", "Novotná", "Poláková", "Pospíšilová", "Procházková"
];

const WORKLOADS = [10, 20, 30, 40];

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365.25 * DAY_MS;

/**
 * Vrátí náhodnou položku z pole.
 * @template T
 * @param {T[]} array Vstupní pole.
 * @returns {T} Náhodně vybraná položka.
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Normalizuje věkový rozsah tak, aby minAge <= maxAge.
 * @param {number} minAge Minimální věk.
 * @param {number} maxAge Maximální věk.
 * @returns {{minAge: number, maxAge: number}} Normalizovaný rozsah.
 */
function normalizeAgeRange(minAge, maxAge) {
  const min = Number(minAge);
  const max = Number(maxAge);
  return min > max ? { minAge: max, maxAge: min } : { minAge: min, maxAge: max };
}

/**
 * Náhodné celé číslo včetně hranic.
 * @param {number} min Minimální hodnota (včetně).
 * @param {number} max Maximální hodnota (včetně).
 * @returns {number} Náhodné celé číslo v rozsahu <min, max>.
 */
function randomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Vygeneruje datum narození tak, aby platilo age >= minAge (včetně) a age < maxAge (bez).
 * Věk je počítaný jako (nowMs - birthMs) / YEAR_MS.
 * @param {number} minAge Minimální věk (v letech).
 * @param {number} maxAge Maximální věk (v letech).
 * @param {number} nowMs Aktuální čas v milisekundách.
 * @returns {string} Datum narození ve formátu ISO Date-Time.
 */
function generateBirthdate(minAge, maxAge, nowMs) {
  const range = normalizeAgeRange(minAge, maxAge);

  const oldestExclusive = nowMs - range.maxAge * YEAR_MS;
  const youngestInclusive = nowMs - range.minAge * YEAR_MS;

  const minMs = Math.floor(oldestExclusive) + 1;
  const maxMs = Math.floor(youngestInclusive);

  const safeMin = Math.min(minMs, maxMs);
  const safeMax = Math.max(minMs, maxMs);

  const birthMs = randomIntInclusive(safeMin, safeMax);
  return new Date(birthMs).toISOString();
}

/**
 * Vygeneruje jednoho zaměstnance.
 * @param {DtoIn} dtoIn Vstupní parametry generování.
 * @param {number} nowMs Aktuální čas v milisekundách.
 * @returns {Employee} Vygenerovaný zaměstnanec.
 */
function generateEmployee(dtoIn, nowMs) {
  const range = normalizeAgeRange(dtoIn.age.min, dtoIn.age.max);
  const gender = Math.random() < 0.5 ? "male" : "female";

  const firstNames = gender === "male" ? MALE_NAMES : FEMALE_NAMES;
  const surnames = gender === "male" ? MALE_SURNAMES : FEMALE_SURNAMES;

  return {
    gender,
    birthdate: generateBirthdate(range.minAge, range.maxAge, nowMs),
    name: getRandomItem(firstNames),
    surname: getRandomItem(surnames),
    workload: getRandomItem(WORKLOADS)
  };
}

/**
 * Spočítá věk (desetinné roky).
 * @param {string} birthdateIso Datum narození v ISO formátu.
 * @param {number} nowMs Aktuální čas v milisekundách.
 * @returns {number} Věk v letech jako desetinné číslo.
 */
function ageInYears(birthdateIso, nowMs) {
  const birthMs = new Date(birthdateIso).getTime();
  return (nowMs - birthMs) / YEAR_MS;
}

/**
 * Zaokrouhlí číslo na 1 desetinné místo.
 * @param {number} value Vstupní hodnota.
 * @returns {number} Hodnota zaokrouhlená na 1 desetinné místo.
 */
function roundTo1Decimal(value) {
  return Number(value.toFixed(1));
}

/**
 * Spočítá medián pole čísel.
 * @param {number[]} numbers Vstupní pole čísel.
 * @returns {number} Medián.
 */
function computeMedian(numbers) {
  if (numbers.length === 0) return 0;
  const sorted = numbers.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Seřadí zaměstnance dle úvazku vzestupně.
 * @param {Employee[]} employees Seznam zaměstnanců.
 * @returns {Employee[]} Seznam seřazený dle úvazku.
 */
function stableSortByWorkload(employees) {
  return employees
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.workload - b.e.workload) || (a.i - b.i))
    .map((x) => x.e);
}

/**
 * Vytvoří agregace potřebné pro výpočet statistik.
 * @param {Employee[]} employees Seznam zaměstnanců.
 * @param {number} nowMs Aktuální čas v milisekundách.
 * @returns {{workloadCounters: {10:number,20:number,30:number,40:number}, workloads: number[], ages: number[], ageSum: number, minAgeInt: number, maxAgeInt: number, womenWorkloadSum: number, womenCount: number}} Agregované hodnoty.
 */
function buildAggregates(employees, nowMs) {
  const total = employees.length;
  const workloadCounters = { 10: 0, 20: 0, 30: 0, 40: 0 };
  const workloads = new Array(total);
  const ages = new Array(total);

  let ageSum = 0;
  let minAgeInt = Infinity;
  let maxAgeInt = -Infinity;
  let womenWorkloadSum = 0;
  let womenCount = 0;

  for (let i = 0; i < total; i += 1) {
    const e = employees[i];

    if (workloadCounters[e.workload] !== undefined) workloadCounters[e.workload] += 1;

    workloads[i] = e.workload;

    const ageF = ageInYears(e.birthdate, nowMs);
    ages[i] = ageF;
    ageSum += ageF;

    const ageI = Math.floor(ageF);
    if (ageI < minAgeInt) minAgeInt = ageI;
    if (ageI > maxAgeInt) maxAgeInt = ageI;

    if (e.gender === "female") {
      womenCount += 1;
      womenWorkloadSum += e.workload;
    }
  }

  return {
    workloadCounters,
    workloads,
    ages,
    ageSum,
    minAgeInt,
    maxAgeInt,
    womenWorkloadSum,
    womenCount
  };
}

/**
 * Hlavní funkce, která spouští aplikaci – vygeneruje zaměstnance a vrátí statistiky.
 * @param {DtoIn} dtoIn Obsahuje počet zaměstnanců a věkové rozmezí {min, max}.
 * @returns {DtoOut} Vypočtené statistiky (dtoOut).
 */
export function main(dtoIn) {
  const nowMs = Date.now();
  const employees = generateEmployeeData(dtoIn, nowMs);
  const dtoOut = getEmployeeStatistics(employees, nowMs);
  return dtoOut;
}

/**
 * Vygeneruje pole zaměstnanců podle vstupních parametrů dtoIn (Úkol 3).
 * @param {DtoIn} dtoIn Obsahuje počet zaměstnanců a věkové rozmezí {min, max}.
 * @param {number} [nowMs] Aktuální čas v milisekundách.
 * @returns {Employee[]} Pole vygenerovaných zaměstnanců.
 */
export function generateEmployeeData(dtoIn, nowMs = Date.now()) {
  const employees = [];
  const count = Number(dtoIn.count) || 0;

  for (let i = 0; i < count; i += 1) {
    employees.push(generateEmployee(dtoIn, nowMs));
  }

  const dtoOut = employees;
  return dtoOut;
}

/**
 * Spočítá statistiky ze seznamu zaměstnanců (Úkol 4).
 * @param {Employee[]} employees Obsahuje všechny vygenerované zaměstnance.
 * @param {number} [nowMs] Aktuální čas v milisekundách.
 * @returns {DtoOut} Statistické hodnoty ve struktuře dtoOut.
 */
export function getEmployeeStatistics(employees, nowMs = Date.now()) {
  const total = employees.length;

  const {
    workloadCounters,
    workloads,
    ages,
    ageSum,
    minAgeInt,
    maxAgeInt,
    womenWorkloadSum,
    womenCount
  } = buildAggregates(employees, nowMs);

  const averageAge = total === 0 ? 0 : roundTo1Decimal(ageSum / total);
  const minAge = total === 0 ? 0 : minAgeInt;
  const maxAge = total === 0 ? 0 : maxAgeInt;
  const medianAge = total === 0 ? 0 : Math.floor(computeMedian(ages));
  const medianWorkload = total === 0 ? 0 : computeMedian(workloads);
  const averageWomenWorkload = womenCount === 0 ? 0 : roundTo1Decimal(womenWorkloadSum / womenCount);
  const sortedByWorkload = stableSortByWorkload(employees);

  const dtoOut = {
    total,
    workload10: workloadCounters[10],
    workload20: workloadCounters[20],
    workload30: workloadCounters[30],
    workload40: workloadCounters[40],
    averageAge,
    minAge,
    maxAge,
    medianAge,
    medianWorkload,
    averageWomenWorkload,
    sortedByWorkload
  };

  return dtoOut;
}