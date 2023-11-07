import {useNetwork} from "./useNetwork";
import React from 'react';
import {IonItem} from '@ionic/react';
import {useAppState} from "./useAppState";

const NetworkStatus: React.FC = () => {
    const {networkStatus} = useNetwork();
    const {appState} = useAppState();
    return (
        <div>
            {
                networkStatus.connected &&
                <IonItem>
                    Online
                </IonItem>
            }
            {
                !networkStatus.connected &&
                <IonItem>
                    Offline
                </IonItem>
            }
        </div>
    )
}

export default NetworkStatus