/**
 * Gestionnaire de librairie personnelle
 * Système de stockage basé sur localStorage
 */

// Clé pour le stockage dans localStorage
const STORAGE_KEY = 'myLibrary_books';

/**
 * Structure de données d'un livre
 * @typedef {Object} Book
 * @property {string} id - Identifiant unique du livre
 * @property {string} title - Titre du livre
 * @property {number} createdAt - Timestamp de création
 * @property {number} updatedAt - Timestamp de dernière modification
 */

/**
 * Récupère tous les livres depuis le localStorage
 * @returns {Book[]} Tableau de livres
 */
function getBooks() {
    const booksJson = localStorage.getItem(STORAGE_KEY);
    if (!booksJson) {
        return [];
    }
    try {
        return JSON.parse(booksJson);
    } catch (error) {
        console.error('Erreur lors de la lecture des livres:', error);
        return [];
    }
}

/**
 * Sauvegarde tous les livres dans le localStorage
 * @param {Book[]} books - Tableau de livres à sauvegarder
 */
function saveBooks(books) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des livres:', error);
        alert('Erreur lors de la sauvegarde. Vérifiez que le localStorage est disponible.');
    }
}

/**
 * Génère un identifiant unique pour un livre
 * @returns {string} Identifiant unique
 */
function generateBookId() {
    return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crée l'élément HTML pour un livre
 * @param {Book} book - Objet livre à afficher
 * @returns {HTMLElement} Élément HTML représentant le livre
 */
function createBookElement(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.bookId = book.id;

    const bookTitle = document.createElement('h3');
    bookTitle.className = 'book-title';
    bookTitle.textContent = book.title;

    bookCard.appendChild(bookTitle);

    return bookCard;
}

/**
 * Affiche tous les livres dans la liste
 */
function displayBooks() {
    const booksListContainer = document.getElementById('books-list');
    if (!booksListContainer) {
        console.error('Élément books-list introuvable');
        return;
    }

    const books = getBooks();

    // Vider le conteneur
    booksListContainer.innerHTML = '';

    // Afficher l'état vide si aucun livre
    if (books.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'Aucun livre dans votre librairie. Ajoutez-en un pour commencer !';
        booksListContainer.appendChild(emptyState);
        return;
    }

    // Afficher chaque livre
    books.forEach(book => {
        const bookElement = createBookElement(book);
        booksListContainer.appendChild(bookElement);
    });
}

/**
 * Initialise l'application au chargement de la page
 */
function init() {
    console.log('Application de librairie initialisée');
    displayBooks();
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', init);

