import http from 'http';
import Koa from 'koa';
import WebSocket from 'ws';
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";
import jwt from 'koa-jwt';
import cors from '@koa/cors';
import { jwtConfig, timingLogger, exceptionHandler } from './utils.js';
import { initWss } from './wss.js';
import { offerRouter } from './offer.js';
import { authRouter } from './auth.js';

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });
initWss(wss);

app.use(cors());
app.use(timingLogger);
app.use(exceptionHandler);
app.use(bodyParser());

const prefix = '/api';

// public
const publicApiRouter = new Router({ prefix });
publicApiRouter
    .use('/auth', authRouter.routes());
app
    .use(publicApiRouter.routes())
    .use(publicApiRouter.allowedMethods());

app.use(jwt(jwtConfig));

// protected
const protectedApiRouter = new Router({ prefix });
protectedApiRouter
    .use('/offers', offerRouter.routes());
app
    .use(protectedApiRouter.routes())
    .use(protectedApiRouter.allowedMethods());

server.listen(3000);
console.log('started on port 3000');
















//
//
//
//
// app.use(async (ctx, next) => {
//   const start = new Date();
//   await next();
//   const ms = new Date() - start;
//   console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
// });
//
// app.use(async (ctx, next) => {
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   await next();
// });
//
// app.use(async (ctx, next) => {
//   try {
//     await next();
//   } catch (err) {
//     ctx.response.body = { issue: [{ error: err.message || 'Unexpected error' }] };
//     ctx.response.status = 500;
//   }
// });
//
// class CarOffer {
//   constructor({ id, make, model, year, description, date, isAvailable }) {
//     this.id = id;
//     this.make = make;
//     this.model = model;
//     this.year = year;
//     this.description = description;
//     this.date = date;
//     this.isAvailable = isAvailable;
//   }
// }
//
// const offers = [];
// for (let i = 0; i < 3; i++) {
//   offers.push(new CarOffer({
//     id: `${i}`,
//     model: `model ${i}`,
//     make: `make ${i}`,
//     year: 2023,
//     description: `description: #${i}`,
//     date: new Date(Date.now() + i),
//     isAvailable: true,
//   }));
// }
// let lastId = offers[offers.length - 1].id;
// const pageSize = 10;
//
// const broadcast = data =>
//   wss.clients.forEach(client => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(data));
//     }
//   });
//
// const router = new Router();
//
// router.get('/offers', ctx => {
//   ctx.response.body = offers;
//   ctx.response.status = 200;
// });
//
// router.get('/offers/:id', async (ctx) => {
//   const offerId = ctx.request.params.id;
//   const offer = offers.find(offer => offerId === offer.id);
//   if (offer) {
//     ctx.response.body = offer;
//     ctx.response.status = 200; // ok
//   } else {
//     ctx.response.body = { message: `Offer with id ${offerId} not found` };
//     ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
//   }
// });
//
// const createOffer = async (ctx) => {
//   const offer = ctx.request.body;
//   console.log(offer)
//   if (!offer.make || !offer.model || !offer.year || !offer.description) { // validation
//     ctx.response.body = { message: 'Text is missing' };
//     ctx.response.status = 400; //  BAD REQUEST
//     return;
//   }
//   lastId = `${parseInt(lastId) + 1}`;
//   offer.id = `${lastId}`;
//   offer.date = new Date(Date.now());
//   console.log(offer);
//   offers.push(offer);
//   ctx.response.body = offer;
//   ctx.response.status = 201; // CREATED
//   broadcast({ event: 'created', payload: { offer: offer } });
// };
//
// router.post('/offers', async (ctx) => {
//   await createOffer(ctx);
// });
//
// router.put('/offers/:id', async (ctx) => {
//   const id = ctx.params.id;
//   const offer = ctx.request.body;
//   const itemId = offer.id;
//   if (itemId && id !== offer.id) {
//     ctx.response.body = { message: `Param id and body id should be the same` };
//     ctx.response.status = 400; // BAD REQUEST
//     return;
//   }
//   if (!offer.make || !offer.model || !offer.year || !offer.description) { // validation
//     ctx.response.body = { message: 'Text is missing' };
//     ctx.response.status = 400; //  BAD REQUEST
//     return;
//   }
//   if (!itemId) {
//     await createOffer(ctx);
//     return;
//   }
//   const index = offers.findIndex(item => item.id === id);
//   if (index === -1) {
//     ctx.response.body = { issue: [{ error: `item with id ${id} not found` }] };
//     ctx.response.status = 400; // BAD REQUEST
//     return;
//   }
//   offers[index] = offer;
//   ctx.response.body = offer;
//   ctx.response.status = 200; // OK
//   console.log(offer)
//   broadcast({ event: 'updated', payload: { offer: offer } });
// });
//
// router.del('/offers/:id', ctx => {
//   const id = ctx.params.id;
//   const index = offers.findIndex(item => id === item.id);
//   if (index !== -1) {
//     const item = offers[index];
//     offers.splice(index, 1);
//     lastUpdated = new Date();
//     broadcast({ event: 'deleted', payload: { offer:item } });
//   }
//   ctx.response.status = 204; // no content
// });
//
// // setInterval(() => {
// //   lastUpdated = new Date();
// //   lastId = `${parseInt(lastId) + 1}`;
// //   const item = new CarOffer({ id: lastId, text: `item ${lastId}`, date: lastUpdated, version: 1 });
// //   offers.push(item);
// //   console.log(`New item: ${item.text}`);
// //   broadcast({ event: 'created', payload: { item } });
// // }, 5000);
//
// app.use(router.routes());
// app.use(router.allowedMethods());
//
// server.listen(3000);
