const app = document.getElementById("app");
const toastEl = document.getElementById("toast");
let pendingPhotos = [];
let selectedRating = 0;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3200);
}

function parseRoute() {
  const hash = location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);
  return { parts, hash };
}

function setActiveNav() {
  const { parts } = parseRoute();
  const section = parts[0] || "inicio";
  document.querySelectorAll(".main-nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === section || (section === "hospedaje" && a.dataset.nav === "explorar") || (section === "denuncia" && a.dataset.nav === "terminos"));
  });
}

function render() {
  setActiveNav();
  const { parts } = parseRoute();
  const view = parts[0] || "inicio";

  switch (view) {
    case "explorar": renderExplore(); break;
    case "publicar": renderPublish(); break;
    case "hospedaje": renderDetail(parts[1]); break;
    case "chat": renderChat(parts[1]); break;
    case "terminos": renderTerms(); break;
    case "denuncia": renderReport(parts[1]); break;
    default: renderHome();
  }
}

function renderHome() {
  const count = getListings().length;
  app.innerHTML = `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="hero-badge">Sin arriendos caros · Solo gastos compartidos</span>
          <h1>Intercambia hospedajes, no pagues de más</h1>
          <p class="hero-lead">
            IntercambiaHogar conecta personas que quieren compartir espacios de forma justa.
            Olvídate de arriendos inflados: acuerda solo gastos comunes o los costos que propongan
            anfitriones y huéspedes de forma transparente.
          </p>
          <div class="hero-actions">
            <a href="#/explorar" class="btn btn-primary">Explorar hospedajes</a>
            <a href="#/publicar" class="btn btn-secondary">Publicar el mío</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-stat-grid">
            <div class="stat-card"><strong>${count}</strong><span>Hospedajes activos</span></div>
            <div class="stat-card"><strong>0%</strong><span>Comisión de arriendo</span></div>
            <div class="stat-card"><strong>100%</strong><span>Gastos transparentes</span></div>
            <div class="stat-card"><strong>Chat</strong><span>Comunicación directa</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">¿Cómo funciona?</h2>
        <p class="section-subtitle">Un modelo basado en confianza, intercambio y acuerdos claros entre las partes.</p>
        <div class="steps-grid">
          <article class="step-card">
            <div class="step-num">1</div>
            <h3>Publica o explora</h3>
            <p>Sube fotos, describe tu espacio y propón los gastos comunes. O busca un hospedaje que se ajuste a ti.</p>
          </article>
          <article class="step-card">
            <div class="step-num">2</div>
            <h3>Conversa y acuerda</h3>
            <p>Usa el chat para conocer detalles, fechas del intercambio y confirmar qué gastos compartirán.</p>
          </article>
          <article class="step-card">
            <div class="step-num">3</div>
            <h3>Intercambia con confianza</h3>
            <p>Lee reseñas, revisa términos y condiciones, y denuncia cualquier conducta inapropiada.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <h2 class="section-title">Hospedajes destacados</h2>
        <p class="section-subtitle">Espacios disponibles para intercambio con gastos compartidos.</p>
        <div class="cards-grid">
          ${getListings().slice(0, 3).map(listingCardHtml).join("")}
        </div>
        <p style="margin-top:1.5rem;text-align:center">
          <a href="#/explorar" class="btn btn-secondary">Ver todos</a>
        </p>
      </div>
    </section>`;
}

function renderExplore() {
  const listings = getListings();
  app.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Explorar hospedajes</h1>
        <p>Encuentra espacios para intercambiar. Solo pagas los gastos acordados, nunca un arriendo completo.</p>
      </div>
    </div>
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="filter-bar">
          <input type="text" id="searchInput" placeholder="Buscar por ciudad o título..." aria-label="Buscar">
          <select id="sortSelect" aria-label="Ordenar">
            <option value="newest">Más recientes</option>
            <option value="rating">Mejor valorados</option>
            <option value="cost-low">Menor costo</option>
          </select>
        </div>
        <div class="cards-grid" id="listingsGrid">
          ${listings.map(listingCardHtml).join("")}
        </div>
      </div>
    </section>`;

  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const grid = document.getElementById("listingsGrid");

  function filterListings() {
    const q = searchInput.value.toLowerCase().trim();
    let filtered = getListings().filter(
      (l) => l.title.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
    );

    const sort = sortSelect.value;
    if (sort === "rating") {
      filtered = filtered.sort((a, b) => (getAverageRating(b.id) || 0) - (getAverageRating(a.id) || 0));
    } else if (sort === "cost-low") {
      filtered = filtered.sort((a, b) => totalCosts(a.costs) - totalCosts(b.costs));
    } else {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    grid.innerHTML = filtered.length
      ? filtered.map(listingCardHtml).join("")
      : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🔍</div><p>No se encontraron hospedajes con esos criterios.</p></div>`;
  }

  searchInput.addEventListener("input", filterListings);
  sortSelect.addEventListener("change", filterListings);
}

