// Состояние приложения
let appState = {
    isRegistered: false,
    hasOrderedService: false,
    currentUser: null,
    chatMessages: [],
    registrationAttempts: 0,
    maxRegistrationAttempts: 3
};

// DOM элементы
const welcomeModal = document.getElementById('welcomeModal');
const closeWelcome = document.getElementById('closeWelcome');
const registrationScreen = document.getElementById('registrationScreen');
const mainScreen = document.getElementById('mainScreen');
const registrationForm = document.getElementById('registrationForm');
const successAnimation = document.getElementById('successAnimation');
const bonusButton = document.getElementById('bonusButton');
const bonusMessage = document.getElementById('bonusMessage');
const serviceCards = document.querySelectorAll('.service-card');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const feedbackForm = document.getElementById('feedbackForm');

// Элементы формы регистрации
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const nicknameInput = document.getElementById('nickname');
const loginCounter = document.getElementById('loginCounter');
const passwordCounter = document.getElementById('passwordCounter');
const nicknameCounter = document.getElementById('nicknameCounter');
const attemptsCounter = document.getElementById('attemptsCounter');
const remainingAttemptsSpan = document.getElementById('remainingAttempts');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем количество попыток регистрации
    const savedAttempts = localStorage.getItem('greenTeamRegistrationAttempts');
    if (savedAttempts) {
        appState.registrationAttempts = parseInt(savedAttempts);
    }
    
    // Проверяем, есть ли сохраненные данные пользователя
    const savedUser = localStorage.getItem('greenTeamUser');
    if (savedUser) {
        appState.currentUser = JSON.parse(savedUser);
        appState.isRegistered = true;
        showMainScreen();
    } else {
        // Проверяем, не превышен ли лимит попыток регистрации
        if (appState.registrationAttempts >= appState.maxRegistrationAttempts) {
            showRegistrationBlocked();
        } else {
            showWelcomeModal();
        }
    }
    
    initializeEventListeners();
    initializeCharCounters();
});

// Показать приветственное окно
function showWelcomeModal() {
    welcomeModal.classList.remove('hidden');
}

// Показать экран регистрации
function showRegistrationScreen() {
    welcomeModal.classList.add('hidden');
    registrationScreen.classList.remove('hidden');
    updateAttemptsCounter();
}

// Обновление счетчика попыток
function updateAttemptsCounter() {
    const remaining = appState.maxRegistrationAttempts - appState.registrationAttempts;
    
    if (appState.registrationAttempts > 0) {
        attemptsCounter.classList.remove('hidden');
        remainingAttemptsSpan.textContent = remaining;
        
        // Меняем стиль при критическом количестве попыток
        if (remaining <= 1) {
            attemptsCounter.classList.add('warning');
        } else {
            attemptsCounter.classList.remove('warning');
        }
    } else {
        attemptsCounter.classList.add('hidden');
    }
}

// Показать экран блокировки регистрации
function showRegistrationBlocked() {
    // Создаем экран блокировки
    const blockedScreen = document.createElement('div');
    blockedScreen.id = 'blockedScreen';
    blockedScreen.className = 'screen';
    blockedScreen.innerHTML = `
        <div class="container" style="text-align: center; padding: 40px;">
            <h1 style="color: #f44336; margin-bottom: 20px;">Регистрация заблокирована</h1>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                Вы превысили максимальное количество попыток регистрации (${appState.maxRegistrationAttempts}).
            </p>
            <p style="font-size: 16px; color: #888; margin-bottom: 20px;">
                Обратитесь к администратору для разблокировки или очистите данные браузера.
            </p>
            <button onclick="clearRegistrationData()" class="btn-primary" style="background-color: #f44336; max-width: 300px;">
                Очистить данные и начать заново
            </button>
        </div>
    `;
    
    document.body.appendChild(blockedScreen);
    
    // Скрываем другие экраны
    welcomeModal.classList.add('hidden');
    registrationScreen.classList.add('hidden');
    mainScreen.classList.add('hidden');
}

