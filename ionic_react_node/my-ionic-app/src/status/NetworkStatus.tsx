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
                    Connected
                </IonItem>
            }
            {
                !networkStatus.connected &&
                <IonItem>
                    Not Connected
                </IonItem>
            }
            {
                appState.isActive &&
                <IonItem>Active</IonItem>
            }
            {
                !appState.isActive &&
                <IonItem>Not active</IonItem>
            }
        </div>
    )
}

export default NetworkStatus