// Global variables for modal functionality
let currentImageIndex = 0;
let imageList = [];
let currentScale = 1;
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
let currentProgram = null;
let lastDirection = '';

// Function to open the modal with the selected image
function openModal(imageSrc, program) {
  currentProgram = program;
  imageList = program.screenshots || [];
  currentImageIndex = imageList.indexOf(imageSrc);
  
  if (currentImageIndex === -1) currentImageIndex = 0;
  
  // Reset zoom and position
  currentScale = 1;
  updateImageTransform();
  
  // Get modal elements
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  
  // Set the image source and update the counter
  modalImage.src = imageList[currentImageIndex];
  updateCounter();
  
  // Prevent background scrolling
  document.body.style.overflow = 'hidden';
  
  // Show the modal with a smooth fade-in effect
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.add('opacity-100');
    // Ensure the modal is properly positioned after the transition
    adjustModalContent();
  }, 10);
  
  // Update image source and counter
  updateModalImage();
  
  // Add window resize listener to adjust modal on window resize
  window.addEventListener('resize', adjustModalContent);
}

// Function to update the modal image with animation
function updateModalImage() {
  const modalImage = document.getElementById('modalImage');
  if (!modalImage || !imageList[currentImageIndex]) return;
  
  modalImage.src = imageList[currentImageIndex];
  
  // Add animation class based on direction
  modalImage.classList.remove('slide-in-left', 'slide-in-right');
  void modalImage.offsetWidth; // Trigger reflow
  
  // Add appropriate animation class
  const direction = lastDirection === 'next' ? 'slide-in-right' : 'slide-in-left';
  modalImage.classList.add(direction);
}

// Function to adjust modal content to fit the viewport
function adjustModalContent() {
  const modal = document.getElementById('imageModal');
  const modalContent = modal.querySelector('div > div'); // The inner container
  const modalImage = document.getElementById('modalImage');
  
  if (!modal || !modalContent || !modalImage) return;
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate maximum dimensions (90% of viewport with some padding)
  const maxWidth = Math.min(viewportWidth * 0.95, modalImage.naturalWidth || viewportWidth * 0.9);
  const maxHeight = viewportHeight * 0.9;
  
  // Apply max dimensions to the content container
  modalContent.style.maxWidth = `${maxWidth}px`;
  modalContent.style.maxHeight = `${maxHeight}px`;
  
  // Reset transform to ensure proper positioning
  modalImage.style.transform = `scale(${currentScale})`;
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('imageModal');
  
  // Remove the opacity class for the fade-out effect
  modal.classList.remove('opacity-100');
  
  // Wait for the transition to complete before hiding
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Reset zoom when closing
    currentScale = 1;
    updateImageTransform();
    
    // Remove the resize event listener
    window.removeEventListener('resize', adjustModalContent);
  }, 200); // Match this with the CSS transition duration
}

// Function to navigate to the next image
function nextImage() {
  if (imageList.length <= 1) return;
  
  lastDirection = 'next';
  currentImageIndex = (currentImageIndex + 1) % imageList.length;
  updateModalImage();
  updateCounter();
}

// Function to navigate to the previous image
function prevImage() {
  if (imageList.length <= 1) return;
  
  lastDirection = 'prev';
  currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
  updateModalImage();
  updateCounter();
}

// Function to update the image counter
function updateCounter() {
  const counter = document.getElementById('imageCounter');
  if (counter && imageList.length > 0) {
    counter.textContent = `${currentImageIndex + 1}/${imageList.length}`;
  }
}

// Function to zoom in/out
function zoom(scaleFactor) {
  currentScale *= scaleFactor;
  updateImageTransform();
}

// Function to update image transform (zoom and pan)
function updateImageTransform() {
  const modalImage = document.getElementById('modalImage');
  if (modalImage) {
    modalImage.style.transform = `scale(${currentScale})`;
  }
}

