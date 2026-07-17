/* main.js - CyberPeace Redesign Interactions & Animations */

// Dynamically inject api.js if not loaded to secure API support across all subpages
if (!window.apiService) {
    const apiScript = document.createElement('script');
    apiScript.src = 'api.js';
    apiScript.async = false;
    document.head.appendChild(apiScript);
}

document.addEventListener("DOMContentLoaded", () => {
    initLenis();
    initNavbarScroll();
    initCanvasParticles();
    initVantaGlobe();
    initAccordions();
    initTabs();
    initCardTilt();
    initScrollAnimations();
    initStatsCounter();
    initCookieBanner();
    initMobileMenu();
    
    // Subpage initializers
    initSubpageTabs();
    initForms();
    initFilters();
    initBackToTop();
});

/* ---------------------------------------------------- */
/* LENIS SMOOTH SCROLL                                 */
/* ---------------------------------------------------- */
let lenis;
function initLenis() {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }
}

/* ---------------------------------------------------- */
/* NAVBAR SCROLL ACTION                                 */
/* ---------------------------------------------------- */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar-wrapper');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ---------------------------------------------------- */
/* CANVAS PARTICLE GRID BACKGROUND                      */
/* ---------------------------------------------------- */
function initCanvasParticles() {
    const canvas = document.getElementById('grid-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Track mouse position
    let mouse = { x: null, y: null, radius: 180 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Mesh gradient blobs - Google Cloud / Microsoft Build bright dynamic mesh style
    class GradientBlob {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -this.radius || this.x > width + this.radius) this.vx *= -1;
            if (this.y < -this.radius || this.y > height + this.radius) this.vy *= -1;
        }
    }

    const blobs = [
        new GradientBlob(width * 0.25, height * 0.25, Math.min(width, height) * 0.7, 'rgba(59, 130, 246, 0.12)'),   // Azure Blue
        new GradientBlob(width * 0.75, height * 0.35, Math.min(width, height) * 0.6, 'rgba(124, 58, 237, 0.12)'),   // Soft Purple
        new GradientBlob(width * 0.35, height * 0.75, Math.min(width, height) * 0.5, 'rgba(6, 182, 212, 0.12)'),   // Tech Cyan
        new GradientBlob(width * 0.8, height * 0.8, Math.min(width, height) * 0.55, 'rgba(236, 72, 153, 0.08)')     // Soft Pink / Rose
    ];

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.radius = Math.random() * 2 + 0.5;
            this.pulse = Math.random() * Math.PI;
            this.color = Math.random() > 0.5 ? 'rgba(124, 58, 237, 0.2)' : 'rgba(37, 99, 235, 0.25)';
        }

        draw() {
            this.pulse += 0.02;
            let radiusMultiplier = Math.sin(this.pulse) * 0.3 + 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * radiusMultiplier, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce on boundary
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * 10 * (this.radius * 0.5);
                    this.y -= (dy / distance) * force * 10 * (this.radius * 0.5);
                }
            }
        }
    }

    // Binary code nodes at grid intersections
    class BinaryCode {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.value = Math.random() > 0.5 ? '1' : '0';
            this.opacity = Math.random() * 0.12;
            this.fadeDir = Math.random() > 0.5 ? 1 : -1;
            this.fadeSpeed = 0.002 + Math.random() * 0.004;
        }

        update() {
            this.opacity += this.fadeSpeed * this.fadeDir;
            if (this.opacity <= 0.02) {
                this.opacity = 0.02;
                this.fadeDir = 1;
                this.value = Math.random() > 0.5 ? '1' : '0';
            } else if (this.opacity >= 0.15) {
                this.opacity = 0.15;
                this.fadeDir = -1;
            }
        }

        draw() {
            ctx.fillStyle = `rgba(37, 99, 235, ${this.opacity})`;
            ctx.font = '7px monospace';
            ctx.fillText(this.value, this.x, this.y);
        }
    }

    // Populate particles
    const particleCount = Math.min(60, Math.floor((width * height) / 26000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Generate grid node coordinates
    const gridNodes = [];
    const gridSize = 80;
    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            if (Math.random() > 0.85) {
                gridNodes.push(new BinaryCode(x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10)));
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw fluid mesh gradients
        blobs.forEach(b => {
            b.update();
            let radGrd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
            radGrd.addColorStop(0, b.color);
            radGrd.addColorStop(1, 'transparent');
            ctx.fillStyle = radGrd;
            ctx.fillRect(0, 0, width, height);
        });

        // Draw grid lines
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.03)';
        ctx.lineWidth = 0.8;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    let opacity = (1 - (dist / 140)) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        // Update and draw grid nodes
        gridNodes.forEach(node => {
            node.update();
            node.draw();
        });

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ---------------------------------------------------- */
/* VANTA.JS 3D ROTATING COORDINATE GLOBE                */
/* ---------------------------------------------------- */
function initVantaGlobe() {
    const target = document.getElementById('vanta-globe-viewport');
    if (!target) return;

    VANTA.GLOBE({
        el: "#vanta-globe-viewport",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x7c3aec,          // Vibrant Tech Purple nodes
        color2: 0x2563eb,         // Electric Azure connections
        backgroundColor: 0xfafbfd // Blends seamlessly with pure off-white page background
    });
}

/* ---------------------------------------------------- */
/* ACCORDION MENU INTERACTIONS                         */
/* ---------------------------------------------------- */
function initAccordions() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        const icon = trigger.querySelector('.accord-icon');

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Collapse all
            accordionItems.forEach(i => {
                i.classList.remove('active');
                const tri = i.querySelector('.accord-icon');
                if (tri) {
                    tri.classList.remove('fa-chevron-up');
                    tri.classList.add('fa-chevron-down');
                }
            });

            // Toggle selected
            if (!isActive) {
                item.classList.add('active');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
}

/* ---------------------------------------------------- */
/* TABS PANES SYSTEM SWITCHER                           */
/* ---------------------------------------------------- */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            // Toggle buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle content panes
            tabPanes.forEach(pane => {
                if (pane.id === targetId) {
                    pane.classList.add('active');
                    gsap.fromTo(pane, 
                        { opacity: 0, y: 15 }, 
                        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
                    );
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

/* ---------------------------------------------------- */
/* CARDS 3D MOUSE HOVER TILT                           */
/* ---------------------------------------------------- */
function initCardTilt() {
    const tiltElements = document.querySelectorAll('.hover-tilt');
    
    // Disable on touch devices
    if ('ontouchstart' in window) return;

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate inside element
            const y = e.clientY - rect.top;  // y coordinate inside element
            
            // Normalize inputs
            const px = x / rect.width;
            const py = y / rect.height;
            
            // Rotation amount (-8 to 8 deg)
            const rx = (py - 0.5) * -12;
            const ry = (px - 0.5) * 12;

            el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

/* ---------------------------------------------------- */
/* STATS COUNT ANIMATOR                                 */
/* ---------------------------------------------------- */
function initStatsCounter() {
    const nums = document.querySelectorAll('.stat-num');
    
    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseInt(target.getAttribute('data-val'), 10);
                const suffix = target.innerText.replace(/[0-9]/g, ''); // Extract + / M+ suffix
                
                let start = 0;
                const duration = 2000; // 2 seconds
                const startTime = performance.now();

                function updateCount(timestamp) {
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing formula (outQuad)
                    const easedProgress = progress * (2 - progress);
                    const currentVal = Math.floor(easedProgress * endVal);
                    
                    target.innerText = currentVal.toLocaleString() + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        target.innerText = endVal.toLocaleString() + suffix;
                    }
                }

                requestAnimationFrame(updateCount);
                observer.unobserve(target); // Animate once
            }
        });
    }, { threshold: 0.1 });

    nums.forEach(num => countObserver.observe(num));
}

