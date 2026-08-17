const STORAGE_KEY = "intercambiahogar_data";
const CURRENT_USER = { id: "user-me", name: "Tú", email: "tu@email.com" };

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return seedData();
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function seedData() {
  const data = {
    listings: [
      {
        id: "lst-1",
        title: "Habitación luminosa en Providencia",
        city: "Santiago, Chile",
        description: "Habitación amoblada en departamento compartido. Ideal para intercambio de 1 a 3 meses. Cocina equipada, buena conectividad y ambiente tranquilo. Solo se comparten gastos comunes acordados.",
        hostId: "user-ana",
        hostName: "Ana M.",
        photos: [],
        costs: [
          { label: "Agua", amount: 8000 },
          { label: "Luz (estimado)", amount: 12000 },
          { label: "Internet", amount: 10000 }
        ],
        createdAt: "2026-07-10T14:00:00.000Z"
      },
      {
        id: "lst-2",
        title: "Estudio céntrico en Valparaíso",
        city: "Valparaíso, Chile",
        description: "Pequeño estudio con vista al mar. Perfecto para artistas o nómadas digitales. Intercambio por temporada. Propongo dividir servicios básicos y acordar limpieza semanal.",
        hostId: "user-carlos",
        hostName: "Carlos R.",
        photos: [],
        costs: [
          { label: "Gastos comunes edificio", amount: 45000 },
          { label: "Agua y gas", amount: 15000 }
        ],
        createdAt: "2026-07-22T09:30:00.000Z"
      },
      {
        id: "lst-3",
        title: "Casa con jardín en Concepción",
        city: "Concepción, Chile",
        description: "Habitación en casa familiar con jardín. Ambiente acogedor, cerca de universidades. Buscamos intercambio honesto: tú cuidas el espacio, compartimos gastos de servicios.",
        hostId: "user-lucia",
        hostName: "Lucía P.",
        photos: [],
        costs: [
          { label: "Servicios básicos", amount: 25000 },
          { label: "Mantenimiento jardín (opcional)", amount: 8000 }
        ],
        createdAt: "2026-08-01T16:00:00.000Z"
      }
    ],
    reviews: [
      {
        id: "rev-1",
        listingId: "lst-1",
        authorId: "user-pedro",
        authorName: "Pedro S.",
        rating: 5,
        comment: "Excelente experiencia. Ana fue muy clara con los gastos y el espacio era tal como en la descripción.",
        createdAt: "2026-07-28T11:00:00.000Z"
      },
      {
        id: "rev-2",
        listingId: "lst-1",
        authorId: "user-maria",
        authorName: "María L.",
        rating: 4,
        comment: "Buen intercambio, solo recomendaría acordar horarios de visita con anticipación.",
        createdAt: "2026-08-02T18:30:00.000Z"
      },
      {
        id: "rev-3",
        listingId: "lst-2",
        authorId: "user-diego",
        authorName: "Diego F.",
        rating: 5,
        comment: "Vista increíble y Carlos muy flexible con las fechas del intercambio.",
        createdAt: "2026-07-30T09:15:00.000Z"
      }
    ],
    conversations: [
      {
        id: "conv-1",
        listingId: "lst-1",
        listingTitle: "Habitación luminosa en Providencia",
        participantId: "user-ana",
        participantName: "Ana M.",
        messages: [
          {
            id: "msg-1",
            senderId: "user-ana",
            text: "¡Hola! Gracias por tu interés. ¿Qué fechas tenías en mente para el intercambio?",
            createdAt: "2026-08-03T10:00:00.000Z"
          },
          {
            id: "msg-2",
            senderId: "user-me",
            text: "Hola Ana, estaría disponible de septiembre a noviembre. ¿Los gastos serían los publicados?",
            createdAt: "2026-08-03T10:15:00.000Z"
          },
          {
            id: "msg-3",
            senderId: "user-ana",
            text: "Sí, exactamente. Podemos ajustar internet si necesitas más velocidad. ¿Te gustaría agendar una videollamada?",
            createdAt: "2026-08-03T10:22:00.000Z"
          }
        ]
      }
    ],
    reports: []
  };
  saveData(data);
  return data;
}

