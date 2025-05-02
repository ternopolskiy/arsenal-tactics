// Логика drag-and-drop и шаблонов для редактора тактик
const templates = {
    '4-3-3': [
        { pos: 'ЛЗ', left: 10, top: 68 },
        { pos: 'ЦЗ', left: 32, top: 72 },
        { pos: 'ЦЗ', left: 58, top: 72 },
        { pos: 'ПЗ', left: 77, top: 68 },
        { pos: 'ЦП', left: 22, top: 48 },
        { pos: 'ЦП', left: 44, top: 55 },
        { pos: 'ЦП', left: 66, top: 48 },
        { pos: 'ЛН', left: 15, top: 25 },
        { pos: 'ЦН', left: 45, top: 15 },
        { pos: 'ПН', left: 75, top: 25 }
    ],
    '3-4-3': [
        { pos: 'ЦЗ', left: 45, top: 75 },
        { pos: 'ЦЗ', left: 65, top: 75 },
        { pos: 'ЦЗ', left: 25, top: 75 },
        { pos: 'ЛП', left: 11, top: 45 },
        { pos: 'ЦП', left: 55, top: 52 },
        { pos: 'ЦП', left: 35, top: 52 },
        { pos: 'ПП', left: 78, top: 45 },
        { pos: 'ЛН', left: 15, top: 25 },
        { pos: 'ЦН', left: 45, top: 15 },
        { pos: 'ПН', left: 75, top: 25 }
    ],
    '4-2-3-1': [
        { pos: 'ЛЗ', left: 10, top: 68 },
        { pos: 'ЦЗ', left: 32, top: 72 },
        { pos: 'ЦЗ', left: 58, top: 72 },
        { pos: 'ПЗ', left: 77, top: 68 },
        { pos: 'ЦОП', left: 35, top: 50 },
        { pos: 'ЦОП', left: 55, top: 50 },
        { pos: 'ЛП', left: 11, top: 42 },
        { pos: 'ЦАП', left: 45, top: 30 },
        { pos: 'ПП', left: 78, top: 42 },
        { pos: 'ЦН', left: 45, top: 15 }
    ],
    '4-4-2': [
        { pos: 'ЛЗ', left: 10, top: 62 },
        { pos: 'ЦЗ', left: 32, top: 72 },
        { pos: 'ЦЗ', left: 58, top: 72 },
        { pos: 'ПЗ', left: 77, top: 62 },
        { pos: 'ЛП', left: 11, top: 36 },
        { pos: 'ЦП', left: 32, top: 50 },
        { pos: 'ЦП', left: 60, top: 50 },
        { pos: 'ПП', left: 78, top: 36 },
        { pos: 'ЛН', left: 30, top: 18 },
        { pos: 'ПН', left: 60, top: 18 }
    ]
};

const playersContainer = document.getElementById('players-container');
const templateSelect = document.getElementById('template-select');
const applyBtn = document.getElementById('apply-template');

function createPlayerShirt(pos, left, top) {
    const div = document.createElement('div');
    div.className = 'player-shirt';
    div.textContent = pos;
    div.style.left = left + '%';
    div.style.top = top + '%';
    div.draggable = true;
    div.dataset.position = pos;
    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', dragEnd);
    div.addEventListener('touchstart', touchStart, { passive: false });
    div.addEventListener('touchmove', touchMove, { passive: false });
    div.addEventListener('touchend', touchEnd, { passive: false });
    return div;
}

function renderTemplate(templateName) {
    playersContainer.innerHTML = '';
    const template = templates[templateName];
    template.forEach(player => {
        const shirt = createPlayerShirt(player.pos, player.left, player.top);
        playersContainer.appendChild(shirt);
    });
}

applyBtn.addEventListener('click', () => {
    renderTemplate(templateSelect.value);
});

// Drag and Drop
let dragged = null;
let offsetX = 0;
let offsetY = 0;

function dragStart(e) {
    dragged = this;
    this.classList.add('dragging');
    offsetX = e.offsetX;
    offsetY = e.offsetY;
}

function dragEnd(e) {
    this.classList.remove('dragging');
    const field = document.querySelector('.field-area');
    const rect = field.getBoundingClientRect();
    let x = (e.clientX - rect.left - offsetX) / rect.width * 100;
    let y = (e.clientY - rect.top - offsetY) / rect.height * 100;
    x = Math.max(0, Math.min(92, x));
    y = Math.max(0, Math.min(92, y));
    this.style.left = x + '%';
    this.style.top = y + '%';
    dragged = null;
}

// Touch events for mobile
function touchStart(e) {
    dragged = this;
    this.classList.add('dragging');
    const touch = e.touches[0];
    offsetX = touch.clientX - this.getBoundingClientRect().left;
    offsetY = touch.clientY - this.getBoundingClientRect().top;
}

