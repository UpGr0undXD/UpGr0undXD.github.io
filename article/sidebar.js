const sidebarList = document.getElementById("article-sidebar-list");

if (sidebarList) {
  const currentPath = window.location.pathname;

  fetch("/notes/notes.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load notes list");
      }
      return response.json();
    })
    .then((items) => {
      items.forEach((item) => {
        const link = document.createElement("a");
        const url = item.url.startsWith("/") ? item.url : "/" + item.url;

        link.href = url;
        link.className = "article-link" + (currentPath === url ? " active" : "");
        link.innerHTML = `
          <span class="article-date">${item.date}</span>
          <strong>${item.title}</strong>
        `;

        sidebarList.appendChild(link);
      });
    })
    .catch((error) => {
      console.error("Sidebar load error:", error);
      sidebarList.innerHTML = '<p class="article-sidebar-empty">文章列表加载失败。</p>';
    });
}
