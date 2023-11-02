import React, { useContext } from 'react';
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
    IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import CarOffer from "./CarOffer";
import {getLogger} from "../core";
import {CarOfferContext} from "./CarOfferProvider";
import NetworkStatus from "../status/NetworkStatus";

const log = getLogger('OfferList');

const CarOfferList: React.FC<RouteComponentProps> = ({history}) => {
    const {offers, fetching, fetchingError} = useContext(CarOfferContext);
    log('render', fetching);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Car Offers</IonTitle>
                    <NetworkStatus/>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items" />
                {offers && (
                    <IonList>
                        {offers.map(({_id, make, model, year, description, isAvailable, date}) =>
                            <CarOffer key={_id} _id={_id} make={make} model={model} year={year} description={description}
                                      isAvailable={isAvailable} date={date}
                                      onEdit={id => history.push(`/offer/${id}`)} />
                        )}
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