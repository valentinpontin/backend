import { CartsDaoFactory, MessagesDaoFactory, ProductsDaoFactory, TicketsDaoFactory, UsersDaoFactory } from '../dao/factory.js';
import ProductsRepository from './products.repository.js';
import MessagesRepository from './messages.repository.js';
import CartsRepository from './carts.repository.js';
import TicketsRepository from './tickets.repository.js';
import UsersRepository from './users.repository.js';

const cartsManager = CartsDaoFactory.getDao();
const messagesManager = MessagesDaoFactory.getDao();
const productsManager = ProductsDaoFactory.getDao();
const ticketsManager = TicketsDaoFactory.getDao();
const usersManager = UsersDaoFactory.getDao();

export const productsRepository = new ProductsRepository(productsManager);
export const messagesRepository = new MessagesRepository(messagesManager);
export const cartsRepository = new CartsRepository(cartsManager);
export const ticketsRepository = new TicketsRepository(ticketsManager);
export const usersRepository = new UsersRepository(usersManager);