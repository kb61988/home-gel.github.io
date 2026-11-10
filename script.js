// script.js
document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. Анимация появления элементов (Reveal)
       ========================================== */
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /* ==========================================
       2. Мобильное меню
       ========================================== */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav');

    if (mobileMenuBtn && navMenu) {

        const closeMobileMenu = () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        };

        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !navMenu.classList.contains('active');

            navMenu.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', String(willOpen));

            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (willOpen) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !mobileMenuBtn.contains(e.target) &&
                !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    /* ==========================================
       3. Модальные окна + focus management
       ========================================== */
    const modals = {
        callback: document.getElementById('callbackModal'),
        privacy: document.getElementById('privacyModal'),
        terms: document.getElementById('termsModal')
    };

    let lastFocusedElement = null;

    const getFocusable = (modal) => {
        if (!modal) return [];
        return Array.from(modal.querySelectorAll(
            'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null);
    };

    const openModal = (modal) => {
        if (!modal) return;
        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const firstInput = modal.querySelector(
                'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, select'
            );
            const target = firstInput
                || modal.querySelector('.close-modal')
                || getFocusable(modal)[0];
            if (target) target.focus();
        }, 80);
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        if (!document.querySelector('.modal-overlay.active')) {
            document.body.style.overflow = '';
        }
        if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;
    };

    document.querySelectorAll('.open-modal-btn').forEach(btn =>
        btn.addEventListener('click', () => openModal(modals.callback))
    );
    document.querySelectorAll('.open-privacy').forEach(btn =>
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openModal(modals.privacy); })
    );
    document.querySelectorAll('.open-terms').forEach(btn =>
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openModal(modals.terms); })
    );

    if (document.querySelector('.close-callback')) document.querySelector('.close-callback').addEventListener('click', () => closeModal(modals.callback));
    if (document.querySelector('.close-privacy')) document.querySelector('.close-privacy').addEventListener('click', () => closeModal(modals.privacy));
    if (document.querySelector('.close-terms')) document.querySelector('.close-terms').addEventListener('click', () => closeModal(modals.terms));

    Object.values(modals).forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Object.values(modals).forEach(modal => closeModal(modal));
        }
        // Focus trap
        if (e.key === 'Tab') {
            const active = document.querySelector('.modal-overlay.active');
            if (!active) return;
            const focusables = getFocusable(active);
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        }
    });

    /* ==========================================
       4. FAQ (Аккордеон) — плавное открытие и закрытие
       ========================================== */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Закрываем все открытые
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) otherAnswer.style.maxHeight = null;
                const otherQuestion = otherItem.querySelector('.faq-question');
                if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            });

            // Открываем текущий, если он не был активен
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = '0';
                // Форсируем reflow, чтобы transition отработал из 0 → scrollHeight
                void answer.offsetHeight;
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ==========================================
       5. Отложенная загрузка карты
       ========================================== */
    const loadMapBtn = document.getElementById('loadMapBtn');
    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', function () {
            const frame = document.getElementById('mapFrame');
            const placeholder = document.getElementById('mapPlaceholder');

            if (frame && placeholder) {
                frame.src = 'https://yandex.ru/map-widget/v1/?ll=38.076389%2C44.562222&z=12';
                frame.style.display = 'block';
                placeholder.style.display = 'none';
            }
        });
    }

    /* ==========================================
       6. Обработка форм отправки (Web3Forms)
       ========================================== */
    function handleFormSubmit(formId, messageId, isModal = false) {
        const form = document.getElementById(formId);
        if (!form) return;

        const msgDiv = messageId ? document.getElementById(messageId) : null;

        const accessKeyInput = form.querySelector('input[name="access_key"]');
        const accessKey = accessKeyInput ? accessKeyInput.value : '';
        const keyMissing = !accessKey || accessKey.includes('ВАШ_ACCESS_KEY');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (keyMissing) {
                if (msgDiv) {
                    msgDiv.style.color = 'var(--c-red)';
                    msgDiv.innerText = 'Форма ещё не настроена. Позвоните нам: 8-938-434-0-333.';
                }
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            submitBtn.innerText = 'Отправка...';
            submitBtn.disabled = true;
            if (msgDiv) msgDiv.innerText = '';

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form)
            })
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    if (msgDiv) {
                        msgDiv.style.color = 'var(--c-green)';
                        msgDiv.innerText = 'Спасибо! Заявка успешно отправлена.';
                    }
                    form.reset();

                    if (isModal && modals.callback) {
                        setTimeout(() => closeModal(modals.callback), 2500);
                    }
                } else {
                    if (msgDiv) {
                        msgDiv.style.color = 'var(--c-red)';
                        msgDiv.innerText = 'Ошибка. Пожалуйста, позвоните нам: 8-938-434-0-333.';
                    }
                }
            })
            .catch((err) => {
                console.error('Form submit error:', err);
                if (msgDiv) {
                    msgDiv.style.color = 'var(--c-red)';
                    msgDiv.innerText = 'Ошибка сети. Пожалуйста, позвоните нам: 8-938-434-0-333.';
                }
            })
            .finally(() => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    handleFormSubmit('requestForm', 'formMessage', false);
    handleFormSubmit('modalForm', 'modalMessage', true);

    /* ==========================================
       7. Актуальный год в футере
       ========================================== */
    document.querySelectorAll('.footer-bottom > div:first-child').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
    });

});
