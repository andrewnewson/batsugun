const TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Steel", "Dark", "Fairy"
];

// Attacking Move Type -> Defending Pokémon Type -> Multiplier (defaults to 1 if omitted)
const TYPE_CHART = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Fairy: 2, Steel: 0.5 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
};

let selectedTypes = [];

const typeGrid = document.getElementById("typeGrid");
const activePills = document.getElementById("activePills");
const matchupResults = document.getElementById("matchupResults");
const resetBtn = document.getElementById("resetBtn");

function init() {
  TYPES.forEach(type => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `type-btn type-${type}`;
    btn.textContent = type;
    btn.dataset.type = type;
    btn.addEventListener("click", () => handleTypeToggle(type));
    typeGrid.appendChild(btn);
  });

  resetBtn.addEventListener("click", resetSelection);
  render();
}

function handleTypeToggle(type) {
  if (selectedTypes.includes(type)) {
    selectedTypes = selectedTypes.filter(t => t !== type);
  } else {
    if (selectedTypes.length >= 2) {
      selectedTypes.shift(); // Drop the first selected type if 2 are already active
    }
    selectedTypes.push(type);
  }
  render();
}

function resetSelection() {
  selectedTypes = [];
  render();
}

function calculateMatchups(t1, t2) {
  const tiers = {
    4: [],
    2: [],
    1: [],
    0.5: [],
    0.25: [],
    0: []
  };

  TYPES.forEach(attacker => {
    const mult1 = TYPE_CHART[attacker][t1] ?? 1;
    const mult2 = t2 ? (TYPE_CHART[attacker][t2] ?? 1) : 1;
    const total = mult1 * mult2;

    if (tiers[total] !== undefined) {
      tiers[total].push(attacker);
    }
  });

  return tiers;
}

function render() {
  // Update button active borders/shadows
  document.querySelectorAll(".type-btn").forEach(btn => {
    btn.classList.toggle("selected", selectedTypes.includes(btn.dataset.type));
  });

  // Update target Pokémon types display
  activePills.innerHTML = "";
  if (selectedTypes.length === 0) {
    activePills.innerHTML = '<span class="placeholder">Select target type(s) below...</span>';
  } else {
    selectedTypes.forEach(type => {
      const badge = document.createElement("span");
      badge.className = `badge type-${type}`;
      badge.textContent = type;
      activePills.appendChild(badge);
    });
  }

  // Update attacking move effectiveness tiers
  matchupResults.innerHTML = "";
  if (selectedTypes.length === 0) return;

  const [t1, t2] = selectedTypes;
  const tiers = calculateMatchups(t1, t2);

  const tierConfigs = [
    { key: 4,    label: "Super Effective (4x Damage)",  tagClass: "tag-4x" },
    { key: 2,    label: "Super Effective (2x Damage)",  tagClass: "tag-2x" },
    { key: 0.5,  label: "Not Very Effective (½x Damage)", tagClass: "tag-05x" },
    { key: 0.25, label: "Not Very Effective (¼x Damage)", tagClass: "tag-025x" },
    { key: 0,    label: "No Effect (0x Damage / Immune)", tagClass: "tag-0x" },
    { key: 1,    label: "Regular Effectiveness (1x Damage)", tagClass: "tag-1x" }
  ];

  tierConfigs.forEach(({ key, label, tagClass }) => {
    const typesInTier = tiers[key];
    if (!typesInTier || typesInTier.length === 0) return;

    const group = document.createElement("section");
    group.className = "tier-group";

    const header = document.createElement("div");
    header.className = "tier-header";
    header.innerHTML = `<span class="multiplier-tag ${tagClass}">${key}x</span> ${label}`;

    const pillsContainer = document.createElement("div");
    pillsContainer.className = "tier-pills";

    typesInTier.forEach(type => {
      const pill = document.createElement("span");
      pill.className = `badge type-${type}`;
      pill.textContent = type;
      pillsContainer.appendChild(pill);
    });

    group.appendChild(header);
    group.appendChild(pillsContainer);
    matchupResults.appendChild(group);
  });
}

init();
