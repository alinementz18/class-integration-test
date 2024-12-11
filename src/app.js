const express = require('express');
const app = express();

app.use(express.json());

let books = [];
let loans = [];

// Adicionar um novo livro
app.post('/books', (req, res) => {
    const book = req.body;
    if (!book.title || !book.author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }
    book.id = books.length + 1;
    book.available = true;
    books.push(book);
    res.status(201).json(book);
});

// Listar todos os livros
app.get('/books', (req, res) => {
    res.json(books);
});

// Atualizar informações de um livro
app.put('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const { title, author } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;

    res.json(book);
});

// Remover um livro
app.delete('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    books = books.filter(b => b.id !== id);
    res.status(204).end();
});

// Realizar um empréstimo
app.post('/loans', (req, res) => {
    const { bookId } = req.body;
    const book = books.find(b => b.id === bookId);

    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (!book.available) return res.status(400).json({ error: 'Book not available' });

    book.available = false;
    loans.push({ bookId, loanDate: new Date() });
    res.status(201).json({ message: 'Loan successful' });
});

// Realizar a devolução de um livro
app.post('/returns', (req, res) => {
    const { bookId } = req.body;
    const book = books.find(b => b.id === bookId);

    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.available) return res.status(400).json({ error: 'Book is not on loan' });

    book.available = true;
    loans = loans.filter(l => l.bookId !== bookId);
    res.status(200).json({ message: 'Return successful' });
});

module.exports = { app, books, loans };