// Очистка данных регистрации
function clearRegistrationData() {
    localStorage.removeItem('greenTeamRegistrationAttempts');
    localStorage.removeItem('greenTeamUser');
    localStorage.removeItem('greenTeamChat');
    localStorage.removeItem('greenTeamFeedback');
    
    // Перезагружаем страницу
    location.reload();
}

// Показать главную страницу
function showMainScreen() {
    registrationScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    
    // Загружаем сохраненные сообщения чата
    loadChatMessages();
    
    // Проверяем статус заказанных услуг
    checkOrderedServices();
}

// Инициализация обработчиков событий
function initializeEventListeners() {
    // Закрытие приветственного окна
    closeWelcome.addEventListener('click', showRegistrationScreen);
    
    // Закрытие модального окна при клике вне его
    welcomeModal.addEventListener('click', function(e) {
        if (e.target === welcomeModal) {
            showRegistrationScreen();
        }
    });
    
    // Обработка регистрации
    registrationForm.addEventListener('submit', handleRegistration);
    
    // Обработка заказа услуг
    serviceCards.forEach(card => {
        card.addEventListener('click', () => orderService(card));
    });
    
    // Обработка чата
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Обработка бонусов
    bonusButton.addEventListener('click', claimBonus);
    
    // Обработка обратной связи
    feedbackForm.addEventListener('submit', handleFeedback);
}

// Инициализация счетчиков символов
function initializeCharCounters() {
    // Конфигурация полей и их ограничений
    const fieldConfigs = [
        { input: loginInput, counter: loginCounter, maxLength: 13, name: 'логин' },
        { input: passwordInput, counter: passwordCounter, maxLength: 15, name: 'пароль' },
        { input: nicknameInput, counter: nicknameCounter, maxLength: 12, name: 'ник' }
    ];

    fieldConfigs.forEach(config => {
        if (config.input && config.counter) {
            // Обновляем счетчик при вводе
            config.input.addEventListener('input', function() {
                updateCharCounter(config);
            });

            // Инициализируем счетчик
            updateCharCounter(config);
        }
    });
}

// Обновление счетчика символов
function updateCharCounter(config) {
    const currentLength = config.input.value.length;
    const maxLength = config.maxLength;
    
    // Обновляем текст счетчика
    config.counter.textContent = `${currentLength}/${maxLength}`;
    
    // Удаляем все классы
    config.counter.classList.remove('warning', 'limit');
    
    // Добавляем соответствующий класс в зависимости от заполненности
    if (currentLength >= maxLength) {
        config.counter.classList.add('limit');
    } else if (currentLength >= maxLength * 0.8) {
        config.counter.classList.add('warning');
    }
}