function getListings() {
  return loadData().listings;
}

function getListing(id) {
  return getListings().find((l) => l.id === id) || null;
}

function addListing(listing) {
  const data = loadData();
  const entry = {
    id: uid(),
    hostId: CURRENT_USER.id,
    hostName: CURRENT_USER.name,
    createdAt: new Date().toISOString(),
    ...listing
  };
  data.listings.unshift(entry);
  saveData(data);
  return entry;
}

function getReviews(listingId) {
  return loadData().reviews.filter((r) => r.listingId === listingId);
}

function getAverageRating(listingId) {
  const reviews = getReviews(listingId);
  if (!reviews.length) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function addReview(listingId, rating, comment) {
  const data = loadData();
  const review = {
    id: uid(),
    listingId,
    authorId: CURRENT_USER.id,
    authorName: CURRENT_USER.name,
    rating,
    comment,
    createdAt: new Date().toISOString()
  };
  data.reviews.unshift(review);
  saveData(data);
  return review;
}

function getConversations() {
  return loadData().conversations;
}

function getConversation(id) {
  return getConversations().find((c) => c.id === id) || null;
}

function findOrCreateConversation(listing) {
  const data = loadData();
  let conv = data.conversations.find(
    (c) => c.listingId === listing.id && c.participantId === listing.hostId
  );
  if (!conv) {
    conv = {
      id: uid(),
      listingId: listing.id,
      listingTitle: listing.title,
      participantId: listing.hostId,
      participantName: listing.hostName,
      messages: []
    };
    data.conversations.unshift(conv);
    saveData(data);
  }
  return conv;
}

function sendMessage(conversationId, text) {
  const data = loadData();
  const conv = data.conversations.find((c) => c.id === conversationId);
  if (!conv) return null;
  const message = {
    id: uid(),
    senderId: CURRENT_USER.id,
    text,
    createdAt: new Date().toISOString()
  };
  conv.messages.push(message);
  saveData(data);
  return message;
}

function addReport(report) {
  const data = loadData();
  const entry = {
    id: uid(),
    status: "pendiente",
    createdAt: new Date().toISOString(),
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    ...report
  };
  data.reports.unshift(entry);
  saveData(data);
  return entry;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(iso) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}

function formatDateShort(iso) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short"
  }).format(new Date(iso));
}

function starsHtml(rating, interactive = false, selected = 0) {
  if (interactive) {
    return Array.from({ length: 5 }, (_, i) => {
      const n = i + 1;
      const cls = n <= selected ? "active" : "";
      return `<button type="button" class="star-btn ${cls}" data-star="${n}" aria-label="${n} estrellas">★</button>`;
    }).join("");
  }
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function totalCosts(costs) {
  return costs.reduce((sum, c) => sum + c.amount, 0);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function listingCardHtml(listing) {
  const rating = getAverageRating(listing.id);
  const total = totalCosts(listing.costs);
  const img = listing.photos[0]
    ? `<img src="${listing.photos[0]}" alt="${escapeHtml(listing.title)}">`
    : `<div class="card-placeholder" aria-hidden="true">🏠</div>`;

  return `
    <a href="#/hospedaje/${listing.id}" class="listing-card">
      ${img}
      <div class="card-body">
        <h3>${escapeHtml(listing.title)}</h3>
        <div class="card-meta">
          <span>📍 ${escapeHtml(listing.city)}</span>
          <span class="tag">Intercambio</span>
          <span class="tag tag-cost">~${formatCurrency(total)}/mes</span>
        </div>
        ${rating ? `<div class="card-rating"><span class="stars">${starsHtml(rating)}</span> ${rating}</div>` : "<div class=\"card-rating\" style=\"color:var(--text-muted);font-weight:400\">Sin reseñas aún</div>"}
      </div>
    </a>`;
}
