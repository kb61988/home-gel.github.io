// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Анимация
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav');
    if (mobileMenuBtn && navMenu) {
        function closeMenu() {
            navMenu.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
        }
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !navMenu.classList.contains('active');
            navMenu.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', String(willOpen));
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-times', willOpen); icon.classList.toggle('fa-bars', !willOpen);
        });
        document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', closeMenu));
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) closeMenu();
        });
    }

    // 3. Модалки
    const modal = document.getElementById('callbackModal');
    const privacyModal = document.getElementById('privacyModal');
    const termsModal = document.getElementById('termsModal');
    
    window.openModal = function(m) { if(m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; } }
    window.closeModal = function(m) { if(m) { m.classList.remove('active'); document.body.style.overflow = ''; } }

    document.querySelectorAll('.open-modal-btn').forEach(btn => btn.addEventListener('click', () => window.openModal(modal)));
    if(document.querySelector('.close-callback')) document.querySelector('.close-callback').addEventListener('click', () => window.closeModal(modal));
    document.querySelectorAll('.open-privacy').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); window.openModal(privacyModal); }));
    if(document.querySelector('.close-privacy')) document.querySelector('.close-privacy').addEventListener('click', () => window.closeModal(privacyModal));
    document.querySelectorAll('.open-terms').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); window.openModal(termsModal); }));
    if(document.querySelector('.close-terms')) document.querySelector('.close-terms').addEventListener('click', () => window.closeModal(termsModal));

    [modal, privacyModal, termsModal].forEach(m => {
        if(m) window.addEventListener('click', (e) => { if (e.target === m) window.closeModal(m); });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') [modal, privacyModal, termsModal].forEach(m => window.closeModal(m));
    });

    // 4. FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // 5. Карта
    const loadMapBtn = document.getElementById('loadMapBtn');
    if(loadMapBtn) {
        loadMapBtn.addEventListener('click', function () {
            const frame = document.getElementById('mapFrame');
            frame.src = 'https://yandex.ru/map-widget/v1/?ll=38.076389%2C44.562222&z=12';
            frame.style.display = 'block';
            document.getElementById('mapPlaceholder').style.display = 'none';
        });
    }

    // 6. Формы
    function handleFormSubmit(formId, messageId) {
        const form = document.getElementById(formId);
        if (!form) return;
        const msgDiv = messageId ? document.getElementById(messageId) : null;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Отправка...';
            submitBtn.disabled = true;

            fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if(msgDiv) { msgDiv.style.color = '#2ecc71'; msgDiv.innerText = 'Спасибо! Заявка отправлена.'; }
                    form.reset();
                    if (formId === 'modalForm') setTimeout(() => window.closeModal(modal), 2500);
                } else {
                    if(msgDiv) { msgDiv.style.color = '#e74c3c'; msgDiv.innerText = 'Ошибка. Позвоните нам: 8-938-434-0-333.'; }
                }
            })
            .catch(() => {
                if(msgDiv) { msgDiv.style.color = '#e74c3c'; msgDiv.innerText = 'Ошибка сети. Позвоните нам: 8-938-434-0-333.'; }
            })
            .finally(() => { submitBtn.innerText = originalText; submitBtn.disabled = false; });
        });
    }
    handleFormSubmit('requestForm', 'formMessage');
    handleFormSubmit('modalForm', 'modalMessage');
});
