"use strict";

const API_URL = 'https://api.tvmaze.com/shows'; // Рекомендоване API
const moviesContainer = document.getElementById('movies-container');
const errorMessageElement = document.getElementById('error-message');
const searchInput = document.getElementById('search-input');
const sortNameAscButton = document.getElementById('sort-name-asc');
const sortNameDescButton = document.getElementById('sort-name-desc');
const sortRatingDescButton = document.getElementById('sort-rating-desc');
const sortRatingAscButton = document.getElementById('sort-rating-asc');

let allMovies = []; // Зберігаємо оригінальний список фільмів
let displayedMovies = []; // Список фільмів, що наразі відображаються (після фільтрації/сортування)

/**
 * Асинхронно завантажує дані фільмів з API.
 * Обробляє можливі помилки під час запиту.
 */
async function fetchMovies() {
    hideErrorMessage(); // Сховати попередні повідомлення про помилки
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            // Якщо відповідь не успішна (наприклад, 404, 500), викидаємо помилку
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allMovies = data; // Зберігаємо всі завантажені фільми
        displayedMovies = [...allMovies]; // Ініціалізуємо відображувані фільми повним списком

        // --- ДОДАНО: Підрахунок та вивід загальної кількості фільмів у консоль ---
        console.log(`Загальна кількість завантажених фільмів: ${allMovies.length}`);
        // --- КІНЕЦЬ ДОДАНИХ ЗМІН ---

        displayMovies(displayedMovies); // Відображаємо всі фільми
    } catch (error) {
        console.error("Помилка під час завантаження фільмів:", error);
        showErrorMessage(`Не вдалося завантажити фільми. Спробуйте пізніше. (${error.message})`);
    }
}

// ... (решта коду залишається без змін) ...

/**
 * Відображає масив фільмів на сторінці.
 * Використовує шаблонні рядки та деструктуризацію.
 * @param {Array} movies - Масив об'єктів фільмів для відображення.
 */
function displayMovies(movies) {
    moviesContainer.innerHTML = ''; // Очищаємо контейнер перед відображенням

    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p style="text-align: center; font-size: 1.2rem; color: #666;">Нічого не знайдено.</p>';
        return;
    }

    const movieCardsHtml = movies.map(movie => {
        // Деструктуризація для зручного доступу до полів об'єкта
        const {
            id,
            name,
            genres,
            rating,
            image,
            summary
        } = movie;

        // Перевірка наявності зображення, використання заглушки, якщо його немає
        const imageUrl = image?.medium || 'https://via.placeholder.com/250x350?text=No+Image';
        const genresText = genres && genres.length > 0 ? genres.join(', ') : 'Не вказано';
        const averageRating = rating?.average !== null && rating?.average !== undefined ? rating.average : 'N/A';
        const movieSummary = summary ? summary.replace(/<[^>]*>/g, '') : '<span class="no-summary-message">Опис відсутній.</span>'; // Видаляємо HTML теги з опису

        return `
            <div class="movie-card" data-id="${id}">
                <img src="${imageUrl}" alt="${name} постер">
                <div class="movie-info">
                    <h2>${name}</h2>
                    <p class="genres">Жанри: ${genresText}</p>
                    <p class="rating">Рейтинг: ${averageRating}</p>
                    <p class="movie-summary">${movieSummary}</p>
                </div>
            </div>
        `;
    }).join(''); // Об'єднуємо масив HTML-рядків в один великий рядок

    moviesContainer.innerHTML = movieCardsHtml;
}

/**
 * Фільтрує фільми за назвою.
 */
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === '') {
        displayedMovies = [...allMovies]; // Якщо поле пошуку порожнє, показуємо всі фільми
    } else {
        displayedMovies = allMovies.filter(movie =>
            movie.name.toLowerCase().includes(searchTerm)
        );
    }
    displayMovies(displayedMovies);
}

/**
 * Сортує фільми за вказаним критерієм.
 * @param {string} criterion - Критерій сортування ('name-asc', 'name-desc', 'rating-asc', 'rating-desc').
 */
function sortMovies(criterion) {
    const moviesToSort = [...displayedMovies]; // Створюємо копію для сортування

    moviesToSort.sort((a, b) => {
        switch (criterion) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'rating-asc':
                // Врахування null/undefined рейтингів
                const ratingA_asc = a.rating?.average || 0; // Якщо рейтинг null, вважаємо його 0 для сортування
                const ratingB_asc = b.rating?.average || 0;
                return ratingA_asc - ratingB_asc;
            case 'rating-desc':
                // Врахування null/undefined рейтингів
                const ratingA_desc = a.rating?.average || 0;
                const ratingB_desc = b.rating?.average || 0;
                return ratingB_desc - ratingA_desc;
            default:
                return 0;
        }
    });
    displayedMovies = moviesToSort; // Оновлюємо відображуваний список
    displayMovies(displayedMovies);
}

/**
 * Відображає повідомлення про помилку.
 * @param {string} message - Текст повідомлення про помилку.
 */
function showErrorMessage(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

/**
 * Приховує повідомлення про помилку.
 */
function hideErrorMessage() {
    errorMessageElement.textContent = '';
    errorMessageElement.style.display = 'none';
}

// --- Обробники подій ---

// Обробник для поля пошуку
searchInput.addEventListener('input', filterMovies);

// Обробники для кнопок сортування
sortNameAscButton.addEventListener('click', () => sortMovies('name-asc'));
sortNameDescButton.addEventListener('click', () => sortMovies('name-desc'));
sortRatingDescButton.addEventListener('click', () => sortMovies('rating-desc'));
sortRatingAscButton.addEventListener('click', () => sortMovies('rating-asc'));

// Ініціалізація: Завантаження фільмів при завантаженні сторінки
document.addEventListener('DOMContentLoaded', fetchMovies);