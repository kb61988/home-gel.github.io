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
        
        // Функция закрытия меню с полным сбросом состояний
        const closeMobileMenu = () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) { 
                icon.classList.remove('fa-times'); 
                icon.classList.add('fa-bars'); 
            }
        };

        // Открытие/закрытие по кнопке-бургеру
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

        // Закрытие при клике на любую ссылку в меню
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !mobileMenuBtn.contains(e.target) && 
                !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    /* ==========================================
       3. Модальные окна (Заявка, Политика, Соглашение)
       ========================================== */
    const modals = {
        callback: document.getElementById('callbackModal'),
        privacy: document.getElementById('privacyModal'),
        terms: document.getElementById('termsModal')
    };
    
    // Универсальные функции открытия и закрытия
    const openModal = (modal) => { 
        if (modal) { 
            modal.classList.add('active'); 
            document.body.style.overflow = 'hidden'; 
        } 
    };
    
    const closeModal = (modal) => { 
        if (modal) { 
            modal.classList.remove('active'); 
            // Возвращаем скролл только если нет других открытых модалок
            if (!document.querySelector('.modal-overlay.active')) {
                document.body.style.overflow = ''; 
            }
        } 
    };

    // Обработчики для открытия
    document.querySelectorAll('.open-modal-btn').forEach(btn => btn.addEventListener('click', () => openModal(modals.callback)));
    document.querySelectorAll('.open-privacy').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openModal(modals.privacy); }));
    document.querySelectorAll('.open-terms').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openModal(modals.terms); }));
    
    // Обработчики для закрытия (крестики)
    if (document.querySelector('.close-callback')) document.querySelector('.close-callback').addEventListener('click', () => closeModal(modals.callback));
    if (document.querySelector('.close-privacy')) document.querySelector('.close-privacy').addEventListener('click', () => closeModal(modals.privacy));
    if (document.querySelector('.close-terms')) document.querySelector('.close-terms').addEventListener('click', () => closeModal(modals.terms));

    // Закрытие по клику на темный фон (оверлей)
    Object.values(modals).forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => { 
                if (e.target === modal) closeModal(modal); 
            });
        }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Object.values(modals).forEach(modal => closeModal(modal));
        }
    });

    /* ==========================================
       4. FAQ (Аккордеон)
       ========================================== */
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Сначала закрываем все открытые вкладки
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) otherAnswer.style.maxHeight = null; // Сброс высоты
                const otherQuestion = otherItem.querySelector('.faq-question');
                if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            });
            
            // Если текущая вкладка не была открыта, открываем её
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
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

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            // Блокируем кнопку и показываем загрузку
            submitBtn.innerText = 'Отправка...';
            submitBtn.disabled = true;
            if (msgDiv) msgDiv.innerText = '';

            // Отправка данных
            fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
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
                    
                    // Если это форма в модалке, закрываем её через 2.5 секунды
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
                // Возвращаем кнопку в исходное состояние
                submitBtn.innerText = originalText; 
                submitBtn.disabled = false; 
            });
        });
    }

    // Инициализация форм (передаем ID формы, ID блока для сообщения и флаг модалки)
    handleFormSubmit('requestForm', 'formMessage', false);
    handleFormSubmit('modalForm', 'modalMessage', true);

});