function renderPublish() {
  pendingPhotos = [];
  app.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Publicar tu hospedaje</h1>
        <p>Comparte fotos, describe el espacio y propón los gastos comunes que consideres justos.</p>
      </div>
    </div>
    <section class="section" style="padding-top:0">
      <div class="container">
        <form class="form-panel" id="publishForm">
          <div class="form-group">
            <label for="title">Título del hospedaje</label>
            <input type="text" id="title" required placeholder="Ej: Habitación con balcón en Ñuñoa">
          </div>
          <div class="form-group">
            <label for="city">Ciudad / ubicación</label>
            <input type="text" id="city" required placeholder="Ej: Santiago, Chile">
          </div>
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" required placeholder="Describe el espacio, reglas básicas, duración ideal del intercambio..."></textarea>
          </div>
          <div class="form-group">
            <label for="photos">Fotos</label>
            <input type="file" id="photos" accept="image/*" multiple>
            <small>Puedes subir varias imágenes del hospedaje.</small>
            <div class="photo-preview-grid" id="photoPreview"></div>
          </div>
          <fieldset class="form-group" style="border:none;padding:0;margin:0">
            <legend style="font-weight:600;font-size:0.88rem;margin-bottom:0.65rem">Gastos propuestos (mensuales)</legend>
            <div id="costsContainer">
              <div class="form-row cost-row">
                <input type="text" class="cost-label" placeholder="Concepto (ej: Agua)" required>
                <input type="number" class="cost-amount" placeholder="Monto CLP" min="0" required>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="addCostBtn" style="margin-top:0.5rem">+ Agregar gasto</button>
            <small>Solo incluye gastos comunes o acordados. No se permiten arriendos completos.</small>
          </fieldset>
          <div style="margin-top:1.25rem;display:flex;gap:0.65rem;flex-wrap:wrap">
            <button type="submit" class="btn btn-primary">Publicar hospedaje</button>
            <a href="#/terminos" class="btn btn-secondary">Ver términos</a>
          </div>
        </form>
      </div>
    </section>`;

  document.getElementById("photos").addEventListener("change", handlePhotoSelect);
  document.getElementById("addCostBtn").addEventListener("click", addCostRow);
  document.getElementById("publishForm").addEventListener("submit", handlePublish);
}

function addCostRow() {
  const container = document.getElementById("costsContainer");
  const row = document.createElement("div");
  row.className = "form-row cost-row";
  row.innerHTML = `
    <input type="text" class="cost-label" placeholder="Concepto">
    <input type="number" class="cost-amount" placeholder="Monto CLP" min="0">`;
  container.appendChild(row);
}

function handlePhotoSelect(e) {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      pendingPhotos.push(ev.target.result);
      renderPhotoPreview();
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoPreview() {
  const preview = document.getElementById("photoPreview");
  if (!preview) return;
  preview.innerHTML = pendingPhotos
    .map(
      (src, i) => `
      <div class="photo-preview">
        <img src="${src}" alt="Vista previa ${i + 1}">
        <button type="button" data-index="${i}" aria-label="Eliminar foto">×</button>
      </div>`
    )
    .join("");

  preview.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      pendingPhotos.splice(Number(btn.dataset.index), 1);
      renderPhotoPreview();
    });
  });
}

function handlePublish(e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const city = document.getElementById("city").value.trim();
  const description = document.getElementById("description").value.trim();

  const costs = [];
  document.querySelectorAll(".cost-row").forEach((row) => {
    const label = row.querySelector(".cost-label").value.trim();
    const amount = Number(row.querySelector(".cost-amount").value);
    if (label && amount >= 0) costs.push({ label, amount });
  });

  if (!costs.length) {
    showToast("Agrega al menos un gasto propuesto.");
    return;
  }

  const listing = addListing({ title, city, description, photos: [...pendingPhotos], costs });
  showToast("¡Hospedaje publicado con éxito!");
  location.hash = `#/hospedaje/${listing.id}`;
}

