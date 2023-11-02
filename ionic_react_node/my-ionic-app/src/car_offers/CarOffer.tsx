import React from 'react';
import {IonItem, IonCard, IonCardTitle, IonCardContent, IonCardHeader, IonCardSubtitle, IonLabel, IonItemSliding, IonItemOptions, IonItemOption} from '@ionic/react';
import {CarOfferProps} from "./CarOfferProps";


interface CarOfferPropsExt extends CarOfferProps {
    onEdit: (_id?: string) => void;
}

const CarOffer: React.FC<CarOfferPropsExt> = ({
    _id, model, make, year, description, date, isAvailable, onEdit
}) => {
    return (
        <IonItemSliding>
            <IonItem>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>{model}</IonCardTitle>
                        <IonCardSubtitle>{make} - {year}</IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {description}
                        <br/>
                        {isAvailable && <p>Is available</p>}
                        {!isAvailable && <p>Is no longer available</p>}
                        {date && <p>Date posted: {new Date(date).toLocaleDateString()}</p>}
                    </IonCardContent>
                </IonCard>
            </IonItem>
            <IonItemOptions>
                <IonItemOption  onClick={() => onEdit(_id)}>Edit</IonItemOption>
                <IonItemOption color="danger">Delete</IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};

export default CarOffer;