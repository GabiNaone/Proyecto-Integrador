import express from 'express';
import config from './config.js';
import routerProducts from './router/products.js';

const app = express();

app.use(express.static('public', {extensions: ['html','htm']}));
app.use(express.urlencoded({extended: true}));
app.use(express.json());


// Caso de uso Products
app.use('/api/products', routerProducts);

const PORT = config.PORT

const server = app.listen(PORT, () => console.log(`Conectado al puerto ${PORT}`));
server.on('error', error => console.log('Error al iniciar express' + error.message));