function renderDetail(id) {
  const listing = getListing(id);
  if (!listing) {
    app.innerHTML = `<div class="container empty-state"><div class="empty-state-icon">🏚️</div><p>Hospedaje no encontrado.</p><a href="#/explorar" class="btn btn-primary">Volver a explorar</a></div>`;
    return;
  }

  const reviews = getReviews(id);
  const rating = getAverageRating(id);
  const total = totalCosts(listing.costs);
  const mainPhoto = listing.photos[0] || null;

  app.innerHTML = `
    <section class="section">
      <div class="container detail-layout">
        <div>
          ${mainPhoto
            ? `<img class="gallery-main" id="mainPhoto" src="${mainPhoto}" alt="${escapeHtml(listing.title)}">`
            : `<div class="gallery-main card-placeholder" style="height:340px;font-size:4rem">🏠</div>`}
          ${listing.photos.length > 1
            ? `<div class="gallery-thumbs">${listing.photos
                .map(
                  (p, i) =>
                    `<img src="${p}" alt="Foto ${i + 1}" class="${i === 0 ? "active" : ""}" data-photo="${p}">`
                )
                .join("")}</div>`
            : ""}
          <h1 style="font-family:var(--font-display);margin:1.25rem 0 0.5rem">${escapeHtml(listing.title)}</h1>
          <p style="color:var(--text-muted);margin:0 0 1rem">📍 ${escapeHtml(listing.city)} · Anfitrión: ${escapeHtml(listing.hostName)}</p>
          ${rating ? `<p class="card-rating" style="margin-bottom:1rem"><span class="stars">${starsHtml(rating)}</span> ${rating} (${reviews.length} reseñas)</p>` : ""}
          <p style="line-height:1.7">${escapeHtml(listing.description)}</p>

          <div class="reviews-section">
            <h2 class="section-title" style="font-size:1.35rem">Reseñas</h2>
            <div id="reviewsList">
              ${reviews.length
                ? reviews
                    .map(
                      (r) => `
                <article class="review-card">
                  <div class="review-header">
                    <span class="review-author">${escapeHtml(r.authorName)}</span>
                    <span class="stars">${starsHtml(r.rating)}</span>
                  </div>
                  <p style="margin:0;font-size:0.9rem;color:var(--text-muted)">${escapeHtml(r.comment)}</p>
                  <small style="color:var(--text-muted)">${formatDateShort(r.createdAt)}</small>
                </article>`
                    )
                    .join("")
                : `<p style="color:var(--text-muted)">Aún no hay reseñas. ¡Sé el primero!</p>`}
            </div>
            <form class="review-form" id="reviewForm">
              <strong style="display:block;margin-bottom:0.5rem">Deja tu reseña</strong>
              <div class="star-picker" id="starPicker">${starsHtml(0, true, selectedRating)}</div>
              <div class="form-group" style="margin-bottom:0.75rem">
                <textarea id="reviewComment" required placeholder="Cuéntanos tu experiencia con este hospedaje..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Publicar reseña</button>
            </form>
          </div>
        </div>

        <aside class="detail-sidebar">
          <h3 style="margin:0 0 1rem;font-size:1.1rem">Gastos propuestos</h3>
          <p style="font-size:0.85rem;color:var(--text-muted);margin:0 0 0.75rem">Solo gastos comunes acordados — sin arriendo.</p>
          <ul class="cost-list">
            ${listing.costs.map((c) => `<li><span>${escapeHtml(c.label)}</span><span>${formatCurrency(c.amount)}</span></li>`).join("")}
            <li><span>Total estimado</span><span>${formatCurrency(total)}</span></li>
          </ul>
          <div class="detail-actions">
            <button class="btn btn-primary btn-block" id="chatBtn">💬 Iniciar chat</button>
            <a href="#/denuncia/${listing.id}" class="btn btn-danger btn-block btn-sm">⚠ Denunciar publicación</a>
          </div>
        </aside>
      </div>
    </section>`;

  document.querySelectorAll(".gallery-thumbs img").forEach((img) => {
    img.addEventListener("click", () => {
      document.getElementById("mainPhoto").src = img.dataset.photo;
      document.querySelectorAll(".gallery-thumbs img").forEach((t) => t.classList.remove("active"));
      img.classList.add("active");
    });
  });

  document.getElementById("chatBtn").addEventListener("click", () => {
    const conv = findOrCreateConversation(listing);
    location.hash = `#/chat/${conv.id}`;
  });

  selectedRating = 0;
  const starPicker = document.getElementById("starPicker");
  starPicker.querySelectorAll(".star-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedRating = Number(btn.dataset.star);
      starPicker.innerHTML = starsHtml(0, true, selectedRating);
      starPicker.querySelectorAll(".star-btn").forEach((b) => {
        b.addEventListener("click", () => {
          selectedRating = Number(b.dataset.star);
          starPicker.innerHTML = starsHtml(0, true, selectedRating);
          bindStarPicker(starPicker);
        });
      });
    });
  });

  document.getElementById("reviewForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedRating) {
      showToast("Selecciona una calificación.");
      return;
    }
    const comment = document.getElementById("reviewComment").value.trim();
    addReview(id, selectedRating, comment);
    showToast("Reseña publicada.");
    render();
  });
}