// Function to download the current image
function downloadCurrentImage() {
  if (!currentProgram || !imageList[currentImageIndex]) return;
  
  const link = document.createElement('a');
  link.href = imageList[currentImageIndex];
  link.download = `${currentProgram.title.replace(/\s+/g, '_')}_screenshot_${currentImageIndex + 1}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Store programs data by ID
const programsCache = {};

// Initialize modal event listeners
function initModal() {
  // Close modal when clicking outside the image
  const modal = document.getElementById('imageModal');
  const modalContent = document.querySelector('#imageModal > div');
  
  // Handle gallery item clicks using event delegation
  document.addEventListener('click', (e) => {
    const galleryItem = e.target.closest('.gallery-item');
    if (galleryItem) {
      e.preventDefault();
      const src = galleryItem.getAttribute('data-src');
      const programId = galleryItem.getAttribute('data-program-id');
      const program = programsCache[programId];
      if (program) {
        openModal(src, program);
      }
    }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close button
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Navigation buttons
  const prevBtn = document.getElementById('prevImage');
  const nextBtn = document.getElementById('nextImage');
  
  if (prevBtn) prevBtn.addEventListener('click', prevImage);
  if (nextBtn) nextBtn.addEventListener('click', nextImage);
  
  // Zoom buttons
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoom(1.2));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoom(1/1.2));
  
  // Download button
  const downloadBtn = document.getElementById('downloadImage');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCurrentImage);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('hidden')) {
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case '+':
        case '=':
          zoom(1.2);
          break;
        case '-':
        case '_':
          zoom(1/1.2);
          break;
        case '0':
          currentScale = 1;
          updateImageTransform();
          break;
      }
    }
  });
  
  // Mouse wheel for zoom
  const modalImage = document.getElementById('modalImage');
  if (modalImage) {
    modalImage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY || e.wheelDelta;
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        e.preventDefault();
        const zoomFactor = delta > 0 ? 1/1.1 : 1.1;
        zoom(zoomFactor);
      } else if (currentScale > 1) {
        // Pan when zoomed in
        const container = modalImage.parentElement;
        container.scrollLeft -= delta * 0.5;
      } else {
        // Navigate between images when not zoomed
        if (delta > 0) {
          nextImage();
        } else {
          prevImage();
        }
      }
    }, { passive: false });
    
    // Drag to pan when zoomed in
    modalImage.addEventListener('mousedown', (e) => {
      if (currentScale <= 1) return;
      
      isDragging = true;
      startX = e.pageX - modalImage.offsetLeft;
      startY = e.pageY - modalImage.offsetTop;
      scrollLeft = modalImage.scrollLeft;
      scrollTop = modalImage.scrollTop;
      modalImage.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const x = e.pageX - modalImage.offsetLeft;
      const y = e.pageY - modalImage.offsetTop;
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;
      
      const container = modalImage.parentElement;
      container.scrollLeft = scrollLeft - walkX;
      container.scrollTop = scrollTop - walkY;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      if (modalImage) {
        modalImage.style.cursor = currentScale > 1 ? 'grab' : 'default';
      }
    });
    
    // Reset cursor when mouse leaves the modal
    modal.addEventListener('mouseleave', () => {
      isDragging = false;
      if (modalImage) {
        modalImage.style.cursor = currentScale > 1 ? 'grab' : 'default';
      }
    });
  }
}

// Main function to load program details
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get("id");

  if (!programId) {
    window.location.href = "index.html";
    return;
  }
  
  // Store the program in cache when loaded
  const storeProgramInCache = (program) => {
    if (program && program.id) {
      programsCache[program.id] = program;
    }
    return program;
  };

  // Initialize the modal
  initModal();

  // Load program data
  fetch("data/programs.json")
    .then((response) => response.json())
    .then((programs) => {
      const program = programs.find((p) => p.id === programId);

      if (!program) {
        // Redirect to home if program is not found
        window.location.href = "index.html";
        return;
      }
      
      // Store the program in cache
      storeProgramInCache(program);

      const container = document.getElementById("program-details-section");
      container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Header Section -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-12 text-white">
            <div class="max-w-4xl mx-auto">
              <div class="flex flex-col md:flex-row md:items-center gap-8">
                <div class="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0 flex items-center justify-center">
                  <img src="${program.icon}" alt="${program.title}" class="w-14 h-14 object-contain">
                </div>
                <div>
                  <h1 class="text-3xl md:text-4xl font-bold mb-2">${program.title}</h1>
                  <p class="text-indigo-100 text-lg">${program.description}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="p-8 md:p-12">
            <div class="max-w-4xl mx-auto">
              <!-- Description Section -->
              <section class="mb-12">
                <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span class="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                  About This Project
                </h2>
                <div class="prose max-w-none text-gray-600">
                  <p class="text-lg leading-relaxed">${program.long_description}</p>
                </div>
              </section>
              
              <!-- Screenshots Section -->
              <section class="mb-12">
                <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span class="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                  Gallery
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-container">
                  ${program.screenshots
                    .map(
                      (src, index) => `
                      <div class="group relative overflow-hidden rounded-xl shadow-md cursor-pointer gallery-item" 
                           data-src="${src}" 
                           data-program-id="${program.id}">
                        <img 
                          src="${src}" 
                          alt="Screenshot ${index + 1}" 
                          class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                        >
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span class="text-white font-medium">View Full Size</span>
                        </div>
                      </div>`
                    )
                    .join("")}
                </div>
              </section>
              
              <!-- Download Section -->
              <section class="bg-indigo-50 rounded-2xl p-8 text-center mx-4 sm:mx-8 lg:mx-20">
                <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
                <p class="text-gray-600 mb-6 max-w-2xl mx-auto text-base sm:text-lg">
                  Download ${program.title} now and experience the difference for yourself.
                </p>
                <a href="${program.download_link}" class="btn-primary inline-block" target="_blank" rel="noopener noreferrer">
                  Download Now
                </a>
              </section>
            </div>
          </div>
        </div>
      `;
    })
    .catch((error) => {
      console.error("Error loading program details:", error);
      // Redirect to home if there's an error
      window.location.href = "index.html";
    });
});
