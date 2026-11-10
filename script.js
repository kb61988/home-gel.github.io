document.addEventListener('DOMContentLoaded', () => {

    // reveal on scroll
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

    // mobile menu
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
                if (willOpen) { icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); }
                else { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
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

    // modals
    const modals = {
        callback: document.getElementById('callbackModal'),
        privacy: document.getElementById('privacyModal'),
        consent: document.getElementById('consentModal'),
        terms: document.getElementById('termsModal')
    };

    Object.values(modals).forEach(m => {
        if (m) m.setAttribute('aria-hidden', 'true');
    });

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
        modal.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const firstInput = modal.querySelector(
                'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea'
            );
            const target = firstInput || modal.querySelector('.close-modal') || getFocusable(modal)[0];
            if (target) target.focus();
        }, 80);
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (!document.querySelector('.modal-overlay.active')) {
            document.body.style.overflow = '';
        }
        // Очистить параметры опросника при закрытии
        const ppInput = modal.querySelector('input[name="pool_params"]');
        if (ppInput) ppInput.value = '';
        const ppDisplay = modal.querySelector('#modalPoolParams');
        if (ppDisplay) {
            ppDisplay.style.display = 'none';
            ppDisplay.textContent = '';
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
    document.querySelectorAll('.open-consent').forEach(btn =>
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openModal(modals.consent); })
    );
    document.querySelectorAll('.open-terms').forEach(btn =>
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openModal(modals.terms); })
    );

    const closeBtnMap = [
        ['.close-callback', modals.callback],
        ['.close-privacy', modals.privacy],
        ['.close-consent', modals.consent],
        ['.close-terms', modals.terms]
    ];
    closeBtnMap.forEach(([sel, modal]) => {
        const btn = document.querySelector(sel);
        if (btn) btn.addEventListener('click', () => closeModal(modal));
    });

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

    // faq
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) otherAnswer.style.maxHeight = null;
                const otherQuestion = otherItem.querySelector('.faq-question');
                if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = '0';
                void answer.offsetHeight;
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // lazy map
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

    // cookie banner
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) {
        let hasConsent = false;
        try { hasConsent = !!localStorage.getItem('cookieConsent'); } catch (e) {}
        if (!hasConsent) cookieBanner.classList.add('show');

        document.querySelectorAll('.cookie-accept').forEach(btn => {
            btn.addEventListener('click', () => {
                try { localStorage.setItem('cookieConsent', '1'); } catch (e) {}
                cookieBanner.classList.remove('show');
            });
        });
    }

    // опросник → заявка
    const calcType = document.getElementById('calc-type');
    const calcVolume = document.getElementById('calc-volume');
    const calcSummary = document.getElementById('calc-summary');
    const calcRequestBtn = document.getElementById('calc-request-btn');

    if (calcType && calcVolume && calcSummary) {
        const getSummary = () => {
            const type = calcType.value;
            const volume = calcVolume.value || '—';
            const extras = Array.from(document.querySelectorAll('.calc-extras input:checked')).map(c => c.value);
            let text = type + ' · ' + volume + ' м³';
            if (extras.length) text += ' · ' + extras.join(', ');
            return text;
        };

        const updateSummary = () => {
            calcSummary.textContent = getSummary();
        };

        document.querySelectorAll('#calculator select, #calculator input').forEach(el => {
            el.addEventListener('input', updateSummary);
            el.addEventListener('change', updateSummary);
        });
        updateSummary();

        if (calcRequestBtn) {
            calcRequestBtn.addEventListener('click', () => {
                const summary = getSummary();
                const modal = modals.callback;
                if (!modal) return;

                const form = modal.querySelector('form');
                if (form) {
                    let hidden = form.querySelector('input[name="pool_params"]');
                    if (!hidden) {
                        hidden = document.createElement('input');
                        hidden.type = 'hidden';
                        hidden.name = 'pool_params';
                        form.appendChild(hidden);
                    }
                    hidden.value = summary;
                }

                const display = document.getElementById('modalPoolParams');
                if (display) {
                    display.textContent = 'Параметры вашего бассейна: ' + summary;
                    display.style.display = 'block';
                }

                openModal(modal);
            });
        }
    }

    // маска: +7 (___) ___-__-__
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function (e) {
            let digits = e.target.value.replace(/\D/g, '');
            if (!digits) { e.target.value = ''; return; }
            if (digits.startsWith('8')) digits = '7' + digits.slice(1);
            if (!digits.startsWith('7')) digits = '7' + digits;
            digits = digits.slice(0, 11);
            let out = '+7';
            if (digits.length > 1) out += ' (' + digits.slice(1, 4);
            if (digits.length >= 5) out += ') ' + digits.slice(4, 7);
            if (digits.length >= 8) out += '-' + digits.slice(7, 9);
            if (digits.length >= 10) out += '-' + digits.slice(9, 11);
            e.target.value = out;
        });
    });

    // form submissions
    function setMessage(msgDiv, text, type) {
        if (!msgDiv) return;
        if (type === 'error') {
            msgDiv.setAttribute('role', 'alert');
            msgDiv.style.color = 'var(--c-red)';
        } else {
            msgDiv.setAttribute('role', 'status');
            msgDiv.style.color = 'var(--c-green)';
        }
        msgDiv.innerText = text;
    }

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
                setMessage(msgDiv, 'Форма ещё не настроена. Позвоните нам: 8-938-434-0-333.', 'error');
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
                    setMessage(msgDiv, 'Спасибо! Заявка успешно отправлена.', 'success');
                    form.reset();

                    if (isModal && modals.callback) {
                        setTimeout(() => closeModal(modals.callback), 2500);
                    }
                } else {
                    setMessage(msgDiv, 'Ошибка. Пожалуйста, позвоните нам: 8-938-434-0-333.', 'error');
                }
            })
            .catch((err) => {
                console.error('Form submit error:', err);
                setMessage(msgDiv, 'Ошибка сети. Пожалуйста, позвоните нам: 8-938-434-0-333.', 'error');
            })
            .finally(() => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    handleFormSubmit('requestForm', 'formMessage', false);
    handleFormSubmit('modalForm', 'modalMessage', true);

    // footer year
    document.querySelectorAll('.footer-bottom > div:first-child').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
    });
});