function bindStarPicker(starPicker) {
  starPicker.querySelectorAll(".star-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedRating = Number(btn.dataset.star);
      starPicker.innerHTML = starsHtml(0, true, selectedRating);
      bindStarPicker(starPicker);
    });
  });
}

function renderChat(conversationId) {
  const conversations = getConversations();
  const active = conversationId ? getConversation(conversationId) : conversations[0];

  app.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Chat</h1>
        <p>Comunícate directamente para acordar fechas, gastos y detalles del intercambio.</p>
      </div>
    </div>
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="chat-layout">
          <aside class="chat-sidebar">
            <div class="chat-sidebar-header">Conversaciones</div>
            ${conversations.length
              ? conversations
                  .map((c) => {
                    const last = c.messages[c.messages.length - 1];
                    return `
                <button class="chat-thread ${active && c.id === active.id ? "active" : ""}" data-id="${c.id}">
                  <strong>${escapeHtml(c.participantName)}</strong>
                  <span>${escapeHtml(c.listingTitle)}</span>
                  ${last ? `<span style="display:block;margin-top:0.2rem;font-size:0.75rem">${escapeHtml(last.text.slice(0, 40))}${last.text.length > 40 ? "…" : ""}</span>` : ""}
                </button>`;
                  })
                  .join("")
              : `<p style="padding:1rem;color:var(--text-muted);font-size:0.88rem">Sin conversaciones. Inicia un chat desde un hospedaje.</p>`}
          </aside>
          <div class="chat-main">
            ${active
              ? `<div class="chat-messages" id="chatMessages">
                  ${active.messages
                    .map(
                      (m) => `
                    <div class="message ${m.senderId === CURRENT_USER.id ? "sent" : "received"}">
                      ${escapeHtml(m.text)}
                      <time>${formatDate(m.createdAt)}</time>
                    </div>`
                    )
                    .join("")}
                </div>
                <form class="chat-input-bar" id="chatForm">
                  <input type="text" id="messageInput" placeholder="Escribe un mensaje..." required autocomplete="off">
                  <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
                </form>`
              : `<div class="chat-empty"><div><div style="font-size:2rem;margin-bottom:0.5rem">💬</div><p>Selecciona una conversación o inicia un chat desde un hospedaje.</p></div></div>`}
          </div>
        </div>
      </div>
    </section>`;

  document.querySelectorAll(".chat-thread").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = `#/chat/${btn.dataset.id}`;
    });
  });

  const chatForm = document.getElementById("chatForm");
  if (chatForm && active) {
    const messagesEl = document.getElementById("chatMessages");
    messagesEl.scrollTop = messagesEl.scrollHeight;

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("messageInput");
      const text = input.value.trim();
      if (!text) return;
      sendMessage(active.id, text);
      input.value = "";
      renderChat(active.id);
    });
  }
}

