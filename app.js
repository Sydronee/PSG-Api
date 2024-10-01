const express=require('express');
const bodyParser=require('body-parser');

const app=express();
const PORT=process.env.PORT || 3000;

app.use(bodyParser.json());

let books=[{
    "id": 1,
    "title": "1984",
    "author": "George Orwell",
    "genre": "Fiction",
    "publication_date": "1949-06-08",
    "price": 12.99
  },
{
    "id": 2,
    "title": "Animal Farm",
    "author": "George Orwell",
    "genre": "Fiction",
    "publication_date": "1945-08-17",
    "price": 9.99
  }
];
let nextId=1;

const paginate=(items, page, limit) =>{
    const startIndex=(page - 1) * limit;
    const endIndex=startIndex + limit;
    const result={};

    if(endIndex < items.length){
        result.next_page='http://localhost:${PORT}/books?page=${page + 1}&limit=${limit}';
    }
    else{
        result.next_page=null;
    }

    if(startIndex > 0){
        result.previous_page='http://localhost:${PORT}/books?page=${page - 1}&limit=${limit}';
    }
    else{
        result.previous_page=null;
    }

    result.current_page=page;
    result.total_books=items.length;
    result.total_pages=Math.ceil(items.length / limit);
    result.books=items.slice(startIndex, endIndex);
    
    return result;
};

// GET /books
app.get('/books', (req, res) =>{
    const{ genre, author, page=1, limit=10 }=req.query;
    let filteredBooks=books;

    if (genre){
        filteredBooks=filteredBooks.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
    }

    if (author){
        filteredBooks=filteredBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());
    }

    const paginatedBooks=paginate(filteredBooks, parseInt(page), parseInt(limit));
    res.json(paginatedBooks);
});

// GET /books/{id}
app.get('/books/:id', (req, res) =>{
    const book=books.find(b => b.id === parseInt(req.params.id));
    if (!book){
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
});

// POST /books
app.post('/books', (req, res) =>{
    const{ title, author, genre, publication_date, price }=req.body;

    if (!author){
        return res.status(400).json({ message: 'Author' });
    }
    if (!title ){
        return res.status(400).json({ message: 'Title' });
    }
    if (!genre){
        return res.status(400).json({ message: 'Genre' });
    }
    if (!publication_date){
        return res.status(400).json({ message: 'Date' });
    }
    if (!price){
        return res.status(400).json({ message: 'Price' });
    }

    const newBook={
        id: nextId++,
        title,
        author,
        genre,
        publication_date,
        price
    };

    books.push(newBook);
    res.status(201).json({ message: 'Book added successfully', book: newBook });
});

app.put('/books/:id', (req, res) =>{
    const book=books.find(b => b.id === parseInt(req.params.id));
    console.log(req);
    if (!book){
        return res.status(404).json({ message: 'Book not found' });
    }

    const{ title, author, genre, publication_date, price }=req.body;
    // const{price}=req.body;
    if (title) book.title=title;
    if (author) book.author=author;
    if (genre) book.genre=genre;
    if (publication_date) book.publication_date=publication_date;
    if (price) book.price=price;

    res.json({ message: 'Book updated successfully', book });
});

app.delete('/books/:id', (req, res) =>{
    const bookIndex=books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1){
        return res.status(404).json({ message: 'Book not found' });
    }

    books.splice(bookIndex, 1);
    res.json({ message: 'Book deleted successfully' });
});

app.listen(PORT, () =>{
    console.log("Server Listening on PORT:", PORT);
});