// Обработка регистрации
function handleRegistration(e) {
    e.preventDefault();
    
    // Увеличиваем счетчик попыток регистрации
    appState.registrationAttempts++;
    localStorage.setItem('greenTeamRegistrationAttempts', appState.registrationAttempts.toString());
    
    // Обновляем отображение счетчика
    updateAttemptsCounter();
    
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    const nickname = nicknameInput.value.trim();
    
    // Показываем сколько попыток осталось
    const remainingAttempts = appState.maxRegistrationAttempts - appState.registrationAttempts;
    
    if (!login || !password || !nickname) {
        if (remainingAttempts > 0) {
            showNotification(`Пожалуйста, заполните все поля. Осталось попыток: ${remainingAttempts}`);
        } else {
            showNotification('Превышено максимальное количество попыток регистрации');
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
        return;
    }
    
    // Проверяем ограничения длины
    if (login.length > 13) {
        if (remainingAttempts > 0) {
            showNotification(`Логин не должен превышать 13 символов. Осталось попыток: ${remainingAttempts}`);
        } else {
            showNotification('Превышено максимальное количество попыток регистрации');
            setTimeout(() => location.reload(), 2000);
        }
        return;
    }
    
    if (password.length > 15) {
        if (remainingAttempts > 0) {
            showNotification(`Пароль не должен превышать 15 символов. Осталось попыток: ${remainingAttempts}`);
        } else {
            showNotification('Превышено максимальное количество попыток регистрации');
            setTimeout(() => location.reload(), 2000);
        }
        return;
    }
    
    if (nickname.length > 12) {
        if (remainingAttempts > 0) {
            showNotification(`Ник не должен превышать 12 символов. Осталось попыток: ${remainingAttempts}`);
        } else {
            showNotification('Превышено максимальное количество попыток регистрации');
            setTimeout(() => location.reload(), 2000);
        }
        return;
    }
    
    // Проверяем минимальную длину
    if (login.length < 3) {
        if (remainingAttempts > 0) {
            showNotification(`Логин должен содержать минимум 3 символа. Осталось попыток: ${remainingAttempts}`);
        } else {
            showNotification('Превышено максимальное количество попыток регистрации');
            setTimeout(() => location.reload(), 2000);
        }
        return;
    }
    
    if (password.length < 4) {
        if (remainingAttempts > 0) {
            showNotification(`Пароль должен содержать минимум 4 символа. Осталось попыток: ${remainingAttempts}`);
        } else {
            showNotification('Превышено максимальное количество попыток регистрации');
            setTimeout(() => location.reload(), 2000);
        }
        return;
    }
    
    if (nickname.length < 2) {
        if (remainingAttempts > 0) {
            showNotification(`Ник должен содержать минимум 2 символа. Осталось попыток: ${remainingAttempts}`);
        } else {
            showNotification('Превышено максимальное количество попыток регистрации');
            setTimeout(() => location.reload(), 2000);
        }
        return;
    }
    
    // Создаем пользователя
    const user = {
        login: login,
        nickname: nickname,
        registrationDate: new Date().toISOString(),
        orderedServices: [],
        bonusesEarned: 0
    };
    
    // Сохраняем пользователя
    localStorage.setItem('greenTeamUser', JSON.stringify(user));
    appState.currentUser = user;
    appState.isRegistered = true;
    
    // Показываем анимацию успеха
    showSuccessAnimation();
    
    // Через 2 секунды переходим на главную страницу
    setTimeout(() => {
        showMainScreen();
    }, 2000);
}

// Показать анимацию успешной регистрации
function showSuccessAnimation() {
    successAnimation.classList.remove('hidden');
    
    setTimeout(() => {
        successAnimation.classList.add('hidden');
    }, 2000);
}

// Заказать услугу
function orderService(serviceCard) {
    if (!appState.isRegistered) {
        alert('Сначала необходимо зарегистрироваться');
        return;
    }
    
    const serviceName = serviceCard.querySelector('h4').textContent;
    const serviceType = serviceCard.dataset.service;
    
    // Добавляем услугу к заказанным
    if (!appState.currentUser.orderedServices.includes(serviceType)) {
        appState.currentUser.orderedServices.push(serviceType);
        
        // Сохраняем изменения
        localStorage.setItem('greenTeamUser', JSON.stringify(appState.currentUser));
        
        // Визуально отмечаем карточку как заказанную
        serviceCard.classList.add('ordered');
        
        // Активируем кнопку бонусов
        appState.hasOrderedService = true;
        bonusButton.classList.remove('disabled');
        
        // Добавляем сообщение в чат
        addChatMessage(`Заказана услуга: ${serviceName}`, 'system');
        
        // Показываем уведомление
        showNotification(`Услуга "${serviceName}" успешно заказана!`);
    } else {
        showNotification(`Услуга "${serviceName}" уже заказана`);
    }
}

// Проверить заказанные услуги при загрузке
function checkOrderedServices() {
    if (appState.currentUser && appState.currentUser.orderedServices.length > 0) {
        appState.hasOrderedService = true;
        bonusButton.classList.remove('disabled');
        
        // Отмечаем заказанные услуги
        appState.currentUser.orderedServices.forEach(serviceType => {
            const serviceCard = document.querySelector(`[data-service="${serviceType}"]`);
            if (serviceCard) {
                serviceCard.classList.add('ordered');
            }
        });
    }
}

// Получить бонусы
function claimBonus() {
    if (!appState.hasOrderedService) {
        showNotification('Сначала закажите любую услугу для получения бонусов');
        return;
    }
    
    // Начисляем бонусы
    appState.currentUser.bonusesEarned += 10;
    localStorage.setItem('greenTeamUser', JSON.stringify(appState.currentUser));
    
    // Показываем анимацию бонусов
    showBonusAnimation();
    
    // Временно деактивируем кнопку
    bonusButton.classList.add('disabled');
    setTimeout(() => {
        bonusButton.classList.remove('disabled');
    }, 3000);
}

// Показать анимацию получения бонусов
function showBonusAnimation() {
    bonusMessage.classList.remove('hidden');
    
    setTimeout(() => {
        bonusMessage.classList.add('hidden');
    }, 3000);
}

// Отправить сообщение в чат
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    if (!appState.isRegistered) {
        alert('Чат доступен только зарегистрированным пользователям');
        return;
    }
    
    addChatMessage(message, 'user');
    messageInput.value = '';
    
    // Имитируем ответ системы (можно заменить на реальную логику)
    setTimeout(() => {
        const responses = [
            'Спасибо за ваше сообщение!',
            'Мы обязательно рассмотрим ваш запрос.',
            'Green Team всегда готова помочь!',
            'Ваше участие в экологическом движении очень важно.',
            'Благодарим за заботу о природе!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, 'system');
    }, 1000);
}

// Добавить сообщение в чат
function addChatMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    
    if (type === 'user') {
        messageElement.textContent = `${appState.currentUser.nickname}: ${message}`;
    } else {
        messageElement.textContent = message;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Сохраняем сообщение
    const chatMessage = {
        text: message,
        type: type,
        timestamp: new Date().toISOString(),
        user: type === 'user' ? appState.currentUser.nickname : 'System'
    };
    
    appState.chatMessages.push(chatMessage);
    localStorage.setItem('greenTeamChat', JSON.stringify(appState.chatMessages));
}

// Загрузить сообщения чата
function loadChatMessages() {
    const savedMessages = localStorage.getItem('greenTeamChat');
    if (savedMessages) {
        appState.chatMessages = JSON.parse(savedMessages);
        
        // Очищаем чат и загружаем сохраненные сообщения
        chatMessages.innerHTML = '<div class="message system">Добро пожаловать в чат Green Team!</div>';
        
        appState.chatMessages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${msg.type}`;
            
            if (msg.type === 'user') {
                messageElement.textContent = `${msg.user}: ${msg.text}`;
            } else {
                messageElement.textContent = msg.text;
            }
            
            chatMessages.appendChild(messageElement);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Обработка обратной связи
function handleFeedback(e) {
    e.preventDefault();
    
    if (!appState.isRegistered) {
        alert('Обратная связь доступна только зарегистрированным пользователям');
        return;
    }
    
    const feedbackText = document.getElementById('feedbackMessage').value.trim();
    if (!feedbackText) {
        alert('Пожалуйста, введите сообщение');
        return;
    }
    
    // Сохраняем обратную связь
    const feedback = {
        user: appState.currentUser.nickname,
        message: feedbackText,
        timestamp: new Date().toISOString()
    };
    
    let savedFeedback = JSON.parse(localStorage.getItem('greenTeamFeedback') || '[]');
    savedFeedback.push(feedback);
    localStorage.setItem('greenTeamFeedback', JSON.stringify(savedFeedback));
    
    // Очищаем форму
    document.getElementById('feedbackMessage').value = '';
    
    // Показываем уведомление
    showNotification('Ваше сообщение отправлено в Green Team!');
    
    // Добавляем сообщение в чат
    addChatMessage('Отправлено сообщение в службу поддержки Green Team', 'system');
}

// Показать уведомление
function showNotification(message) {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        z-index: 1002;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Добавляем стили анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }, 3000);
}

// Обработка клавиши Escape для закрытия модальных окон
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (!welcomeModal.classList.contains('hidden')) {
            showRegistrationScreen();
        }
    }
});

// Предотвращение отправки формы при нажатии Enter в полях ввода (кроме чата)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
        if (e.target !== messageInput) {
            e.preventDefault();
        }
    }
});
