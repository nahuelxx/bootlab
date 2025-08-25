document.addEventListener('DOMContentLoaded', () => {
    
    // --- State ---
    let cartItemCount = 0;
    let carouselInterval;

    // --- Element Selectors ---
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const btnCart = document.getElementById('btnCart');
    const cartCount = document.getElementById('cartCount');
    const btnLogin = document.getElementById('btnLogin');
    const loginDropdown = document.getElementById('loginDropdown');
    const btnAsesoramiento = document.getElementById('btnAsesoramiento');
    const addToCartButtons = document.querySelectorAll('.btn-add');
    const allProductCards = document.querySelectorAll('#gridDestacados .card, #gridOutlet .card');
    
    const modalOverlay = document.getElementById('modalOverlay');
    const loginModal = document.getElementById('loginModal');
    const cartModal = document.getElementById('cartModal');
    const asesoramientoModal = document.getElementById('asesoramientoModal');
    const allCloseButtons = document.querySelectorAll('.btn-close-modal');

    const navLinks = document.querySelectorAll('#navSecondary a, .carousel-caption a, #footer a');

    // --- Carousel ---
    const carousel = {
        items: document.querySelectorAll('.carousel-item'),
        indicatorsContainer: document.querySelector('.carousel-indicators'),
        nextBtn: document.querySelector('.carousel-control.next'),
        prevBtn: document.querySelector('.carousel-control.prev'),
        currentIndex: 0,
        
        init() {
            if (!this.items.length) return;
            this.items.forEach((_, index) => {
                const indicator = document.createElement('button');
                indicator.classList.add('indicator');
                indicator.dataset.index = index;
                if (index === 0) indicator.classList.add('active');
                this.indicatorsContainer.appendChild(indicator);
            });
            
            this.nextBtn.addEventListener('click', () => this.showItem(this.currentIndex + 1));
            this.prevBtn.addEventListener('click', () => this.showItem(this.currentIndex - 1));
            this.indicatorsContainer.addEventListener('click', (e) => {
                if (e.target.matches('.indicator')) {
                    this.showItem(parseInt(e.target.dataset.index));
                }
            });
            
            this.startAutoPlay();
            document.getElementById('carousel').addEventListener('mouseenter', () => clearInterval(carouselInterval));
            document.getElementById('carousel').addEventListener('mouseleave', () => this.startAutoPlay());
        },

        showItem(index) {
            this.items[this.currentIndex].classList.remove('active');
            if(this.indicatorsContainer.children[this.currentIndex]) {
               this.indicatorsContainer.children[this.currentIndex].classList.remove('active');
            }
            
            if (index >= this.items.length) {
                this.currentIndex = 0;
            } else if (index < 0) {
                this.currentIndex = this.items.length - 1;
            } else {
                this.currentIndex = index;
            }
            
            this.items[this.currentIndex].classList.add('active');
            if(this.indicatorsContainer.children[this.currentIndex]) {
                this.indicatorsContainer.children[this.currentIndex].classList.add('active');
            }
        },

        startAutoPlay() {
            carouselInterval = setInterval(() => {
                this.showItem(this.currentIndex + 1);
            }, 5000);
        }
    };

    // --- Functions ---
    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = searchQuery.value.trim().toLowerCase();
        console.log('buscar:', searchTerm);

        allProductCards.forEach(card => {
            const productName = card.dataset.name.toLowerCase();
            const isVisible = productName.includes(searchTerm);
            card.style.display = isVisible ? 'flex' : 'none';
            
            if (isVisible && searchTerm) {
                card.classList.add('highlight');
            } else {
                card.classList.remove('highlight');
            }
        });
    };

    const addToCart = (sku) => {
        cartItemCount++;
        cartCount.textContent = cartItemCount;
        console.log('add', sku);
        
        btnCart.style.transform = 'scale(1.2)';
        setTimeout(() => {
            btnCart.style.transform = 'scale(1)';
        }, 200);
    };

    const openModal = (modal) => {
        modalOverlay.classList.remove('hidden');
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modalOverlay.classList.add('hidden');
        loginModal.classList.add('hidden');
        cartModal.classList.add('hidden');
        asesoramientoModal.classList.add('hidden');
    };

    const openCart = () => {
        console.log('Abriendo modal de carrito...');
        openModal(cartModal);
    };

    const openAsesoramiento = () => {
        console.log('Abriendo modal de asesoramiento...');
        openModal(asesoramientoModal);
    };

    const toggleLoginDropdown = () => {
        loginDropdown.classList.toggle('hidden');
    };

    const scrollToHash = (e) => {
        const href = e.currentTarget.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('.header-container').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    // --- Event Listeners ---
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
        searchQuery.addEventListener('input', handleSearch);
    }

    if (btnLogin) {
        btnLogin.addEventListener('click', toggleLoginDropdown);
    }
    
    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!btnLogin.contains(e.target) && !loginDropdown.contains(e.target)) {
            loginDropdown.classList.add('hidden');
        }
    });

    if (btnCart) {
        btnCart.addEventListener('click', openCart);
    }

    if (btnAsesoramiento) {
        btnAsesoramiento.addEventListener('click', openAsesoramiento);
    }

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sku = e.currentTarget.dataset.sku;
            addToCart(sku);
        });
    });

    allCloseButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', scrollToHash);
    });

    // --- Initialization ---
    carousel.init();
});
