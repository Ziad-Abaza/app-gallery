document.addEventListener("DOMContentLoaded", () => {
  fetch("data/programs.json")
    .then((response) => response.json())
    .then((programs) => {
      const container = document.getElementById("programs-container");
      container.innerHTML = "";

      programs.forEach((program, index) => {
        const programCard = document.createElement("div");
        programCard.className =
          "card program-card bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col";
        programCard.style.animation = `fadeInUp 0.5s forwards`;
        programCard.style.animationDelay = `${index * 0.1}s`; // تأثير متدرج

        programCard.innerHTML = `
          <a href="program_details.html?id=${program.id}" class="p-6 flex-1 flex flex-col items-center text-center">
            <div class="icon-container mb-4">
              <img src="${program.icon}" alt="${program.title} icon" class="w-16 h-16 object-contain">
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">${program.title}</h2>
            <p class="text-gray-600 mb-4 flex-1">${program.description}</p>
            <div class="mt-auto">
             <button class="btn-primary relative px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors w-64">
              <span class="block text-center">View Details</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-4 right-4  h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            </div>
          </a>
        `;
        container.appendChild(programCard);
      });
    })
    .catch((error) => console.error("Error fetching programs:", error));
});
