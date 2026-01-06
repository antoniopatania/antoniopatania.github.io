window.Site = (() => {
  function qs(name){
    return new URLSearchParams(window.location.search).get(name);
  }

  async function fetchWorks(url){
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) throw new Error("Impossibile caricare works.json");
    return await res.json();
  }

  function yearBucket(y){
    if (y === 2021 || y === "2021") return "2021";
    if (y === 2020 || y === "2020") return "2020";
    return "other";
  }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function cardHtml(w, basePath=""){
    const subtitle = `${w.year}${w.medium ? " · " + w.medium : ""}`;
    return `
      <a class="card" href="${basePath}opera.html?id=${encodeURIComponent(w.id)}">
        <img src="/${String(w.image).replace(/^\/+/, "")}" alt="${escapeHtml(w.title)}" loading="lazy">
        <div class="cap">
          <div class="t">${escapeHtml(w.title)}</div>
          <div class="s">${escapeHtml(subtitle)}</div>
        </div>
      </a>
    `;
  }

  function wireFilters(works, gridEl, basePath=""){
    const chips = Array.from(document.querySelectorAll(".chip"));
    function render(year){
      const filtered = year === "all" ? works : works.filter(w => yearBucket(w.year) === year);
      gridEl.innerHTML = filtered.map(w => cardHtml(w, basePath)).join("");
    }
    chips.forEach(ch => {
      ch.addEventListener("click", () => {
        chips.forEach(x => x.classList.remove("active"));
        ch.classList.add("active");
        render(ch.dataset.year);
      });
    });
    render("all");
  }

  async function initGallery({ dataUrl, gridId, basePath="" }){
    const gridEl = document.getElementById(gridId);
    const works = await fetchWorks(dataUrl);
    wireFilters(works, gridEl, basePath);
  }

  async function initSingle({ dataUrl, basePath="" }){
    const id = qs("id");
    const works = await fetchWorks(dataUrl);
    const w = works.find(x => String(x.id) === String(id)) || works[0];

    const img = document.getElementById("img");
    const title = document.getElementById("title");
    const line1 = document.getElementById("line1");
    const line2 = document.getElementById("line2");

    img.src = `${basePath}${w.image}`;
    img.alt = w.title;

    title.textContent = w.title;
    line1.textContent = `${w.year}${w.medium ? " · " + w.medium : ""}`;
    line2.textContent = `${w.size || ""}`.trim();

    document.title = `${w.title} — Antonio Patania`;
  }

  return { initGallery, initSingle };
})();
