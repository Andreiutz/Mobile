import React, { useContext, useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import {CarOfferProps} from "./CarOfferProps";
import {postOffer, getOffers, newWebSocket, updateOffer} from "./CarOfferApi";
import {AuthContext} from "../auth";

const log = getLogger('CarOfferProvider');

type SaveOfferFn = (offer: CarOfferProps) => Promise<any>;

export interface CarOffersState {
    offers?: CarOfferProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null;
    saveOffer?: SaveOfferFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: CarOffersState = {
    fetching: false,
    saving: false,
}

const FETCH_OFFERS_STARTED = 'FETCH_OFFERS_STARTED';
const FETCH_OFFERS_SUCCEEDED = 'FETCH_OFFERS_SUCCEEDED';
const FETCH_OFFERS_FAILED = 'FETCH_OFFERS_FAILED';
const SAVE_OFFER_STARTED = 'SAVE_OFFER_STARTED';
const SAVE_OFFER_SUCCEEDED = 'SAVE_OFFER_SUCCEEDED';
const SAVE_OFFER_FAILED = 'SAVE_OFFER_FAILED';

const reducer: (state: CarOffersState, action: ActionProps) => CarOffersState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_OFFERS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_OFFERS_SUCCEEDED:
                return {...state, offers: payload.offers, fetching: false};
            case FETCH_OFFERS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_OFFER_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_OFFER_SUCCEEDED:
                const offers = [...(state.offers || [])];
                const offer = payload.offer;
                const index = offers.findIndex(it => it._id === offer._id);
                if (index === -1) {
                    offers.splice(0, 0, offer);
                } else {
                    offers[index] = offer;
                }
                return {...state, offers, saving: false};
            case SAVE_OFFER_FAILED:
                return {...state, savingError: payload.error, saving: false};
            default:
                return state;
        }
    };

export const CarOfferContext = React.createContext<CarOffersState>(initialState);

interface CarOfferProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const CarOfferProvider: React.FC<CarOfferProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {offers, fetching, fetchingError, saving, savingError } = state;
    useEffect(getOffersEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveOffer = useCallback<SaveOfferFn>(saveOfferCallback, [token]);
    const value = {offers, fetching, fetchingError, saving, saveOffer};
    log('returns');
    return (
        <CarOfferContext.Provider value={value}>
            {children}
        </CarOfferContext.Provider>
    );
    function getOffersEffect() {
        let canceled = false;
        if (token) {
            fetchOffers();
        }
        return () => {
            canceled = true;
        }

        async function fetchOffers() {
            try {
                log('fetchOffers started');
                dispatch({type: FETCH_OFFERS_STARTED});
                const offers = await getOffers(token);
                log('fetchOffers succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_OFFERS_SUCCEEDED, payload: {offers}});
                }
            } catch (error) {
                log('fetchOffers failed');
                if (!canceled) {
                    dispatch({type: FETCH_OFFERS_FAILED, payload: {error}});
                }
            }
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token,message => {
                if (canceled) {
                    return;
                }
                const {type, payload: offer} = message;
                log(`ws message, offer ${event}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_OFFER_SUCCEEDED, payload: {offer}});
                }
            });
            return () => {
                log('wsEffect - disconnecting');
                canceled = true;
                closeWebSocket();
            }
        }
    }

    async function saveOfferCallback(offer: CarOfferProps) {
        try {
            // console.log(offer)
            dispatch({type: SAVE_OFFER_STARTED});
            const savedOffer = await (offer._id ? updateOffer(token, offer) : postOffer(token, offer));
            log('saveOffer succeeded');
            dispatch({type: SAVE_OFFER_SUCCEEDED, payload: {offer: savedOffer}});
        } catch (error) {
            log('saveOffer failed');
            dispatch({type: SAVE_OFFER_FAILED, payload: {error}});
        }
    }
}