/* ---------------------------------------------------- */
/* GSAP SCROLL ENTRANCE REVEAL                          */
/* ---------------------------------------------------- */
function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero title fade
    gsap.fromTo('.hero-title', 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power4.out' }
    );
    gsap.fromTo('.hero-subtitle', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo('.hero-desc', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power4.out' }
    );
    gsap.fromTo('.hero-actions', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' }
    );

    // Section triggers
    const sections = ['.explore-section', '.blogs-section', '.resources-tab-section', '.best-section', '.volunteer-section', '.socials-section', '.recommended-section'];
    sections.forEach(sec => {
        gsap.from(sec + ' .section-heading, ' + sec + ' .explore-text, ' + sec + ' .resources-subtitle, ' + sec + ' .recommended-header', {
            scrollTrigger: {
                trigger: sec,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.85,
            ease: 'power3.out'
        });
    });

    // Staggered reveals for cards
    ScrollTrigger.batch('.blog-item-card, .best-card-item, .social-card, .rec-column', {
        start: 'top 85%',
        onEnter: batch => gsap.fromTo(batch, 
            { opacity: 0, y: 40 }, 
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', overwrite: 'auto' }
        )
    });
}

/* ---------------------------------------------------- */
/* COOKIE PREFERENCES SYSTEM BANNER                     */
/* ---------------------------------------------------- */
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const allowBtn = document.getElementById('allow-cookies');
    const denyBtn = document.getElementById('deny-cookies');

    // Check if consent already given
    if (localStorage.getItem('cyberpeace-cookie-consent')) {
        banner.classList.remove('active');
    } else {
        banner.classList.add('active');
    }

    if (allowBtn) {
        allowBtn.addEventListener('click', () => {
            localStorage.setItem('cyberpeace-cookie-consent', 'accepted');
            banner.classList.remove('active');
        });
    }

    if (denyBtn) {
        denyBtn.addEventListener('click', () => {
            localStorage.setItem('cyberpeace-cookie-consent', 'denied');
            banner.classList.remove('active');
        });
    }
}

