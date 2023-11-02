import Router from 'koa-router'
import dataStore from 'nedb-promise';
import { broadcast } from './wss.js';

export class OfferStore {
    constructor({filename, autoload}) {
        this.store = dataStore({filename, autoload});
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(offer) {
        let errorMessage = ""
        if (!offer.model) {
            errorMessage += "Model missing!\n";
        }
        if (!offer.make) {
            errorMessage += "Make missing!\n";
        }
        if (!offer.year) {
            errorMessage += "Year missing!\n";
        }
        if (errorMessage.length !== 0) {
            throw new Error(errorMessage);
        }
        offer.date = new Date(Date.now())
        return this.store.insert(offer);
    };

    async update(props, offer) {
        return this.store.update(props, offer);
    }

    async remove(props) {
        return this.store.remove(props);
    }
}

const offerStore = new OfferStore({filename : './db/offers.json', autoload : true});

export const offerRouter = new Router();

offerRouter.get('/', async (ctx) => {
    const userId = ctx.state.user._id;
    console.log(userId)
    ctx.response.body = await offerStore.find({ userId });
    ctx.response.status = 200; // ok
});

offerRouter.get('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const offer = await offerStore.findOne({ _id: ctx.params.id });
    const response = ctx.response;
    if (offer) {
        if (offer.userId === userId) {
            ctx.response.body = offer;
            ctx.response.status = 200; // ok
        } else {
            ctx.response.status = 403; // forbidden
        }
    } else {
        ctx.response.status = 404; // not found
    }
});

const createOffer = async (ctx, offer, response) => {
    try {
        const userId = ctx.state.user._id;
        offer.userId = userId;
        response.body = await offerStore.insert(offer);
        response.status = 201; // created
        broadcast(userId, { type: 'created', payload: offer });
    } catch (err) {
        response.body = { message: err.message };
        response.status = 400; // bad request
    }
};

offerRouter.post('/', async ctx => await createOffer(ctx, ctx.request.body, ctx.response));

offerRouter.put('/:id', async ctx => {
    const offer = ctx.request.body;
    const id = ctx.params.id;
    const offerId = offer._id;
    const response = ctx.response;
    if (offerId && offerId !== id) {
        response.body = { message: 'Param id and body _id should be the same' };
        response.status = 400; // bad request
        return;
    }
    if (!offerId) {
        await createOffer(ctx, offer, response);
    } else {
        const userId = ctx.state.user._id;
        offer.userId = userId;
        const updatedCount = await offerStore.update({ _id: id }, offer);
        if (updatedCount === 1) {
            response.body = offer;
            response.status = 200; // ok
            broadcast(userId, { type: 'updated', payload: offer });
        } else {
            response.body = { message: 'Resource no longer exists' };
            response.status = 405; // method not allowed
        }
    }
});

offerRouter.del('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const offer = await offerStore.findOne({ _id: ctx.params.id });
    if (offer && userId !== offer.userId) {
        ctx.response.status = 403; // forbidden
    } else {
        await offerStore.remove({ _id: ctx.params.id });
        ctx.response.status = 204; // no content
    }
});