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
 * Initialise l'application au chargement de la page
 */
function init() {
    console.log('Application de librairie initialisée');
    // La logique d'affichage sera ajoutée dans les branches suivantes
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', init);

