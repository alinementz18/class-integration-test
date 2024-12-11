const request = require('supertest');
const { app, books } = require('../src/app');

describe('API de Livros', () => {
    
    // Limpar os livros antes de cada teste
    beforeEach(() => {
        books.length = 0; // Limpa o array books
    });

    it('deve adicionar um novo livro com sucesso', async () => {
        const book = { title: '1984', author: 'George Orwell' };
        const response = await request(app).post('/books').send(book);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(book.title);
        expect(response.body.author).toBe(book.author);
    });

    it('deve retornar erro ao tentar adicionar um livro sem título', async () => {
        const book = { author: 'George Orwell' };
        const response = await request(app).post('/books').send(book);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('deve listar todos os livros', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve atualizar as informações de um livro', async () => {
        const book = { title: '1984', author: 'George Orwell' };
        const addedResponse = await request(app).post('/books').send(book);

        const updatedBook = { title: '1984 - Updated', author: 'George Orwell' };
        const response = await request(app)
            .put(`/books/${addedResponse.body.id}`)
            .send(updatedBook);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updatedBook.title);
    });

    it('deve remover um livro', async () => {
        const book = { title: '1984', author: 'George Orwell' };
        const addedResponse = await request(app).post('/books').send(book);
        
        // Remover o livro adicionado
        await request(app).delete(`/books/${addedResponse.body.id}`).expect(204);

        // Verificar se o livro foi removido
        const listResponse = await request(app).get('/books');
        expect(listResponse.body).toHaveLength(0);  // Espera-se que o array de livros esteja vazio
    });

    it('deve realizar um empréstimo com sucesso', async () => {
        const book = { title: '1984', author: 'George Orwell' };
        const addedResponse = await request(app).post('/books').send(book);

        const response = await request(app)
            .post('/loans')
            .send({ bookId: addedResponse.body.id });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Loan successful' });
    });

    it('deve retornar erro ao tentar emprestar um livro indisponível', async () => {
        const book = { title: '1984', author: 'George Orwell' };
        const addedResponse = await request(app).post('/books').send(book);
        await request(app).post('/loans').send({ bookId: addedResponse.body.id });

        const response = await request(app)
            .post('/loans')
            .send({ bookId: addedResponse.body.id });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Book not available' });
    });

    it('deve realizar a devolução de um livro', async () => {
        const book = { title: '1984', author: 'George Orwell' };
        const addedResponse = await request(app).post('/books').send(book);
        await request(app).post('/loans').send({ bookId: addedResponse.body.id });

        const response = await request(app)
            .post('/returns')
            .send({ bookId: addedResponse.body.id });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Return successful' });
    });
});