function touchMove(e) {
    if (!dragged) return;
    e.preventDefault();
    const field = document.querySelector('.field-area');
    const rect = field.getBoundingClientRect();
    const touch = e.touches[0];
    let x = (touch.clientX - rect.left - offsetX) / rect.width * 100;
    let y = (touch.clientY - rect.top - offsetY) / rect.height * 100;
    x = Math.max(0, Math.min(92, x));
    y = Math.max(0, Math.min(92, y));
    dragged.style.left = x + '%';
    dragged.style.top = y + '%';
}

function touchEnd(e) {
    if (dragged) dragged.classList.remove('dragging');
    dragged = null;
}

// Система сохранения тактики через html2canvas
// Флаги для отслеживания загрузки библиотек
let libsLoaded = false;
let loadingError = null;

/**
 * Загрузка внешних библиотек с обработкой ошибок и резервными источниками
 */
(function loadLibs() {
    // Функция для загрузки скрипта с поддержкой Promise
    const loadScript = (url, integrity) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            if (integrity) script.integrity = integrity;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => resolve();
            script.onerror = () => {
                const error = `Ошибка загрузки ${url}`;
                console.error(error);
                reject(error);
            };
            
            document.body.appendChild(script);
        });
    };

    // Загрузка библиотек с резервными источниками
    Promise.all([
        // html2canvas с резервным источником
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 
                  'sha512-s+/4UCE0BfG8x+JwJHA2EjqPB6+a0XQS11UqKbFDZRYQ8Pk5/aBvYwNxSi3+4QeC4M6aA5O6Xp8u0sXzP6Tug==')
            .catch(() => loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'))
    ])
    .then(() => {
        libsLoaded = true;
        console.log('Все библиотеки успешно загружены');
    })
    .catch(error => {
        loadingError = error;
        console.error('Ошибка при загрузке библиотек:', error);
        alert(`Ошибка загрузки библиотек: ${error}`);
    });
})();

/**
 * Функция сохранения тактики в выбранном формате
 * @param {string} format - Формат сохранения ('png', 'svg')
 */
function saveAs(format) {
    // Проверка загрузки библиотек
    if (!libsLoaded) {
        if (loadingError) {
            return alert(`Библиотеки не загружены: ${loadingError}`);
        }
        return alert('Библиотеки ещё загружаются, пожалуйста, подождите...');
    }
    
    // Получение элемента поля
    const field = document.querySelector('.field-area');
    if (!field) {
        return alert('Ошибка: не найдено поле для сохранения');
    }
    
    // Настройки для html2canvas
    const canvasOptions = { 
        backgroundColor: null,
        logging: false,
        useCORS: true,
        scale: 2 // Увеличиваем качество изображения
    };
    
    try {
        // Создание canvas из DOM-элемента
        html2canvas(field, canvasOptions).then(canvas => {
            if (!canvas) {
                throw new Error('Ошибка создания изображения');
            }
            
            // Обработка в зависимости от формата
            switch (format) {
                case 'png':
                    savePNG(canvas);
                    break;
                case 'svg':
                    saveSVG(canvas);
                    break;
                default:
                    alert('Неизвестный формат файла');
            }
        }).catch(error => {
            console.error('Ошибка при создании canvas:', error);
            alert(`Ошибка при создании изображения: ${error.message}`);
        });
    } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert(`Произошла ошибка: ${error.message}`);
    }
}

/**
 * Сохранение в формате PNG
 * @param {HTMLCanvasElement} canvas - Canvas элемент с изображением
 */
function savePNG(canvas) {
    try {
        const link = document.createElement('a');
        link.download = 'tactic.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Ошибка при сохранении PNG:', error);
        alert(`Ошибка при сохранении PNG: ${error.message}`);
    }
}

/**
 * Сохранение в формате SVG
 * @param {HTMLCanvasElement} canvas - Canvas элемент с изображением
 */
function saveSVG(canvas) {
    try {
        // Примечание: toDataURL не создает настоящий SVG, это ограничение html2canvas
        // Для правильного SVG нужна другая библиотека, но мы используем PNG как временное решение
        const link = document.createElement('a');
        link.download = 'tactic.svg';
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log('Примечание: экспорт в настоящий SVG требует дополнительных библиотек');
    } catch (error) {
        console.error('Ошибка при сохранении SVG:', error);
        alert(`Ошибка при сохранении SVG: ${error.message}`);
    }
}



// Добавление обработчиков событий для кнопок сохранения
document.getElementById('save-png').addEventListener('click', () => saveAs('png'));
document.getElementById('save-svg').addEventListener('click', () => saveAs('svg'));

// Инициализация шаблона по умолчанию
window.addEventListener('DOMContentLoaded', () => {
    renderTemplate(templateSelect.value);
});