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
    IonItem,
    IonImg,
    IonFab,
    IonFabButton,
    IonIcon,
    IonList,
    IonLabel,

} from '@ionic/react';
import {getLogger} from "../core";
import {CarOfferContext} from "./CarOfferProvider";
import { RouteComponentProps } from 'react-router';
import {CarOfferProps} from "./CarOfferProps";
import {usePhotos} from "../pages/usePhotos";
import { camera } from 'ionicons/icons';
import MyMap from "../maps/MyMap";
import {useMyLocation} from "../pages/useMyLocation";

const log = getLogger('CarOfferEdit');

interface CarOfferEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const CarOfferEdit: React.FC<CarOfferEditProps> = ({history, match}) => {
    const {offers, saving, savingError, saveOffer} = useContext(CarOfferContext);
    const myLocation = useMyLocation()
    const {photos, takePhoto, deletePhoto} = usePhotos();
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState(0);
    const [description, setDescription] = useState('');
    const [isAvailable, setIsAvailable] = useState(false);
    const [photoPath, setPhotoPath] = useState("");
    const [latitude, setLatitude] = useState(myLocation.position? myLocation.position.coords.latitude : 46.77294256474928);
    const [longitude, setLongitude] = useState(myLocation.position? myLocation.position.coords.longitude : 23.620521050728307);
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
            setPhotoPath(offer.photoPath);
            setLongitude(offer.longitude);
            setLatitude(offer.latitude);
        }
    }, [match.params.id, offers]);
    const [photoTaken, setPhotoTaken] = useState(false);
    useEffect(() => {
        if (photoTaken) {
            setPhotoPath(photos && photos[0] && photos[0].webviewPath ? photos[0].webviewPath : "");
        }
    }, [photoTaken, photos])
    const handleSave = useCallback(() => {
        const editedOffer = offer ? {...offer, make, model, year, description, isAvailable, photoPath, latitude, longitude} : {make, model, year, description, isAvailable, photoPath, latitude, longitude};
        saveOffer && saveOffer(editedOffer).then(() => history.goBack());
    }, [offer, saveOffer, make, model, year, description, isAvailable, photoPath, history, latitude, longitude]);
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
                <IonItem>
                    <IonImg style={{ width: "400px", height: "400px", margin: "0 auto" }} alt={"Add a photo"} src={photoPath} />
                </IonItem>
                <IonButton onClick = {() => setPhotoPath('')}>Delete photo</IonButton>
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={async () => {
                        takePhoto().then(() => {
                            console.log('photo taken')
                            setPhotoTaken(true);
                        });
                    }}>
                        <IonIcon icon={camera} />
                    </IonFabButton>
                </IonFab>

                <IonList>
                    <IonItem>
                        <IonLabel color="dark">Location of the offer:</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel color="dark">Latitude: {latitude}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel color="dark">Longitude: {longitude}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <MyMap
                            lat={latitude}
                            lng={longitude}
                            onMapClick={ev => {
                                console.log(ev);
                                setLatitude(ev.latitude);
                                setLongitude(ev.longitude);
                            }}
                            onMarkerClick={ev => console.log(ev)}
                        />
                    </IonItem>
                </IonList>
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save offer'}</div>
                )}
            </IonContent>
        </IonPage>
    )
}

export default CarOfferEdit;