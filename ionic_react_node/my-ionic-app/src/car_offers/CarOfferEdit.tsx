import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonTextarea ,
    IonCheckbox,
} from '@ionic/react';
import {getLogger} from "../core";
import {CarOfferContext} from "./CarOfferProvider";
import { RouteComponentProps } from 'react-router';
import {CarOfferProps} from "./CarOfferProps";

const log = getLogger('CarOfferEdit');

interface CarOfferEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const CarOfferEdit: React.FC<CarOfferEditProps> = ({history, match}) => {
    const {offers, saving, savingError, saveOffer} = useContext(CarOfferContext);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState(0);
    const [description, setDescription] = useState('');
    const [isAvailable, setIsAvailable] = useState(false);
    const [offer, setOffer] = useState<CarOfferProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const offer = offers?.find(it => it._id === routeId);
        setOffer(offer);
        if (offer) {
            setMake(offer.make);
            setModel(offer.model);
            setYear(offer.year);
            setDescription(offer.description);
            setIsAvailable(offer.isAvailable);
        }
    }, [match.params.id, offers]);
    const handleSave = useCallback(() => {
        const editedOffer = offer ? {...offer, make, model, year, description, isAvailable} : {make, model, year, description, isAvailable};
        saveOffer && saveOffer(editedOffer).then(() => history.goBack());
    }, [offer, saveOffer, make, model, year, description, isAvailable, history]);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput label="Make" value={make} onIonChange={e => setMake(e.detail.value || '')}/>
                <IonInput label="Model" value={model} onIonChange={e => setModel(e.detail.value || '')}/>
                <IonInput type="number" label="Year" value={year} onIonChange={e => setYear(Number(e.detail.value) || 0)}/>
                <IonInput label="Description" value={description} onIonChange={e => setDescription(e.detail.value || '')}/>
                <IonCheckbox labelPlacement="start" checked={isAvailable} onIonChange={e => setIsAvailable(e.detail.checked)}>Is available:</IonCheckbox>
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save offer'}</div>
                )}
            </IonContent>
        </IonPage>
    )
}

export default CarOfferEdit;