function renderTerms() {
  app.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Términos y condiciones</h1>
        <p>Reglas de uso de IntercambiaHogar para una comunidad segura y transparente.</p>
      </div>
    </div>
    <section class="section" style="padding-top:0">
      <div class="container">
        <article class="legal-content">
          <h2>1. Naturaleza del servicio</h2>
          <p>IntercambiaHogar es una plataforma de introducción que facilita el contacto entre personas interesadas en intercambiar hospedajes y compartir gastos comunes. No somos arrendadores ni intermediarios de pagos de arriendo.</p>

          <h2>2. Modelo de intercambio</h2>
          <p>Las publicaciones deben referirse exclusivamente a intercambios de hospedaje o al reparto de gastos comunes acordados (agua, luz, internet, gastos de edificio, etc.). Queda prohibido usar la plataforma para cobrar arriendos completos disfrazados de “gastos”.</p>

          <h2>3. Responsabilidad de los usuarios</h2>
          <ul>
            <li>Publicar información veraz sobre el hospedaje, fotos actuales y gastos propuestos.</li>
            <li>Comunicarse de forma respetuosa a través del chat integrado.</li>
            <li>Acordar por escrito (chat) fechas, reglas y montos antes del intercambio.</li>
            <li>Respetar la privacidad y seguridad del anfitrión y del huésped.</li>
          </ul>

          <h2>4. Reseñas</h2>
          <p>Las reseñas deben ser honestas y basadas en experiencias reales. No se permiten reseñas falsas, difamatorias o publicadas a cambio de compensación.</p>

          <h2>5. Denuncias</h2>
          <p>Cualquier usuario puede reportar publicaciones o conductas que violen estos términos. Las denuncias serán revisadas y pueden resultar en la eliminación de contenido o suspensión de cuentas.</p>

          <h2>6. Limitación de responsabilidad</h2>
          <p>IntercambiaHogar no garantiza la calidad de los hospedajes ni la conducta de los usuarios. Los acuerdos de intercambio son responsabilidad exclusiva de las partes involucradas.</p>

          <h2>7. Privacidad</h2>
          <p>Los datos ingresados se almacenan localmente en este prototipo. En una versión productiva, se aplicarían políticas de protección de datos conforme a la legislación vigente.</p>

          <h2>8. Aceptación</h2>
          <p>Al publicar un hospedaje, enviar mensajes o dejar reseñas, aceptas estos términos y condiciones.</p>

          <p style="margin-top:2rem">
            <a href="#/denuncia" class="btn btn-danger btn-sm">Enviar una denuncia</a>
          </p>
        </article>
      </div>
    </section>`;
}

function renderReport(listingId) {
  const listing = listingId ? getListing(listingId) : null;

  app.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Denuncias</h1>
        <p>Reporta publicaciones falsas, cobros indebidos, acoso u otras violaciones.</p>
      </div>
    </div>
    <section class="section" style="padding-top:0">
      <div class="container">
        <form class="form-panel" id="reportForm">
          <div class="alert-box">
            ⚠ Las denuncias son confidenciales. Revisaremos cada reporte y tomaremos las medidas correspondientes.
          </div>
          <div class="form-group">
            <label for="reportType">Tipo de denuncia</label>
            <select id="reportType" required>
              <option value="">Seleccionar...</option>
              <option value="arriendo-oculto">Cobro de arriendo disfrazado de gastos</option>
              <option value="info-falsa">Información o fotos falsas</option>
              <option value="acoso">Acoso o conducta inapropiada</option>
              <option value="estafa">Posible estafa o fraude</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          ${listing
            ? `<div class="form-group">
                <label>Hospedaje reportado</label>
                <input type="text" value="${escapeHtml(listing.title)}" disabled>
                <input type="hidden" id="reportListingId" value="${listing.id}">
              </div>`
            : `<div class="form-group">
                <label for="reportListingId">ID o nombre del hospedaje (opcional)</label>
                <input type="text" id="reportListingId" placeholder="Si aplica">
              </div>`}
          <div class="form-group">
            <label for="reportDetails">Detalle de la denuncia</label>
            <textarea id="reportDetails" required placeholder="Describe lo ocurrido con el mayor detalle posible..."></textarea>
          </div>
          <div class="form-group">
            <label for="reportEmail">Tu correo de contacto</label>
            <input type="email" id="reportEmail" required placeholder="tu@email.com" value="${CURRENT_USER.email}">
          </div>
          <button type="submit" class="btn btn-danger">Enviar denuncia</button>
        </form>
      </div>
    </section>`;

  document.getElementById("reportForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const type = document.getElementById("reportType").value;
    const listingRef = document.getElementById("reportListingId").value;
    const details = document.getElementById("reportDetails").value.trim();
    const email = document.getElementById("reportEmail").value.trim();

    addReport({ type, listingId: listingRef || null, details, email });
    showToast("Denuncia enviada. Gracias por ayudar a mantener la comunidad segura.");
    location.hash = "#/terminos";
  });
}

document.getElementById("navToggle").addEventListener("click", () => {
  const nav = document.querySelector(".main-nav");
  const btn = document.getElementById("navToggle");
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});

window.addEventListener("hashchange", render);
render();
