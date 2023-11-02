import axios from 'axios'
import {authConfig, baseUrl, getLogger, withLogs} from "../core";
import {CarOfferProps} from "./CarOfferProps";

const offerUrl = `http://${baseUrl}/api/offers`;

export const getOffers: (token: string) => Promise<CarOfferProps[]> = token => {
    return withLogs(axios.get(offerUrl, authConfig(token)), 'getOffers');
}

export const postOffer: (token: string, offer: CarOfferProps) => Promise<CarOfferProps[]> = (token, offer) => {
    return withLogs(axios.post(offerUrl, offer, authConfig(token)), 'postOffer');
}

export const updateOffer: (token: string, offer: CarOfferProps) => Promise<CarOfferProps[]> = (token, offer) => {
    return withLogs(axios.put(`${offerUrl}/${offer._id}`, offer, authConfig(token)), 'updateOffer');
}

interface MessageData {
    type: string;
    payload: CarOfferProps;
}

const log = getLogger('ws')

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}