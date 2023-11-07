import axios from 'axios'
import {authConfig, baseUrl, getLogger, withLogs} from "../core";
import {CarOfferProps} from "./CarOfferProps";
import { Preferences } from '@capacitor/preferences';
import {v4 as uuidv4} from 'uuid'

const offerUrl = `http://${baseUrl}/api/offers`;

export const getOffers: (token: string) => Promise<CarOfferProps[]> = token => {
    return withLogs(axios.get(offerUrl, authConfig(token)), 'getOffers');
}

export const postOfferOnline: (token: string, offer: CarOfferProps) => Promise<CarOfferProps[]> = (token, offer) => {
    return withLogs(axios.post(offerUrl, offer, authConfig(token)), 'postOffer');
}

export const postOffer: (token: string, offer: CarOfferProps, connected: boolean) => Promise<CarOfferProps[]> = (token, offer, connected) => {
    function offlineActionGenerator() {
        return new Promise<CarOfferProps[]>(async (resolve) => {
            offer._id = uuidv4();
            await Preferences.set({
                key: `save-${offer._id}`,
                value: JSON.stringify({
                    token,
                    offer
                })
            })
            alert("Saved locally")
            // @ts-ignore
            resolve(offer)
        })
    }
    if (connected) {
        return postOfferOnline(token, offer)
            .catch(e => {
                return offlineActionGenerator()
            })
    } else {
        return offlineActionGenerator();
    }
}

export const updateOfferOnline: (token: string, offer: CarOfferProps) => Promise<CarOfferProps[]> = (token, offer) => {
    return withLogs(axios.put(`${offerUrl}/${offer._id}`, offer, authConfig(token)), 'updateOffer');
}

export const updateOffer: (token: string, offer: CarOfferProps, connected: boolean) => Promise<CarOfferProps[]> = (token, offer, connected) => {
    function offlineActionGenerator() {
        return new Promise<CarOfferProps[]>(async (resolve) => {
            await Preferences.set({
                key: `update-${offer._id}`,
                value: JSON.stringify({
                    token,
                    offer
                })
            })
            alert("Saved locally")
            // @ts-ignore
            resolve(offer)
        })
    }
    if (connected) {
        return updateOfferOnline(token, offer)
            .catch(e => {
                return offlineActionGenerator()
            });
    } else {
        return offlineActionGenerator();
    }
}

export const trySaveLocalStorage: () => Promise<void> = () => {
    return new Promise<void>(async (resolve) => {
        log('Trying to save local storage')
        let count = 0;
        let {keys} = await Preferences.keys();
        // console.log(keys)
        for (const key of keys) {
            try {
                if (key.startsWith('save')) {
                    count++;
                    const value = JSON.parse((await Preferences.get({key: key})).value!!)
                    log(value.offer)
                    await postOfferOnline(value.token, value.offer)
                    await Preferences.remove({key: key})
                } else if (key.startsWith('update')) {
                    count++;
                    const value = JSON.parse((await Preferences.get({key: key})).value!!)
                    log(value.offer)
                    await updateOfferOnline(value.token, value.offer)
                    await Preferences.remove({key:key})
                }
            } catch (e) {
                log(e)
                throw e
            }
        }
        log(`Saved ${count} offers online`)
        resolve()
    });
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