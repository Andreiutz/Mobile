import React from 'react';
import {IonItem, IonCard, IonCardTitle, IonCardContent, IonCardHeader, IonCardSubtitle, IonLabel,
    IonItemSliding, IonItemOptions, IonItemOption, IonGrid, IonRow, IonCol} from '@ionic/react';
import {CarOfferProps} from "./CarOfferProps";


interface CarOfferPropsExt extends CarOfferProps {
    onEdit: (_id?: string) => void;
}

const CarOffer: React.FC<CarOfferPropsExt> = ({
    _id, model, make, year, description, date, isAvailable, photoPath, onEdit
}) => {
    return (
        <IonItemSliding>
            <IonItem>
                <IonCard className="ion-text-center">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="4">
                                <img src={photoPath} alt="Car" style={{ width: '100%' }} />
                            </IonCol>
                            <IonCol size="8">
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
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCard>
            </IonItem>
            <IonItemOptions>
                <IonItemOption  onClick={() => onEdit(_id)}>Edit</IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};

export default CarOffer;