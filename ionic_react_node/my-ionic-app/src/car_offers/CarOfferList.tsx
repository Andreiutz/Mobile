import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonSearchbar,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRow,
    IonCheckbox
} from '@ionic/react';
import { add } from 'ionicons/icons';
import CarOffer from "./CarOffer";
import {getLogger} from "../core";
import {CarOfferContext} from "./CarOfferProvider";
import NetworkStatus from "../status/NetworkStatus";
import {AuthContext} from "../auth";
import {CarOfferProps} from "./CarOfferProps";

const log = getLogger('OfferList');

const CarOfferList: React.FC<RouteComponentProps> = ({history}) => {
    const {offers, fetching, fetchingError} = useContext(CarOfferContext);
    const [searchbar, setSearchbar] = useState<string>('');
    const [justAvailableCheckBox, setJustAvailableCheckBox] = useState<boolean>(false);
    const {logout} = useContext(AuthContext)
    const [disableInfiniteScroll, setDisabledInfiniteScroll] = useState<boolean>(false);
    const [shownItems, setShownItems] = useState<CarOfferProps[]>([])

    useEffect(() => {
        if (offers !== undefined) {
            fetchData(true);
        }
    }, [offers])

    useEffect(() => {
    }, [shownItems])

    useEffect(() => {
        setDisabledInfiniteScroll(false);
        fetchData(true)
    }, [searchbar, justAvailableCheckBox])

    function fetchData(refresh: boolean) {
        if (offers === undefined) {
            return;
        }
        let myItems = offers ?? []
        let search = searchbar.trim().toLowerCase()
        if (search !== "") {
            myItems = myItems.filter(item => item.make.toLowerCase().indexOf(search) >= 0 || item.model.toLowerCase().indexOf(search) >= 0)
        }
        if (justAvailableCheckBox) {
            myItems = myItems.filter(item => item.isAvailable)
        }

        let chunk = 4;
        let current;
        if (refresh) {
            current = 0;
        } else {
            current = shownItems.length;
        }
        let startIndex = current;
        let endIndex = current + chunk;
        let totalItems = myItems.length;
        if (endIndex > totalItems) {
            endIndex = totalItems;
        }
        //if more items
        if (startIndex < endIndex) {
            if (refresh) {
                setShownItems(myItems.slice(startIndex, endIndex));
            } else {
                // log("Adding the items ", myItems.slice(startIndex, endIndex), "to ", shownItems)
                setShownItems([...shownItems, ...myItems.slice(startIndex, endIndex)]);
            }
            setDisabledInfiniteScroll(false);
        } else {
            if (refresh) {
                setShownItems([])
                setDisabledInfiniteScroll(false)
            }
            else {
                setDisabledInfiniteScroll(true)
            }
        }
    }

    function searchNext($event: CustomEvent<void>) {
        fetchData(false);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    log('render', fetching);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Car Offers</IonTitle>
                    <NetworkStatus/>
                    <IonButtons slot="end">
                        <IonButton onClick={e => {
                            logout && logout()
                        }}>Logout</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items" />
                <IonCheckbox labelPlacement="start"
                             value={justAvailableCheckBox}
                             onIonChange={e => {setJustAvailableCheckBox(e.detail.checked)}}>
                    Only available
                </IonCheckbox>
                <IonSearchbar
                    value={searchbar}
                    debounce={1000}
                    onIonChange={e => {
                        setSearchbar(e.detail.value!)
                    }
                    }>
                </IonSearchbar>
                {offers && (
                    <IonList>
                        {shownItems.map(({_id, make, model, year, description, isAvailable, date}) =>
                            <CarOffer key={_id} _id={_id} make={make} model={model} year={year} description={description}
                                      isAvailable={isAvailable} date={date}
                                      onEdit={id => history.push(`/offer/${id}`)} />
                        )}
                        <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                           onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                            <IonInfiniteScrollContent
                                loadingText="Loading more books...">
                            </IonInfiniteScrollContent>
                        </IonInfiniteScroll>
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch offers'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push(`/offer`)}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    )
}

export default CarOfferList;