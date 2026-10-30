// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Анимация появления
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { 
                entry.target.classList.add('active'); 
                observer.unobserve(entry.target); 
            }
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
            if(icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
        }
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !navMenu.classList.contains('active');
            navMenu.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', String(willOpen));
            const icon = mobileMenuBtn.querySelector('i');
            if(icon) { icon.classList.toggle('fa-times', willOpen); icon.classList.toggle('fa-bars', !willOpen); }
        });
        document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', closeMenu));
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) closeMenu();
        });
    }

    // 3. Модальные окна
    const modal = document.getElementById('callbackModal');
    const privacyModal = document.getElementById('privacyModal');
    const termsModal = document.getElementById('termsModal');
    
    function openModal(m) { 
        if(m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; } 
    }
    function closeModal(m) { 
        if(m) { m.classList.remove('active'); document.body.style.overflow = ''; } 
    }

    document.querySelectorAll('.open-modal-btn').forEach(btn => btn.addEventListener('click', () => openModal(modal)));
    if(document.querySelector('.close-callback')) document.querySelector('.close-callback').addEventListener('click', () => closeModal(modal));
    
    document.querySelectorAll('.open-privacy').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openModal(privacyModal); }));
    if(document.querySelector('.close-privacy')) document.querySelector('.close-privacy').addEventListener('click', () => closeModal(privacyModal));
    
    document.querySelectorAll('.open-terms').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openModal(termsModal); }));
    if(document.querySelector('.close-terms')) document.querySelector('.close-terms').addEventListener('click', () => closeModal(termsModal));

    [modal, privacyModal, termsModal].forEach(m => {
        if(m) window.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') [modal, privacyModal, termsModal].forEach(m => closeModal(m));
    });

    // 4. FAQ (Аккордеон)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if(!question || !answer) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if(otherAnswer) otherAnswer.style.maxHeight = '0px'; // Исправлено с null на 0px
                const otherQuestion = otherItem.querySelector('.faq-question');
                if(otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // 5. Отложенная загрузка карты
    const loadMapBtn = document.getElementById('loadMapBtn');
    if(loadMapBtn) {
        loadMapBtn.addEventListener('click', function () {
            const frame = document.getElementById('mapFrame');
            if(frame) {
                frame.src = 'https://yandex.ru/map-widget/v1/?ll=38.076389%2C44.562222&z=12';
                frame.style.display = 'block';
            }
            const placeholder = document.getElementById('mapPlaceholder');
            if(placeholder) placeholder.style.display = 'none';
        });
    }

    // 6. Обработка форм (с проверкой статуса ответа)
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
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    if(msgDiv) { msgDiv.style.color = '#2ecc71'; msgDiv.innerText = 'Спасибо! Заявка отправлена.'; }
                    form.reset();
                    if (formId === 'modalForm') setTimeout(() => closeModal(modal), 2500);
                } else {
                    if(msgDiv) { msgDiv.style.color = '#e74c3c'; msgDiv.innerText = 'Ошибка. Позвоните нам: 8-938-434-0-333.'; }
                }
            })
            .catch((err) => {
                console.error(err);
                if(msgDiv) { msgDiv.style.color = '#e74c3c'; msgDiv.innerText = 'Ошибка сети. Позвоните нам: 8-938-434-0-333.'; }
            })
            .finally(() => { 
                submitBtn.innerText = originalText; 
                submitBtn.disabled = false; 
            });
        });
    }
    handleFormSubmit('requestForm', 'formMessage');
    handleFormSubmit('modalForm', 'modalMessage');
});