/* ---------------------------------------------------- */
/* MOBILE MENU TOGGLE ACTION                           */
/* ---------------------------------------------------- */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.nav-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('mobile-active');
            toggle.classList.toggle('open');
            
            // If active, animate open menu
            if (menu.classList.contains('mobile-active')) {
                menu.style.display = 'flex';
                gsap.fromTo(menu, 
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                );
            } else {
                gsap.to(menu, {
                    opacity: 0,
                    y: -20,
                    duration: 0.25,
                    onComplete: () => {
                        menu.style.display = 'none';
                    }
                });
            }
        });
    }
}

/* ---------------------------------------------------- */
/* SUBPAGES PORTAL TABS SWITCHER                        */
/* ---------------------------------------------------- */
function initSubpageTabs() {
    // 1. Timeline journey tabs (About Us)
    const journeyBtns = document.querySelectorAll('.about-journey-btn[data-year]');
    const journeyPanes = document.querySelectorAll('.about-journey-pane');
    journeyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            journeyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetYear = btn.getAttribute('data-year');
            journeyPanes.forEach(pane => {
                if (pane.id === `pane-${targetYear}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    // 2. People tabs (About Us)
    const peopleBtns = document.querySelectorAll('#people-tabs .about-journey-btn');
    const peoplePanes = document.querySelectorAll('.people-pane');
    peopleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            peopleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetGroup = btn.getAttribute('data-group');
            peoplePanes.forEach(pane => {
                if (pane.id === `pane-${targetGroup}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    // 3. Support Us Tabs (Kind Donation vs. Sponsor Initiative)
    const tabKind = document.getElementById('btn-tab-kind');
    const tabSponsor = document.getElementById('btn-tab-sponsor');
    const formKind = document.getElementById('kind-donation-form');
    const formSponsor = document.getElementById('sponsor-form');
    if (tabKind && tabSponsor && formKind && formSponsor) {
        tabKind.addEventListener('click', () => {
            tabKind.classList.add('active');
            tabSponsor.classList.remove('active');
            formKind.style.display = 'block';
            formSponsor.style.display = 'none';
        });
        tabSponsor.addEventListener('click', () => {
            tabSponsor.classList.add('active');
            tabKind.classList.remove('active');
            formSponsor.style.display = 'block';
            formKind.style.display = 'none';
        });
    }

    // 4. Events Tabs (Events vs Campaigns)
    const tabEv = document.getElementById('btn-tab-events');
    const tabCamp = document.getElementById('btn-tab-campaigns');
    const panelEv = document.getElementById('events-panel');
    const panelCamp = document.getElementById('campaigns-panel');
    if (tabEv && tabCamp && panelEv && panelCamp) {
        tabEv.addEventListener('click', () => {
            tabEv.classList.add('active');
            tabCamp.classList.remove('active');
            panelEv.style.display = 'grid';
            panelCamp.style.display = 'none';
        });
        tabCamp.addEventListener('click', () => {
            tabCamp.classList.add('active');
            tabEv.classList.remove('active');
            panelCamp.style.display = 'grid';
            panelEv.style.display = 'none';
        });
    }

    // 5. FAQ Accordion (Support page)
    const faqItems = document.querySelectorAll('.faq-accordion-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        if (header) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

/* ---------------------------------------------------- */
/* FORMS SUBMISSION & FEEDBACK SYSTEM                   */
/* ---------------------------------------------------- */
function initForms() {
    // General Form Submission Handler
    async function handleFormSubmit(formEl, apiCall, feedbackEl) {
        if (!formEl) return;
        
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = formEl.querySelector('button[type="submit"], input[type="submit"]');
            const originalBtnText = submitBtn ? (submitBtn.value || submitBtn.innerHTML) : 'Submit';
            
            // Set disabled and loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                if (submitBtn.tagName === 'INPUT') {
                    submitBtn.value = 'Processing...';
                } else {
                    submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';
                }
            }
            
            // Clear previous feedback
            if (feedbackEl) {
                feedbackEl.className = 'form-feedback-msg';
                feedbackEl.style.display = 'none';
            }

            // Extract form data
            const formData = new FormData(formEl);
            const dataObj = Object.fromEntries(formData.entries());
            
            try {
                // Ensure api.js is loaded
                if (!window.apiService) {
                    throw new Error("API Service module is not initialized.");
                }
                
                const response = await apiCall(dataObj);
                
                // Show Success
                if (feedbackEl) {
                    feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${response.message || 'Submitted successfully!'}`;
                    feedbackEl.classList.add('success');
                }
                
                // Reset form
                formEl.reset();
            } catch (error) {
                // Show Error
                if (feedbackEl) {
                    feedbackEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${error.message || 'Something went wrong. Please try again.'}`;
                    feedbackEl.classList.add('error');
                }
            } finally {
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    if (submitBtn.tagName === 'INPUT') {
                        submitBtn.value = originalBtnText;
                    } else {
                        submitBtn.innerHTML = originalBtnText;
                    }
                }
            }
        });
    }

    // 1. Footer Newsletter Form
    const footerNlForm = document.getElementById('footer-newsletter-form');
    if (footerNlForm) {
        footerNlForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = footerNlForm.querySelector('input[type="email"]');
            const email = input.value;
            const submitBtn = footerNlForm.querySelector('button[type="submit"]');
            
            if (submitBtn) submitBtn.disabled = true;
            try {
                if (!window.apiService) throw new Error("API module not loaded yet.");
                const response = await window.apiService.submitNewsletter(email);
                alert(response.message);
                footerNlForm.reset();
            } catch (err) {
                alert(err.message);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    // 2. Newsletter Page Form
    handleFormSubmit(
        document.getElementById('newsletter-page-form'),
        (data) => window.apiService.submitNewsletter(data.email || document.getElementById('nl-email').value),
        document.getElementById('newsletter-page-feedback')
    );

    // 3. Donate in Kind Form
    handleFormSubmit(
        document.getElementById('kind-donation-form'),
        (data) => window.apiService.submitKindDonation(data),
        document.getElementById('kind-form-feedback')
    );

    // 4. Sponsorship Form
    handleFormSubmit(
        document.getElementById('sponsor-form'),
        (data) => window.apiService.submitSponsorship(data),
        document.getElementById('sponsor-form-feedback')
    );

    // 5. Volunteer Form
    handleFormSubmit(
        document.getElementById('volunteer-form'),
        (data) => window.apiService.submitVolunteer(data),
        document.getElementById('volunteer-form-feedback')
    );

    // 6. Interest Form
    handleFormSubmit(
        document.getElementById('interest-form'),
        (data) => window.apiService.submitInterest(data),
        document.getElementById('interest-form-feedback')
    );

    // 7. Grievance Form
    handleFormSubmit(
        document.getElementById('grievance-form'),
        (data) => window.apiService.submitGrievance(data),
        document.getElementById('grievance-form-feedback')
    );
}

/* ---------------------------------------------------- */
/* DYNAMIC FILTERS & SEARCH SYSTEMS                     */
/* ---------------------------------------------------- */
function initFilters() {
    // 1. Jobs Office Filter (Engage page)
    const officeFilter = document.getElementById('office-filter');
    const jobCards = document.querySelectorAll('.job-card');
    if (officeFilter) {
        officeFilter.addEventListener('change', () => {
            const selectedOffice = officeFilter.value;
            jobCards.forEach(card => {
                const office = card.getAttribute('data-office');
                if (selectedOffice === 'All' || office === selectedOffice) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 2. Initiatives Scope & Search Filter (Initiatives page)
    const scopeBtns = document.querySelectorAll('.filter-scope-btn');
    const initCards = document.querySelectorAll('.initiative-card');
    const initSearch = document.getElementById('initiative-search');
    let activeScope = 'All';

    function filterInitiatives() {
        const query = initSearch ? initSearch.value.toLowerCase().trim() : '';
        initCards.forEach(card => {
            const scope = card.getAttribute('data-scope');
            const tags = card.getAttribute('data-tags') || '';
            const title = card.querySelector('.initiative-title').innerText.toLowerCase();
            const desc = card.querySelector('.initiative-desc').innerText.toLowerCase();
            
            const matchScope = activeScope === 'All' || scope === activeScope;
            const matchQuery = !query || title.includes(query) || desc.includes(query) || tags.includes(query);
            
            if (matchScope && matchQuery) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    scopeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scopeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeScope = btn.getAttribute('data-scope');
            filterInitiatives();
        });
    });

    if (initSearch) {
        initSearch.addEventListener('input', filterInitiatives);
    }

    // 3. Events Search Filter (Events page)
    const eventSearch = document.getElementById('event-search');
    const eventCards = document.querySelectorAll('.event-item');
    if (eventSearch) {
        eventSearch.addEventListener('input', () => {
            const query = eventSearch.value.toLowerCase().trim();
            eventCards.forEach(card => {
                const title = card.querySelector('.initiative-title').innerText.toLowerCase();
                const desc = card.querySelector('.initiative-desc').innerText.toLowerCase();
                const tags = card.getAttribute('data-tags') || '';
                
                if (!query || title.includes(query) || desc.includes(query) || tags.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 4. Blogs Search, Category Filter, and Query Param Handler (Blogs page)
    const blogSearch = document.getElementById('blog-search');
    const blogCards = document.querySelectorAll('.blog-post');
    const catBtns = document.querySelectorAll('.filter-cat-btn');
    let activeCat = 'All';

    function filterBlogs() {
        const query = blogSearch ? blogSearch.value.toLowerCase().trim() : '';
        blogCards.forEach(card => {
            const cat = card.getAttribute('data-cat');
            const tags = card.getAttribute('data-tags') || '';
            const title = card.querySelector('.card-title').innerText.toLowerCase();
            
            const matchCat = activeCat === 'All' || cat === activeCat;
            const matchQuery = !query || title.includes(query) || tags.includes(query);
            
            if (matchCat && matchQuery) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCat = btn.getAttribute('data-cat');
            filterBlogs();
        });
    });

    if (blogSearch) {
        blogSearch.addEventListener('input', filterBlogs);
    }

    // Parse URL parameter query
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('query');
    if (searchParam && blogSearch) {
        blogSearch.value = searchParam;
        filterBlogs();
    }
}

/* ---------------------------------------------------- */
/* BACK TO TOP ARROW INTERACTION                        */
/* ---------------------------------------------------- */
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (lenis) {
            lenis.scrollTo(0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

